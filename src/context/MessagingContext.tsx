import React, { createContext, useContext, useEffect, useState } from 'react';
import { Conversation, Message, Reaction, User, CustomEmoji, Call } from '@/types/chat';
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
  deleteCustomEmoji,
  editMessageInConversation,
  deleteMessageInConversation,
  saveCall,
  updateCall,
  getActiveCalls
} from '@/utils/database';
import { getOtherParticipant } from '@/data/conversations';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MessagingContextType {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  isLoading: boolean;
  selectConversation: (conversationId: string) => void;
  sendMessage: (text: string, replyToId?: string) => Promise<void>;
  sendAttachmentMessage: (message: Message) => Promise<void>;
  addReaction: (messageId: string, emoji: string, isCustom?: boolean, customEmojiId?: string) => Promise<void>;
  startNewConversation: (userId: string) => Promise<void>;
  saveCustomEmoji: (emoji: CustomEmoji) => Promise<CustomEmoji>;
  deleteUserEmoji: (emojiId: string) => Promise<boolean>;
  editMessage: (messageId: string, newText: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  initiateCall: (recipientId: string, isVideo: boolean) => Promise<Call>;
  acceptCall: (callId: string) => Promise<Call>;
  declineCall: (callId: string) => Promise<void>;
  endCall: (callId: string) => Promise<void>;
  incomingCall: Call | null;
  activeCall: Call | null;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
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
    if (!isAuthenticated || !currentUser) return;

    const channel = supabase
      .channel('public:calls')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'calls' 
        }, 
        async (payload) => {
          console.log('Real-time call update received:', payload);
          
          const callData = payload.new as Record<string, any> | null;
          if (!callData || typeof callData !== 'object') {
            console.log('Invalid call payload received:', payload);
            return;
          }
          
          if (callData.recipient_id === currentUser.id && callData.status === 'pending') {
            const caller = await getUser(callData.caller_id);
            if (caller) {
              const newCall: Call = {
                id: callData.id,
                callerId: callData.caller_id,
                caller: caller,
                recipientId: callData.recipient_id,
                recipient: currentUser,
                status: callData.status,
                startTime: new Date(callData.start_time),
                endTime: callData.end_time ? new Date(callData.end_time) : undefined,
                isVideo: callData.is_video
              };
              
              setIncomingCall(newCall);
              
              const audio = new Audio('/call-ringtone.mp3');
              audio.loop = true;
              audio.play().catch(e => console.error('Error playing ringtone:', e));
              
              (window as any).callRingtone = audio;
            }
          } else if (callData.status === 'active' && 
                    (callData.caller_id === currentUser.id || callData.recipient_id === currentUser.id)) {
            const caller = await getUser(callData.caller_id);
            const recipient = await getUser(callData.recipient_id);
            
            if (caller && recipient) {
              const updatedCall: Call = {
                id: callData.id,
                callerId: callData.caller_id,
                caller: caller,
                recipientId: callData.recipient_id,
                recipient: recipient,
                status: callData.status,
                startTime: new Date(callData.start_time),
                endTime: callData.end_time ? new Date(callData.end_time) : undefined,
                isVideo: callData.is_video
              };
              
              setActiveCall(updatedCall);
              setIncomingCall(null);
              
              if ((window as any).callRingtone) {
                (window as any).callRingtone.pause();
                (window as any).callRingtone = null;
              }
            }
          } else if (callData.status === 'ended' || callData.status === 'declined') {
            if (incomingCall && incomingCall.id === callData.id) {
              setIncomingCall(null);
            }
            if (activeCall && activeCall.id === callData.id) {
              setActiveCall(null);
            }
            
            if ((window as any).callRingtone) {
              (window as any).callRingtone.pause();
              (window as any).callRingtone = null;
            }
          }
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages' 
        }, 
        async (payload) => {
          console.log('Real-time message update received:', payload);
          
          const newMessageData = payload.new as Record<string, any> | null;
          if (!newMessageData || typeof newMessageData !== 'object') {
            console.log('Invalid payload received:', payload);
            return;
          }
          
          const conversationId = newMessageData.conversation_id;
          if (!conversationId) {
            console.log('No conversation_id in payload:', payload);
            return;
          }
          
          if (selectedConversation && selectedConversation.id === conversationId) {
            const refreshedConversation = await getConversation(selectedConversation.id);
            if (refreshedConversation) {
              setSelectedConversation(refreshedConversation);
            }
          }
          
          const allConversations = await getAllConversations();
          const userConversations = allConversations.filter(conv => 
            conv.participants.some(p => p.id === currentUser.id)
          );
          setConversations(userConversations);
        }
      )
      .subscribe();

    const checkPendingCalls = async () => {
      const activeCalls = await getActiveCalls(currentUser.id);
      console.log('Active calls for current user:', activeCalls);
      
      const pendingCall = activeCalls.find(call => 
        call.recipientId === currentUser.id && call.status === 'pending'
      );
      
      if (pendingCall) {
        setIncomingCall(pendingCall);
        
        const audio = new Audio('/call-ringtone.mp3');
        audio.loop = true;
        audio.play().catch(e => console.error('Error playing ringtone:', e));
        
        (window as any).callRingtone = audio;
      }
      
      const activeCallData = activeCalls.find(call => 
        (call.callerId === currentUser.id || call.recipientId === currentUser.id) && 
        call.status === 'active'
      );
      
      if (activeCallData) {
        setActiveCall(activeCallData);
      }
    };
    
    checkPendingCalls();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(messagesChannel);
      console.log('Unsubscribed from real-time channels');
      
      if ((window as any).callRingtone) {
        (window as any).callRingtone.pause();
        (window as any).callRingtone = null;
      }
    };
  }, [currentUser, isAuthenticated, selectedConversation, incomingCall, activeCall]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser || !isDbInitialized) return;
    
    const loadConversations = async () => {
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

  const sendMessage = async (text: string, replyToId?: string) => {
    if (!selectedConversation || !currentUser) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: new Date(),
      read: false,
      type: 'text',
      replyToId
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

  const editMessage = async (messageId: string, newText: string) => {
    if (!selectedConversation || !currentUser) return;
    
    try {
      const updatedConversation = await editMessageInConversation(
        selectedConversation.id,
        messageId,
        newText
      );
      
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
        
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === selectedConversation.id ? updatedConversation : conv
          )
        );
        
        toast({
          title: 'Message edited',
          description: 'Your message was updated successfully.',
        });
      }
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: 'Error',
        description: 'Could not edit the message.',
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

  const deleteMessage = async (messageId: string) => {
    if (!selectedConversation || !currentUser) return;
    
    try {
      const updatedConversation = await deleteMessageInConversation(
        selectedConversation.id,
        messageId
      );
      
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
        
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === selectedConversation.id ? updatedConversation : conv
          )
        );
        
        toast({
          title: 'Message deleted',
          description: 'Your message was deleted successfully.',
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Could not delete the message.',
        variant: 'destructive'
      });
    }
  };

  const initiateCall = async (recipientId: string, isVideo: boolean): Promise<Call> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const recipient = await getUser(recipientId);
    if (!recipient) {
      throw new Error('Recipient not found');
    }
    
    const newCall: Call = {
      id: `call-${Date.now()}`,
      callerId: currentUser.id,
      caller: currentUser,
      recipientId: recipient.id,
      recipient: recipient,
      status: 'pending',
      startTime: new Date(),
      isVideo
    };
    
    try {
      const savedCall = await saveCall(newCall);
      
      setActiveCall(savedCall);
      
      toast({
        title: 'Calling...',
        description: `Calling ${recipient.name}`,
      });
      
      return savedCall;
    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: 'Call Failed',
        description: 'Could not initiate the call. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  const acceptCall = async (callId: string): Promise<Call> => {
    if (!currentUser || !incomingCall) {
      throw new Error('No incoming call to accept');
    }
    
    try {
      const updatedCall: Call = {
        ...incomingCall,
        status: 'active'
      };
      
      const savedCall = await updateCall(updatedCall);
      
      setActiveCall(savedCall);
      setIncomingCall(null);
      
      if ((window as any).callRingtone) {
        (window as any).callRingtone.pause();
        (window as any).callRingtone = null;
      }
      
      return savedCall;
    } catch (error) {
      console.error('Error accepting call:', error);
      toast({
        title: 'Call Error',
        description: 'Could not accept the call. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  const declineCall = async (callId: string): Promise<void> => {
    if (!incomingCall) {
      return;
    }
    
    try {
      const updatedCall: Call = {
        ...incomingCall,
        status: 'declined',
        endTime: new Date()
      };
      
      await updateCall(updatedCall);
      
      setIncomingCall(null);
      
      if ((window as any).callRingtone) {
        (window as any).callRingtone.pause();
        (window as any).callRingtone = null;
      }
    } catch (error) {
      console.error('Error declining call:', error);
      toast({
        title: 'Error',
        description: 'Could not decline the call.',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  const endCall = async (callId: string): Promise<void> => {
    if (!activeCall) {
      return;
    }
    
    try {
      const updatedCall: Call = {
        ...activeCall,
        status: 'ended',
        endTime: new Date()
      };
      
      await updateCall(updatedCall);
      
      setActiveCall(null);
    } catch (error) {
      console.error('Error ending call:', error);
      toast({
        title: 'Error',
        description: 'Could not end the call.',
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
        deleteUserEmoji,
        editMessage,
        deleteMessage,
        initiateCall,
        acceptCall,
        declineCall,
        endCall,
        incomingCall,
        activeCall
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
