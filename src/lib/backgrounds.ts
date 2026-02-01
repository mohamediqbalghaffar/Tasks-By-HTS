
export interface BackgroundOption {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  category: 'Nature' | 'City' | 'Technology' | 'Abstract' | 'Food';
}

// This file is no longer used to generate multiple backgrounds, 
// but is kept in case the feature is re-enabled in the future.
export const backgroundOptions: BackgroundOption[] = [];
