import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { IndustryContentRaw, Language } from './ai.types';

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
      timeout: 60_000,
    });
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
    this.dalleModel = this.configService.get<string>('app.dalleModel', 'dall-e-3');
    this.dalleQuality = this.configService.get<string>('app.dalleQuality', 'standard') as 'standard' | 'hd';
  }

  async generateReadyContent(
    industry: string,
    platforms: string[],
    language: Language = Language.NL,
  ): Promise<IndustryContentRaw> {
    const systemPrompt = `You are a social media content creator. Generate one unique, ready-to-post piece of content for each of the following platforms: ${platforms.join(', ')}.

The content must be tailored for a business in the "${industry}" industry.

IMPORTANT: All user-facing text (postText, hashtags, callToAction) MUST be written in ${language}. Do not use any other language for these fields. Any currency references must use the euro (€), never dollars.

For each piece of content, provide:
- platform: the platform name (keep in English: TikTok, Instagram, Facebook, X)
- postText: the ACTUAL post text that the business owner can copy and paste directly onto the platform. Write it exactly as it should appear on the platform — including line breaks, emojis where appropriate, and a natural tone. Make it platform-appropriate (short and punchy for X, longer and engaging for Facebook, visual-hook text for Instagram/TikTok).
- hashtags: an array of 3-5 relevant hashtags (without the # symbol, in ${language})
- callToAction: a short call-to-action tip for the business owner (in ${language})
- imagePrompt: a HIGHLY DETAILED and CREATIVE image generation prompt IN ENGLISH (minimum 3 sentences). This is a professional-grade prompt for an AI image generator — be specific and cinematic.

  QUALITY REQUIREMENTS FOR imagePrompt:
  - Specify exact camera angle (e.g. "shot from below at 30 degrees", "bird's eye view", "macro close-up at f/2.8")
  - Specify lighting (e.g. "golden hour side-lighting", "soft diffused studio light", "dramatic rim lighting", "natural window light casting long shadows")
  - Specify mood and color palette (e.g. "warm amber and deep browns", "crisp blue and white minimalist", "vibrant tropical colors")
  - Specify a unique, interesting scene — NOT generic stock photos. Think editorial magazine quality.
  - Each of the 4 imagePrompts MUST use a completely different visual approach: one photorealistic lifestyle shot, one dramatic close-up/macro, one artistic overhead/flat-lay, one atmospheric environmental shot.
  - Be SPECIFIC to the ${industry} industry — show unique aspects of this trade that an insider would recognize.
  - Describe textures, materials, depth of field, reflections where relevant.

  ABSOLUTE RULES FOR imagePrompt:
  1. NEVER describe any object that contains readable text: no documents, papers, signs, screens, books, labels, forms, menus, posters, banners, business cards, packaging, notebooks, whiteboards, or any surface with writing.
  2. NEVER use these words: "text", "writing", "written", "labeled", "sign", "title", "headline", "caption", "logo", "brand".
  3. If people appear: photorealistic Caucasian/Dutch, anatomically correct.
  4. Currency: ONLY euro coins/bills if shown, never dollars.
  5. Setting: Netherlands/Western European.
  6. End every imagePrompt with: "Absolutely no text, letters, numbers, or symbols visible anywhere."

Respond in JSON format with this exact structure:
{
  "industry": "${industry}",
  "content": [
    {
      "platform": "TikTok",
      "postText": "...",
      "hashtags": ["...", "..."],
      "callToAction": "...",
      "imagePrompt": "..."
    }
  ]
}`;

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate today's ready-to-post social media content for the ${industry} industry. All post text in ${language}.` },
        ],
        max_tokens: 3500,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw) as IndustryContentRaw;

      this.logger.log(`Generated ${parsed.content?.length ?? 0} content pieces for ${industry}`);
      return parsed;
    } catch (error) {
      this.logger.error(`Failed to generate content for ${industry}`, error);
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
