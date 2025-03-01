import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Conversation, Message, User, Reaction } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { 
  getAllConversations, 
  saveConversation, 
  addMessageToConversation, 
  markConversationAsRead, 
  addReactionToMessage,
  getUser,
  deleteMessageInConversation,
  editMessageInConversation,
  getAllUsers
} from '@/utils/database';

interface MessagingContextType {
  conversations: Conversation[];
  availableUsers: User[];
  activeConversationId: string | null;
  isLoadingConversations: boolean;
  selectConversation: (conversationId: string) => void;
  sendMessage: (text: string, type?: 'text' | 'image' | 'video' | 'file' | 'voice', attachmentUrl?: string, audioDuration?: number) => Promise<void>;
  sendAttachmentMessage: (message: Message) => Promise<void>;
  startNewConversation: (userId: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string, isCustom?: boolean, customEmojiId?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newText: string) => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const allConversations = await getAllConversations();
      setConversations(allConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingConversations(false);
    }
  }, [toast]);

  const loadAllUsers = useCallback(async () => {
    try {
      const users = await getAllUsers();
      
      if (currentUser) {
        setAvailableUsers(users.filter(user => user.id !== currentUser.id));
      } else {
        setAvailableUsers(users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available contacts.',
        variant: 'destructive'
      });
    }
  }, [currentUser, toast]);

  useEffect(() => {
    loadConversations();
    loadAllUsers();
  }, [loadConversations, loadAllUsers]);

  const selectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const sendMessage = async (text: string, type: 'text' | 'image' | 'video' | 'file' | 'voice' = 'text', attachmentUrl?: string, audioDuration?: number) => {
    if (!activeConversationId || !currentUser) return;

    const message: Message = {
      id: uuidv4(),
      senderId: currentUser.id,
      text,
      timestamp: new Date(),
      read: false,
      type,
      attachmentUrl,
      audioDuration,
    };

    await addMessageToConversation(activeConversationId, message);
    loadConversations();
  };

  const sendAttachmentMessage = async (message: Message) => {
    if (!activeConversationId || !currentUser) return;
    
    message.senderId = currentUser.id;
    
    if (!message.id) {
      message.id = uuidv4();
    }
    
    await addMessageToConversation(activeConversationId, message);
    loadConversations();
  };

  const startNewConversation = async (userId: string) => {
    if (!currentUser) return;

    const existingConversation = conversations.find(conversation => 
      conversation.participants.some(p => p.id === userId) && 
      conversation.participants.some(p => p.id === currentUser.id)
    );

    if (existingConversation) {
      selectConversation(existingConversation.id);
      return;
    }

    const user = await getUser(userId);
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not found.',
        variant: 'destructive'
      });
      return;
    }

    const newConversation: Conversation = {
      id: uuidv4(),
      participants: [currentUser, user],
      messages: [],
      lastMessageText: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
    };

    await saveConversation(newConversation);
    await loadConversations();
    selectConversation(newConversation.id);
  };

  const markAsRead = async (conversationId: string) => {
    await markConversationAsRead(conversationId);
    loadConversations();
  };

  const addReaction = async (messageId: string, emoji: string, isCustom?: boolean, customEmojiId?: string) => {
    if (!activeConversationId) return;

    const reaction: Reaction = {
      emoji,
      userId: currentUser?.id || '',
      isCustom,
      customEmojiId,
    };

    await addReactionToMessage(activeConversationId, messageId, reaction);
    loadConversations();
  };

  const deleteMessage = async (messageId: string) => {
    if (!activeConversationId) return;

    await deleteMessageInConversation(activeConversationId, messageId);
    loadConversations();
  };

  const editMessage = async (messageId: string, newText: string) => {
    if (!activeConversationId) return;

    await editMessageInConversation(activeConversationId, messageId, newText);
    loadConversations();
  };

  const value: MessagingContextType = {
    conversations,
    availableUsers,
    activeConversationId,
    isLoadingConversations,
    selectConversation,
    sendMessage,
    sendAttachmentMessage,
    startNewConversation,
    markAsRead,
    addReaction,
    deleteMessage,
    editMessage
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
