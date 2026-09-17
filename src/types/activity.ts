// Activity types for Active Aging app

export type ActivityCategory =
  | 'walking'
  | 'yoga'
  | 'music'
  | 'games'
  | 'travel'
  | 'learning'
  | 'gardening'
  | 'reading'
  | 'cooking'
  | 'art'
  | 'cycling'
  | 'meditation'
  | 'volunteering'
  | 'fitness'
  | 'social';

export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  date: string; // ISO date string
  startTime: string; // "07:00 AM"
  endTime: string; // "09:00 AM"
  location: string;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  distance?: number; // km from user
  organizerId: string;
  participantIds: string[];
  maxParticipants: number;
  status: ActivityStatus;
  image: string;
  whatToBring?: string[];
  safetyInfo?: string;
  isFree: boolean;
  createdAt: string;
}
