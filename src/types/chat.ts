
export interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  password?: string; // Only used for demo purposes - in a real app, you'd never store plaintext passwords
  customEmojis?: CustomEmoji[]; // Added for custom emoji support
}

export interface CustomEmoji {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  createdAt: Date;
  userId: string;
}

export interface Reaction {
  emoji: string;
  userId: string;
  isCustom?: boolean;
  customEmojiId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'video' | 'file';
  attachmentUrl?: string;
  reactions?: Reaction[];
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessageText: string;
  lastMessageTime: Date;
  unreadCount: number;
}
