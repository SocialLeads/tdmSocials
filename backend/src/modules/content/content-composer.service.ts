import { Injectable } from '@nestjs/common';
import { IndustryContent } from '../ai/ai.types';
import { buildContentEmailHtml } from './templates/content-email.template';

@Injectable()
export class ContentComposerService {
  composeEmail(clientName: string, industry: string, content: IndustryContent): string {
    return buildContentEmailHtml(clientName, industry, content.content);
  }
}
