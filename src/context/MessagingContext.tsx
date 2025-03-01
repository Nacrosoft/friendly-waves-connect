
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Conversation, Message, Reaction, User } from '@/types/chat';
import { 
  initDatabase, 
  getAllConversations, 
  getConversation, 
  addMessageToConversation, 
  markConversationAsRead,
  addReactionToMessage,
  saveConversation
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
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  startNewConversation: (userId: string) => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { toast } = useToast();
  const { currentUser, isAuthenticated } = useAuth();

  // Initialize database
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

  // Load conversations when user is authenticated
  useEffect(() => {
    const loadConversations = async () => {
      if (!isAuthenticated || !currentUser || !isDbInitialized) return;
      
      setIsLoading(true);
      try {
        const allConversations = await getAllConversations();
        // Filter conversations for current user
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

  // Select conversation by ID
  const selectConversation = async (conversationId: string) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const conversation = await getConversation(conversationId);
      
      if (conversation) {
        // Mark conversation as read
        const updatedConversation = await markConversationAsRead(conversationId);
        
        if (updatedConversation) {
          setSelectedConversation(updatedConversation);
          
          // Update conversations list with read status
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

  // Send a message
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
        
        // Update conversation in list
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

  // Add a reaction to a message
  const addReaction = async (messageId: string, emoji: string) => {
    if (!selectedConversation || !currentUser) return;
    
    const reaction: Reaction = {
      emoji,
      userId: currentUser.id
    };
    
    try {
      const updatedConversation = await addReactionToMessage(
        selectedConversation.id,
        messageId,
        reaction
      );
      
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
        
        // Update conversation in list
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

  // Start a new conversation with another user
  const startNewConversation = async (userId: string) => {
    if (!currentUser) return;
    
    try {
      // Check if conversation already exists
      const existingConv = conversations.find(conv => 
        conv.participants.some(p => p.id === userId) && 
        conv.participants.some(p => p.id === currentUser.id)
      );
      
      if (existingConv) {
        // If conversation exists, select it
        selectConversation(existingConv.id);
        return;
      }
      
      // Get the other user (would need to be implemented in database.ts)
      const otherUser = await getUser(userId);
      
      if (!otherUser) {
        toast({
          title: 'User Not Found',
          description: 'Could not find the user to start a conversation with.',
          variant: 'destructive'
        });
        return;
      }
      
      // Create new conversation
      const newConversation: Conversation = {
        id: `conversation-${Date.now()}`,
        participants: [currentUser, otherUser],
        messages: [],
        lastMessageText: 'Start a new conversation',
        lastMessageTime: new Date(),
        unreadCount: 0
      };
      
      const savedConversation = await saveConversation(newConversation);
      
      // Add to conversations list
      setConversations(prev => [...prev, savedConversation]);
      
      // Select the new conversation
      setSelectedConversation(savedConversation);
      
    } catch (error) {
      console.error('Error starting new conversation:', error);
      toast({
        title: 'Error',
        description: 'Could not start a new conversation.',
        variant: 'destructive'
      });
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
        addReaction,
        startNewConversation
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

// Helper function to get user - this would need to be implemented in the database.ts file
async function getUser(userId: string): Promise<User | null> {
  try {
    // This should use the database.getUser function
    return null; // Placeholder, will be replaced by actual implementation
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}
