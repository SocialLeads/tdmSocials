import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface FluxResponse {
  images: { url: string; content_type: string }[];
  prompt: string;
  seed: number;
  has_nsfw_concepts: boolean[];
}

@Injectable()
export class FluxService {
  private readonly logger = new Logger(FluxService.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://fal.run';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FAL_API_KEY', '');
    this.model = this.configService.get<string>('FLUX_MODEL', 'fal-ai/flux-pro/v1.1');

    this.logger.log(`Flux initialized — model: ${this.model}, API key present: ${!!this.apiKey}, key length: ${this.apiKey.length}`);

    if (!this.apiKey) {
      this.logger.warn('FAL_API_KEY is not configured. Flux image generation will fail.');
    }
  }

  async generateImage(imagePrompt: string): Promise<string | null> {
    if (!this.apiKey) {
      this.logger.warn('Flux: No API key configured, skipping image generation');
      return null;
    }

    // Strip instruction-like text from the prompt — image models can render instructions as visible text
    const cleanPrompt = imagePrompt
      .replace(/Absolutely no text.*$/i, '')
      .replace(/no text.*visible anywhere\.?/gi, '')
      .trim();

    const enhancedPrompt = `${cleanPrompt}, photorealistic, cinematic lighting, European setting, high quality professional photography`;

    const url = `${this.baseUrl}/${this.model}`;
    this.logger.log(`Flux request → ${url}`);
    this.logger.log(`Flux FULL prompt:\n${enhancedPrompt}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          image_size: { width: 1536, height: 1536 },
          num_images: 1,
          output_format: 'png',
          safety_tolerance: '5',
        }),
      });

      this.logger.log(`Flux response status: ${response.status}`);

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Flux API error ${response.status}: ${errorBody}`);
        return null;
      }

      const rawBody = await response.text();
      this.logger.log(`Flux raw response (first 300 chars): ${rawBody.substring(0, 300)}`);

      let data: FluxResponse;
      try {
        data = JSON.parse(rawBody) as FluxResponse;
      } catch (parseErr) {
        this.logger.error(`Flux response parse failed: ${rawBody.substring(0, 500)}`);
        return null;
      }

      this.logger.log(`Flux response images count: ${data.images?.length ?? 0}`);

      const imageUrl = data.images?.[0]?.url;

      if (!imageUrl) {
        this.logger.warn(`Flux returned no image URL. Full response: ${JSON.stringify(data).substring(0, 500)}`);
        return null;
      }

      this.logger.log(`Flux image URL received: ${imageUrl.substring(0, 80)}...`);
      return imageUrl;
    } catch (error: any) {
      this.logger.error(`Flux image generation failed: ${error?.message || error}`);
      this.logger.error(`Flux error stack: ${error?.stack || 'no stack'}`);
      return null;
    }
  }
}
