
import { Conversation, User } from '../types/chat';

export const getOtherParticipant = (conversation: Conversation, currentUserId: string): User => {
  return conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
};
