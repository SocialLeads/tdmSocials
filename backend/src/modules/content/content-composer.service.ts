import { Injectable } from '@nestjs/common';
import { ContentIdeas } from '../ai/ai.types';
import { buildContentEmailHtml } from './templates/content-email.template';

@Injectable()
export class ContentComposerService {
  composeEmail(clientName: string, industry: string, ideas: ContentIdeas): string {
    return buildContentEmailHtml(clientName, industry, ideas.ideas);
  }
}
