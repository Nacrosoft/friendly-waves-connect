import React, { createContext, useContext, useEffect, useState } from 'react';
import { Conversation, Message, Reaction, User, CustomEmoji } from '@/types/chat';
import { 
  initDatabase, 
  getAllConversations, 
  getConversation, 
  addMessageToConversation, 
  markConversationAsRead,
  addReactionToMessage,
  saveConversation,
  getUser,
  saveCustomEmoji,
  getCustomEmojisForUser,
  deleteCustomEmoji
} from '@/utils/database';
import { getOtherParticipant } from '@/data/conversations';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface MessagingContextType {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  isLoading: boolean;
  selectConversation: (conversationId: string) => void;
  sendMessage: (text: string) => Promise<void>;
  sendAttachmentMessage: (message: Message) => Promise<void>;
  addReaction: (messageId: string, emoji: string, isCustom?: boolean, customEmojiId?: string) => Promise<void>;
  startNewConversation: (userId: string) => Promise<void>;
  saveCustomEmoji: (emoji: CustomEmoji) => Promise<CustomEmoji>;
  deleteUserEmoji: (emojiId: string) => Promise<boolean>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { toast } = useToast();
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      try {
        const initialized = await initDatabase();
        if (initialized) {
          setIsDbInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
        toast({
          title: 'Database Error',
          description: 'Could not initialize the message database.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [toast]);

  useEffect(() => {
    const loadConversations = async () => {
      if (!isAuthenticated || !currentUser || !isDbInitialized) return;
      
      setIsLoading(true);
      try {
        const allConversations = await getAllConversations();
        const userConversations = allConversations.filter(conv => 
          conv.participants.some(p => p.id === currentUser.id)
        );
        setConversations(userConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast({
          title: 'Error',
          description: 'Could not load your conversations.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversations();
  }, [currentUser, isAuthenticated, isDbInitialized, toast]);

  const selectConversation = async (conversationId: string) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const conversation = await getConversation(conversationId);
      
      if (conversation) {
        const updatedConversation = await markConversationAsRead(conversationId);
        
        if (updatedConversation) {
          setSelectedConversation(updatedConversation);
          
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv.id === conversationId ? updatedConversation : conv
            )
          );
        }
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
      toast({
        title: 'Error',
        description: 'Could not load the conversation.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!selectedConversation || !currentUser) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: new Date(),
      read: false,
      type: 'text'
    };
    
    try {
      const updatedConversation = await addMessageToConversation(
        selectedConversation.id, 
        newMessage
      );
      
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
        
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === selectedConversation.id ? updatedConversation : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Could not send the message.',
        variant: 'destructive'
      });
    }
  };

  const sendAttachmentMessage = async (message: Message) => {
    if (!selectedConversation || !currentUser) return;
    
    try {
      const updatedConversation = await addMessageToConversation(
        selectedConversation.id, 
        message
      );
      
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
        
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === selectedConversation.id ? updatedConversation : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending attachment message:', error);
      toast({
        title: 'Error',
        description: 'Could not send the attachment.',
        variant: 'destructive'
      });
    }
  };

  const addReaction = async (messageId: string, emoji: string, isCustom?: boolean, customEmojiId?: string) => {
    if (!selectedConversation || !currentUser) return;
    
    const reaction: Reaction = {
      emoji,
      userId: currentUser.id,
      isCustom,
      customEmojiId
    };
    
    try {
      const updatedConversation = await addReactionToMessage(
        selectedConversation.id,
        messageId,
        reaction
      );
      
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
        
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === selectedConversation.id ? updatedConversation : conv
          )
        );
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: 'Error',
        description: 'Could not add the reaction.',
        variant: 'destructive'
      });
    }
  };

  const saveUserEmoji = async (emoji: CustomEmoji): Promise<CustomEmoji> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      const savedEmoji = await saveCustomEmoji(emoji);
      
      if (currentUser) {
        const updatedUser = {...currentUser};
        if (!updatedUser.customEmojis) {
          updatedUser.customEmojis = [];
        }
        
        const existingIndex = updatedUser.customEmojis.findIndex(e => e.id === emoji.id);
        if (existingIndex >= 0) {
          updatedUser.customEmojis[existingIndex] = savedEmoji;
        } else {
          updatedUser.customEmojis.push(savedEmoji);
        }
      }
      
      return savedEmoji;
    } catch (error) {
      console.error('Error saving custom emoji:', error);
      toast({
        title: 'Error',
        description: 'Could not save the custom emoji.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteUserEmoji = async (emojiId: string): Promise<boolean> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      const success = await deleteCustomEmoji(emojiId, currentUser.id);
      
      if (success && currentUser.customEmojis) {
        const updatedUser = {...currentUser};
        updatedUser.customEmojis = updatedUser.customEmojis.filter(e => e.id !== emojiId);
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting custom emoji:', error);
      toast({
        title: 'Error',
        description: 'Could not delete the custom emoji.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const startNewConversation = async (userId: string) => {
    if (!currentUser) return;
    
    try {
      const existingConv = conversations.find(conv => 
        conv.participants.some(p => p.id === userId) && 
        conv.participants.some(p => p.id === currentUser.id)
      );
      
      if (existingConv) {
        selectConversation(existingConv.id);
        return;
      }
      
      const otherUser = await getUser(userId);
      
      if (!otherUser) {
        toast({
          title: 'User Not Found',
          description: 'Could not find the user to start a conversation with.',
          variant: 'destructive'
        });
        return;
      }
      
      const newConversation: Conversation = {
        id: `conversation-${Date.now()}`,
        participants: [currentUser, otherUser],
        messages: [],
        lastMessageText: 'Start a new conversation',
        lastMessageTime: new Date(),
        unreadCount: 0
      };
      
      const savedConversation = await saveConversation(newConversation);
      
      setConversations(prev => [...prev, savedConversation]);
      
      setSelectedConversation(savedConversation);
      
    } catch (error) {
      console.error('Error starting new conversation:', error);
      toast({
        title: 'Error',
        description: 'Could not start a new conversation.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        selectedConversation,
        isLoading,
        selectConversation,
        sendMessage,
        sendAttachmentMessage,
        addReaction,
        startNewConversation,
        saveCustomEmoji: saveUserEmoji,
        deleteUserEmoji
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
