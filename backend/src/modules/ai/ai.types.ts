export enum Language {
  NL = 'Dutch',
  EN = 'English',
  DE = 'German',
  FR = 'French',
  ES = 'Spanish',
}

// What GPT returns (before image generation)
export interface PlatformContentRaw {
  platform: string;
  postText: string;
  hashtags: string[];
  callToAction: string;
  imagePrompt: string;
}

// After image generation — what goes into the email
export interface PlatformContent {
  platform: string;
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

// Keep old types for backward compatibility during transition
/** @deprecated Use PlatformContent instead */
export interface PlatformContentIdea {
  platform: string;
  title: string;
  description: string;
  hashtags: string[];
  callToAction: string;
}

/** @deprecated Use IndustryContent instead */
export interface ContentIdeas {
  industry: string;
  ideas: PlatformContentIdea[];
}
