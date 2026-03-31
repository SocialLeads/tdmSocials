export interface PlatformContentIdea {
  platform: string;
  title: string;
  description: string;
  hashtags: string[];
  callToAction: string;
}

export interface ContentIdeas {
  industry: string;
  ideas: PlatformContentIdea[];
}
