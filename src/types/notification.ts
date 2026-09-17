// Notification types for Active Aging app

export type NotificationType =
  | 'activity_reminder'
  | 'activity_joined'
  | 'activity_updated'
  | 'activity_cancelled'
  | 'community_message'
  | 'new_activity'
  | 'community_joined'
  | 'participant_update';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  activityId?: string;
  communityId?: string;
  userId?: string;
}
