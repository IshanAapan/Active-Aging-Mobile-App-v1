// Message types for Active Aging app

export interface Message {
  id: string;
  communityId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
  createdAt: string;
  isReported?: boolean;
}
