import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CONTENT_ANGLES, ContentAngle, IndustryContentRaw, Language, PlatformContentRaw } from './ai.types';

const ANGLE_GUIDANCE: Record<
  ContentAngle,
  { name: string; description: string; postTone: string; imageHint: string; socialCta: string }
> = {
  educational: {
    name: 'Educational',
    description: 'Share a useful, generally-applicable industry insight, tip, fact, or common misconception that ANY business in this industry could repost. Position the poster as someone who knows the industry.',
    postTone: 'helpful, authoritative, value-first',
    imageHint: 'Show a process, technique, tools of the trade, or a detailed close-up that visualises the industry topic',
    socialCta: 'Ends with a social engagement action: "Volg voor meer tips", "Sla deze post op", "Deel met iemand die dit moet weten", or a question to drive comments.',
  },
  engagement: {
    name: 'Engagement',
    description: 'Spark interaction with a question, poll-style prompt, "this or that", relatable observation, or fill-in-the-blank — designed to drive comments, shares, and saves.',
    postTone: 'conversational, curious, community-driven',
    imageHint: 'Show an atmospheric, relatable, or visually intriguing industry scene that complements the question',
    socialCta: 'The post itself IS the CTA — invites the reader to comment, vote, or share their answer/story.',
  },
  inspiration: {
    name: 'Inspiration',
    description: 'Eye-catching, aspirational, trend-aware, or seasonal industry content that drives discovery, follows, and saves. Think: trends in the industry, beautiful examples of the craft, "moments that capture this work", seasonal hooks. NOT a service pitch.',
    postTone: 'evocative, scroll-stopping, lifestyle-aspirational',
    imageHint: 'Show a striking, premium, magazine-quality industry shot — finished work, aesthetic moments, or cinematic atmosphere',
    socialCta: 'Ends with a social engagement action: "Volg voor meer", "Sla op voor inspiratie", "Tag iemand", or "Welke is jouw favoriet?". NEVER a service pitch.',
  },
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly dalleModel: string;
  private readonly dalleQuality: 'standard' | 'hd';

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      timeout: 180_000,
    });
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-5.1');
    this.dalleModel = this.configService.get<string>('app.dalleModel', 'dall-e-3');
    this.dalleQuality = this.configService.get<string>('app.dalleQuality', 'standard') as 'standard' | 'hd';
  }

  async generateReadyContent(
    industry: string,
    platforms: string[],
    language: Language = Language.NL,
  ): Promise<IndustryContentRaw> {
    const t0 = Date.now();
    const expectedTotal = platforms.length * CONTENT_ANGLES.length;
    this.logger.log(
      `Generating content for "${industry}" — ${CONTENT_ANGLES.length} parallel calls (model: ${this.model}, ${platforms.length} platforms × ${CONTENT_ANGLES.length} angles = ${expectedTotal} items)`,
    );

    const results = await Promise.all(
      CONTENT_ANGLES.map((angle) => this.generateForAngle(industry, platforms, angle, language)),
    );

    const combined: PlatformContentRaw[] = results.flat();
    const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);
    this.logger.log(
      `Generated ${combined.length}/${expectedTotal} content pieces for "${industry}" in ${elapsedSec}s (parallel)`,
    );

    return { industry, content: combined };
  }

  private async generateForAngle(
    industry: string,
    platforms: string[],
    angle: ContentAngle,
    language: Language,
  ): Promise<PlatformContentRaw[]> {
    const t0 = Date.now();
    const expected = platforms.length;
    const guidance = ANGLE_GUIDANCE[angle];

    const systemPrompt = `You are a social media content creator producing INDUSTRY-RELEVANT, BUSINESS-AGNOSTIC posts. Generate ONE ready-to-post piece of content for EACH of these platforms: ${platforms.join(', ')}.

That is ${expected} pieces total — exactly one per platform.

# CONTEXT — READ CAREFULLY
You only know the INDUSTRY ("${industry}") — nothing else about the business posting this content. You DO NOT know:
- The business's specific services, products, or specialities
- Their pricing, offers, discounts, packages, hours, location, or contact details
- Their team size, credentials, years of experience, or unique differentiators
- Whether the business is the industry primary (e.g. an accountant) or industry-adjacent (e.g. accounting software, accounting recruiter, accounting trainer, supplier to accountants)

The same post will be sent to MANY different businesses in this industry. It must work for ALL of them — copy-paste-ready as-is.

# GOAL
All content drives followers, engagement, saves, shares, and discovery on the business's OWN socials. We are building their audience, not pitching their services.

# ANGLE FOR THIS BATCH: ${guidance.name}
${guidance.description}

Tone: ${guidance.postTone}.
Call-to-action style: ${guidance.socialCta}

# ABSOLUTE RULES (NEVER BREAK THESE)
1. NEVER invent or imply a specific service, product, package, offer, discount, deal, sale, free consultation, intake call, demo, free check, free quote, opening hours, pricing, location, address, phone number, website, contact email, team size, certifications, years in business, awards, or any other business-specific claim. You DO NOT KNOW these.
2. NEVER write CTAs like "boek nu", "neem contact op", "klik op de link", "bel ons", "maak een afspraak", "20% korting", "gratis consult", "gratis check", "eerste maand korting", "stuur een DM", or anything that asks the reader to take action with a specific business.
3. ALL CTAs must be SOCIAL actions only: follow, save, share, tag a friend, comment your answer, like if you agree, double-tap if X, etc.
4. Speak ABOUT the industry topic, NOT AS the business. The post is generic industry content the business owner can adopt as their own voice.
5. NEVER write "wij", "ons", "onze experts", "ons team" or similar first-person-business voice. If a personal voice is needed, use "je", "jij" addressing the reader, or general industry "we" (as in "we in the industry").
6. The post may share an INDUSTRY tip, INDUSTRY observation, INDUSTRY trend, or pose an INDUSTRY question — never a business-specific claim.

# PER-PIECE FIELDS
- platform: TikTok, Instagram, Facebook, or X (English, exactly as listed)
- angle: "${angle}" (lowercase, exactly this string)
- postText: the ACTUAL post the business owner can copy and paste. Platform-appropriate length (short/punchy for X, longer for Facebook, visual-hook for Instagram/TikTok), natural line breaks, emojis where they fit. Reflects the ${guidance.name.toLowerCase()} angle. CTA inside the post (if any) must be a social action only.
- hashtags: 3-5 relevant hashtags in ${language}, without the # symbol. Use industry-relevant tags, not business-specific ones.
- callToAction: a short tip in ${language} for the BUSINESS OWNER (not for the reader of the post) — when/how to post this piece for best results (timing, audience, what image style pairs best). This field is internal advice to the owner, not part of the post.
- imagePrompt: a HIGHLY DETAILED, CREATIVE image generation prompt IN ENGLISH (minimum 3 sentences). Editorial-magazine quality.

LANGUAGE: All user-facing text (postText, hashtags, callToAction) MUST be in ${language}. Currency, if mentioned at all, is euro (€) only.

# IMAGE PROMPT REQUIREMENTS
Concept for this angle: ${guidance.imageHint}.

Quality:
- Specify exact camera angle (e.g. "shot from below at 30 degrees", "bird's eye view", "macro close-up at f/2.8")
- Specify lighting (e.g. "golden hour side-lighting", "soft diffused studio light", "dramatic rim lighting")
- Specify mood and color palette (e.g. "warm amber and deep browns", "crisp blue and white minimalist")
- Unique, editorial scene — NOT generic stock
- Vary visual approach across the ${expected} prompts in this set — different camera angles, lighting, and compositions
- Be SPECIFIC to the ${industry} industry — show unique aspects an insider would recognise
- Describe textures, materials, depth of field, reflections where relevant

Image absolute rules:
1. NEVER describe any object that contains readable text: no documents, papers, signs, screens, books, labels, forms, menus, posters, banners, business cards, packaging, notebooks, whiteboards, or any surface with writing.
2. NEVER use these words: "text", "writing", "written", "labeled", "sign", "title", "headline", "caption", "logo", "brand".
3. NEVER show a specific business identity (no storefronts with names, no branded items, no uniforms with logos).
4. If people appear: photorealistic Caucasian/Dutch, anatomically correct.
5. Currency: ONLY euro coins/bills if shown, never dollars.
6. Setting: Netherlands/Western European.
7. End every imagePrompt with: "Absolutely no text, letters, numbers, or symbols visible anywhere."

Respond in JSON format with this exact structure (the "content" array MUST contain exactly ${expected} items — one per platform):
{
  "industry": "${industry}",
  "content": [
    {
      "platform": "TikTok",
      "angle": "${angle}",
      "postText": "...",
      "hashtags": ["...", "..."],
      "callToAction": "...",
      "imagePrompt": "..."
    }
  ]
}`;

    this.logger.log(`[${industry}/${angle}] OpenAI call started — expecting ${expected} items`);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Generate today's ${guidance.name.toLowerCase()} social media posts for the ${industry} industry. ${expected} pieces total — one per platform. All post text in ${language}.`,
          },
        ],
        max_completion_tokens: 3500,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);
      const usage = completion.usage;
      const finishReason = completion.choices[0]?.finish_reason;
      this.logger.log(
        `[${industry}/${angle}] OpenAI returned in ${elapsedSec}s — finish_reason=${finishReason}, ` +
          `tokens: prompt=${usage?.prompt_tokens ?? '?'} completion=${usage?.completion_tokens ?? '?'}`,
      );

      if (finishReason === 'length') {
        this.logger.warn(`[${industry}/${angle}] hit max_tokens — JSON likely truncated`);
      }

      const raw = completion.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw) as { content?: PlatformContentRaw[] };
      const items = parsed.content ?? [];

      // Defensive: enforce angle on each item even if the model omitted it
      for (const item of items) {
        item.angle = angle;
      }

      if (items.length !== expected) {
        this.logger.warn(`[${industry}/${angle}] Got ${items.length} items, expected ${expected}`);
      } else {
        this.logger.log(`[${industry}/${angle}] Parsed ${items.length} items`);
      }

      return items;
    } catch (error: any) {
      const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);
      const status = error?.status ?? error?.response?.status;
      const code = error?.code ?? error?.error?.code;
      const message = error?.message ?? error?.error?.message ?? String(error);
      this.logger.error(
        `[${industry}/${angle}] OpenAI call failed after ${elapsedSec}s — status=${status} code=${code} message="${message}"`,
      );
      throw error;
    }
  }

  async generateImage(imagePrompt: string): Promise<string | null> {
    this.logger.log(`DALL-E generateImage called`);
    try {
      const response = await this.client.images.generate({
        model: this.dalleModel,
        prompt: `${imagePrompt}. STYLE: If the image contains people, they must be photorealistic — real human beings photographed with a professional camera, natural skin textures, real lighting. Never cartoon, illustration, 3D render, or animation for people. Non-human subjects (objects, food, interiors, landscapes) can be either photorealistic or stylized illustration. CRITICAL RULES: ABSOLUTELY ZERO text, zero words, zero letters, zero numbers, zero symbols, zero signs, zero labels, zero captions, zero watermarks, zero logos, zero typography of any kind. If currency is shown, use euro (€) only, never dollars.`,
        n: 1,
        size: '1024x1024',
        quality: this.dalleQuality,
        response_format: 'url',
      });

      const url = response.data?.[0]?.url;
      if (!url) {
        this.logger.warn('DALL-E returned no image URL');
        return null;
      }

      return url;
    } catch (error: any) {
      this.logger.error(`Image generation failed: ${error?.message || error}`);
      return null;
    }
  }
}
