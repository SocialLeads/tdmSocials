export enum Language {
  NL = 'Dutch',
  EN = 'English',
  DE = 'German',
  FR = 'French',
  ES = 'Spanish',
}

export type ContentAngle = 'educational' | 'engagement' | 'inspiration';

export const CONTENT_ANGLES: ContentAngle[] = ['educational', 'engagement', 'inspiration'];

// What GPT returns (before image generation)
export interface PlatformContentRaw {
  platform: string;
  angle: ContentAngle;
  postText: string;
  hashtags: string[];
  callToAction: string;
  imagePrompt: string;
}

// After image generation — what goes into the email
export interface PlatformContent {
  platform: string;
  angle: ContentAngle;
  postText: string;
  hashtags: string[];
  callToAction: string;
  imageUrl: string | null;
}

export interface IndustryContentRaw {
  industry: string;
  content: PlatformContentRaw[];
}

export interface IndustryContent {
  industry: string;
  content: PlatformContent[];
}
