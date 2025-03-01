
export interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'file';
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
