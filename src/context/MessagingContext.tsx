
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Conversation, Message, Reaction, User } from '@/types/chat';
import { 
  initDatabase, 
  seedDatabase, 
  getAllConversations, 
  getConversation, 
  addMessageToConversation, 
  markConversationAsRead,
  addReactionToMessage
} from '@/utils/database';
import { conversations as initialConversations, currentUser, users as initialUsers } from '@/data/conversations';
import { useToast } from '@/hooks/use-toast';

interface MessagingContextType {
  currentUser: User;
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  isLoading: boolean;
  selectConversation: (conversationId: string) => void;
  sendMessage: (text: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { toast } = useToast();

  // Initialize database
  useEffect(() => {
    const initialize = async () => {
      try {
        const initialized = await initDatabase();
        if (initialized) {
          const existingConversations = await getAllConversations();
          
          // If no conversations exist, seed the database
          if (existingConversations.length === 0) {
            await seedDatabase(initialUsers, initialConversations);
            setConversations(initialConversations);
          } else {
            setConversations(existingConversations);
          }
          
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

  // Select conversation by ID
  const selectConversation = async (conversationId: string) => {
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
    if (!selectedConversation) return;
    
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
        
        // Simulate other user typing
        simulateReply(updatedConversation);
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

  // Simulate reply from other user
  const simulateReply = (conversation: Conversation) => {
    if (!conversation) return;
    
    const otherUser = conversation.participants.find(p => p.id !== currentUser.id);
    if (!otherUser) return;
    
    // Show typing indicator
    setTimeout(async () => {
      const replyMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: otherUser.id,
        text: getRandomResponse(conversation.messages[conversation.messages.length - 1].text),
        timestamp: new Date(),
        read: true,
        type: 'text'
      };
      
      try {
        const updatedConversation = await addMessageToConversation(
          conversation.id, 
          replyMessage
        );
        
        if (updatedConversation) {
          setSelectedConversation(updatedConversation);
          
          // Update conversation in list
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv.id === conversation.id ? updatedConversation : conv
            )
          );
        }
      } catch (error) {
        console.error('Error simulating reply:', error);
      }
    }, 1500 + Math.random() * 3000);
  };

  // Add a reaction to a message
  const addReaction = async (messageId: string, emoji: string) => {
    if (!selectedConversation) return;
    
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

  return (
    <MessagingContext.Provider
      value={{
        currentUser,
        conversations,
        selectedConversation,
        isLoading,
        selectConversation,
        sendMessage,
        addReaction
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

// Helper function for random responses
function getRandomResponse(input: string): string {
  const responses = [
    "That's interesting! Tell me more.",
    "I see what you mean.",
    "I was just thinking about that!",
    "Good point. Have you considered...",
    "I completely agree with you.",
    "That reminds me of something I read recently.",
    "I hadn't thought about it that way before.",
    "Let's discuss this more when we meet.",
    "Thanks for sharing that with me.",
    "I'll have to think about that."
  ];
  
  // Simple keyword matching for slightly more contextual responses
  if (input.match(/\b(hi|hello|hey)\b/i)) {
    return "Hi there! How are you doing today?";
  } else if (input.match(/\b(how are you|how's it going)\b/i)) {
    return "I'm doing well, thanks for asking! How about you?";
  } else if (input.match(/\b(yes|yeah|yep)\b/i)) {
    return "Great! I'm glad we're on the same page.";
  } else if (input.match(/\b(no|nope|nah)\b/i)) {
    return "I understand. Maybe we should look at other options?";
  } else if (input.match(/\b(thanks|thank you)\b/i)) {
    return "You're welcome! Happy to help.";
  } else if (input.match(/\b(bye|goodbye|see you)\b/i)) {
    return "Talk to you later! Have a great day.";
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
}
