
import React, { useState, useEffect, useRef } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import { MessageBubble } from '@/components/MessageBubble';
import { MessageInput } from '@/components/MessageInput';
import { useMessaging } from '@/context/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

interface ChatViewProps {
  conversation: any;
}

export function ChatView({ conversation }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagingContext = useMessaging();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
    }
  }, [conversation]);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
    }
  }, [conversation, messagingContext.conversations]);

  const sendMessage = (text: string) => {
    messagingContext.sendMessage(text);
    scrollToBottom();
  };

  const sendAttachment = async (file: File, type: 'image' | 'video') => {
    try {
      // Convert file to base64 string
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = () => {
        const base64data = reader.result as string;
        
        // Create new message with attachment
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          senderId: currentUser?.id || '',
          text: '', // Empty text for attachment-only messages
          timestamp: new Date(),
          read: false,
          type: type,
          attachmentUrl: base64data
        };
        
        // Custom function to add attachment message
        messagingContext.sendAttachmentMessage(newMessage);
        scrollToBottom();
      };
    } catch (error) {
      console.error('Error sending attachment:', error);
      toast({
        title: 'Error',
        description: 'Failed to send attachment',
        variant: 'destructive'
      });
    }
  };

  const handleReaction = (messageId: string, emoji: string, isCustom?: boolean, customEmojiId?: string) => {
    messagingContext.addReaction(messageId, emoji, isCustom, customEmojiId);
  };

  const renderMessages = () => {
    return messages.map((message) => {
      const isSent = message.senderId === currentUser?.id;
      
      return (
        <MessageBubble
          key={message.id}
          message={message}
          isSent={isSent}
          onReaction={(emoji, isCustom, customEmojiId) => handleReaction(message.id, emoji, isCustom, customEmojiId)}
        />
      );
    });
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Find the other user in the conversation to pass to ChatHeader
  const getOtherUser = () => {
    if (!conversation || !currentUser) return null;
    return conversation.participants.find(user => user.id !== currentUser.id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Updated to pass the other user instead of the whole conversation */}
      <ChatHeader user={getOtherUser()} />
      
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {renderMessages()}
      </div>
      
      <MessageInput 
        onSendMessage={sendMessage} 
        onSendAttachment={sendAttachment}
      />
    </div>
  );
}
