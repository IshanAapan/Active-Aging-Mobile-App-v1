// User types for Active Aging app

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface User {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  city: string;
  area: string;
  photo: string;
  bio: string;
  interests: string[]; // Interest IDs
  communityIds: string[];
  joinedActivityIds: string[];
  createdAt: string;
}

export interface AuthUser extends User {
  phone: string;
  isOnboardingComplete: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  area: string;
  photo: string;
  bio: string;
  interests: string[];
  communityIds: string[];
  commonInterestsCount?: number;
}
