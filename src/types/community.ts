// Community types for Active Aging app

export type CommunityCategory =
  | 'walking'
  | 'music'
  | 'games'
  | 'books'
  | 'travel'
  | 'gardening'
  | 'fitness'
  | 'cooking'
  | 'art'
  | 'social';

export interface Community {
  id: string;
  name: string;
  description: string;
  category: CommunityCategory;
  city: string;
  area: string;
  image: string;
  memberIds: string[];
  upcomingActivityIds: string[];
  interests: string[]; // interest IDs
  isPrivate: boolean;
  createdAt: string;
  organizerId: string;
}
