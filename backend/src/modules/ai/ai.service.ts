import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ContentIdeas, PlatformContentIdea } from './ai.types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      timeout: 30_000,
    });
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
  }

  async generateContentIdeas(
    industry: string,
    platforms: string[],
  ): Promise<ContentIdeas> {
    const systemPrompt = `You are a social media content strategist. Generate one unique, creative content idea for each of the following platforms: ${platforms.join(', ')}.

The ideas must be tailored for a business in the "${industry}" industry.

For each idea, provide:
- platform: the platform name
- title: a short, catchy title for the content piece
- description: a 2-3 sentence description explaining the content idea, what to post, and why it works
- hashtags: an array of 3-5 relevant hashtags (without the # symbol)
- callToAction: a short call-to-action text

Respond in JSON format with this exact structure:
{
  "industry": "${industry}",
  "ideas": [
    {
      "platform": "TikTok",
      "title": "...",
      "description": "...",
      "hashtags": ["...", "..."],
      "callToAction": "..."
    }
  ]
}`;

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate today's content ideas for the ${industry} industry.` },
        ],
        max_tokens: 1500,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw) as ContentIdeas;

      this.logger.log(`Generated ${parsed.ideas?.length ?? 0} content ideas for ${industry}`);
      return parsed;
    } catch (error) {
      this.logger.error(`Failed to generate content for ${industry}`, error);
      throw error;
    }
  }
}
