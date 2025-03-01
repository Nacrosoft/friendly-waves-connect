
import { Conversation, User, Message } from '../types/chat';

export const currentUser: User = {
  id: 'current-user',
  name: 'You',
  status: 'online',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop'
};

export const users: User[] = [
  {
    id: 'user1',
    name: 'Emma Thompson',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&auto=format&fit=crop',
    lastSeen: new Date()
  },
  {
    id: 'user2',
    name: 'Michael Chen',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop',
    lastSeen: new Date()
  },
  {
    id: 'user3',
    name: 'Sophia Martinez',
    status: 'away',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop',
    lastSeen: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: 'user4',
    name: 'James Wilson',
    status: 'offline',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop',
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3)
  },
  {
    id: 'user5',
    name: 'Olivia Johnson',
    status: 'offline',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250&auto=format&fit=crop',
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: 'user6',
    name: 'Daniel Kim',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=250&auto=format&fit=crop',
    lastSeen: new Date()
  }
];

function createMessages(participantId: string): Message[] {
  // Generate 5-15 messages
  const count = Math.floor(Math.random() * 10) + 5;
  const messages: Message[] = [];
  
  for (let i = 0; i < count; i++) {
    const isFromCurrentUser = Math.random() > 0.5;
    const timeDelta = count - i;
    
    messages.push({
      id: `message-${participantId}-${i}`,
      senderId: isFromCurrentUser ? currentUser.id : participantId,
      text: getRandomMessage(isFromCurrentUser),
      timestamp: new Date(Date.now() - 1000 * 60 * timeDelta * (Math.random() * 10)),
      read: true,
      type: 'text'
    });
  }
  
  // Sort messages by timestamp
  return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

function getRandomMessage(isFromCurrentUser: boolean): string {
  const currentUserMessages = [
    "How's your day going?",
    "Did you see that new film everyone's talking about?",
    "I was thinking we could meet up this weekend.",
    "What are your thoughts on the project?",
    "I just finished that book you recommended!",
    "Do you have plans for the holidays?",
    "I've been meaning to ask you about that thing we discussed.",
    "Have you tried that new restaurant downtown?",
    "I'm really excited about our upcoming trip!",
    "Just checking in to see how you're doing."
  ];
  
  const otherUserMessages = [
    "Pretty good! How about you?",
    "Not yet, is it worth watching?",
    "I'm free on Saturday if that works for you.",
    "I think we're making good progress so far.",
    "Oh great! Did you enjoy it?",
    "Just the usual family gathering, nothing special.",
    "Yes, I've been thinking about it too.",
    "Yes, the food was amazing! We should go together sometime.",
    "Me too! I've already started packing.",
    "I'm doing well, thanks for asking!"
  ];
  
  const messages = isFromCurrentUser ? currentUserMessages : otherUserMessages;
  return messages[Math.floor(Math.random() * messages.length)];
}

export function generateConversations(): Conversation[] {
  return users.map(user => {
    const messages = createMessages(user.id);
    const lastMessage = messages[messages.length - 1];
    
    return {
      id: `conversation-${user.id}`,
      participants: [user, currentUser],
      messages: messages,
      lastMessageText: lastMessage.text,
      lastMessageTime: lastMessage.timestamp,
      unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0
    };
  });
}

export const conversations = generateConversations();

export function getConversationById(id: string): Conversation | undefined {
  return conversations.find(conversation => conversation.id === id);
}

export function getOtherParticipant(conversation: Conversation): User {
  return conversation.participants.find(p => p.id !== currentUser.id) || currentUser;
}
