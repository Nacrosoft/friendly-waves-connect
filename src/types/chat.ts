export interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  password?: string; // Only used for demo purposes - in a real app, you'd never store plaintext passwords
  customEmojis?: CustomEmoji[]; // Added for custom emoji support
  stories?: Story[]; // Added for story support
}

export interface CustomEmoji {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  createdAt: Date;
  userId: string;
}

export interface Story {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'text';
  content: string; // URL for image/video or text content
  bgColor?: string; // For text stories
  createdAt: Date;
  expiresAt: Date; // Stories typically expire after 24 hours
  viewers: string[]; // IDs of users who viewed the story
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
  type: 'text' | 'image' | 'video' | 'file' | 'voice';
  attachmentUrl?: string;
  reactions?: Reaction[];
  replyToId?: string; // ID of the message this is replying to
  edited?: boolean; // Flag to indicate if this message has been edited
  audioDuration?: number; // Duration of voice message in seconds
  deleted?: boolean; // Flag to indicate if this message has been deleted
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessageText: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export interface Call {
  id: string;
  callerId: string;
  caller: User;
  recipientId: string;
  recipient: User;
  status: 'pending' | 'active' | 'ended' | 'declined';
  startTime: Date;
  endTime?: Date;
  isVideo: boolean;
}
