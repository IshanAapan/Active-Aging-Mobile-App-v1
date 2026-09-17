import { Notification } from '../types/notification';

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'activity_reminder',
    title: 'Morning Walk Tomorrow 🌅',
    body: 'Your Sunday Morning Walk starts tomorrow at 7:00 AM at Central Park. Don\'t forget comfortable shoes!',
    read: false,
    createdAt: '2024-08-17T20:00:00Z',
    activityId: 'act-1',
  },
  {
    id: 'notif-2',
    type: 'participant_update',
    title: '5 More People Joined!',
    body: '5 people have joined the Sunday Morning Walk. It\'s going to be a great group!',
    read: false,
    createdAt: '2024-08-16T14:00:00Z',
    activityId: 'act-1',
  },
  {
    id: 'notif-3',
    type: 'community_message',
    title: 'New message in Chess & Chai Circle',
    body: 'Anil Verma: "Chess evening this Tuesday at my place. Who is coming?"',
    read: true,
    createdAt: '2024-08-15T15:00:00Z',
    communityId: 'comm-2',
  },
  {
    id: 'notif-4',
    type: 'new_activity',
    title: 'New Activity Near You 🎵',
    body: 'Old Bollywood Music Evening is happening on Aug 24. 5 people from your area are joining!',
    read: false,
    createdAt: '2024-08-14T10:00:00Z',
    activityId: 'act-4',
  },
  {
    id: 'notif-5',
    type: 'activity_joined',
    title: 'You joined Yoga & Chai!',
    body: 'You have successfully joined Morning Yoga & Chai on Aug 17. See you at 6:30 AM!',
    read: true,
    createdAt: '2024-08-10T09:00:00Z',
    activityId: 'act-2',
  },
];
