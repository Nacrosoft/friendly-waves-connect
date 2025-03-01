
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
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
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
    messagingContext.sendMessage(text, replyToMessage?.id);
    setReplyToMessage(null);
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
          attachmentUrl: base64data,
          replyToId: replyToMessage?.id // Include reply info if replying
        };
        
        // Custom function to add attachment message
        messagingContext.sendAttachmentMessage(newMessage);
        setReplyToMessage(null);
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

  const sendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    try {
      // Convert blob to base64 string
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = () => {
        const base64data = reader.result as string;
        
        // Create new voice message
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          senderId: currentUser?.id || '',
          text: '', // Empty text for voice-only messages
          timestamp: new Date(),
          read: false,
          type: 'voice',
          attachmentUrl: base64data,
          audioDuration: duration,
          replyToId: replyToMessage?.id // Include reply info if replying
        };
        
        // Send the voice message
        messagingContext.sendAttachmentMessage(newMessage);
        setReplyToMessage(null);
        scrollToBottom();
      };
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send voice message',
        variant: 'destructive'
      });
    }
  };

  const handleReaction = (messageId: string, emoji: string, isCustom?: boolean, customEmojiId?: string) => {
    messagingContext.addReaction(messageId, emoji, isCustom, customEmojiId);
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    messagingContext.editMessage(messageId, newText);
  };

  const handleReplyMessage = (messageId: string) => {
    const messageToReply = messages.find(msg => msg.id === messageId);
    if (messageToReply) {
      setReplyToMessage(messageToReply);
      // Focus on input after setting reply
      setTimeout(() => {
        const inputElement = document.querySelector('input[placeholder="Type a message..."]') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
        }
      }, 100);
    }
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  const renderMessages = () => {
    return messages.map((message) => {
      const isSent = message.senderId === currentUser?.id;
      
      // If this message is a reply, find the original message
      const replyToMessage = message.replyToId ? messages.find(msg => msg.id === message.replyToId) : null;
      
      return (
        <div key={message.id} className="flex flex-col">
          {/* Show reply information if this is a reply */}
          {replyToMessage && (
            <div 
              className={`text-xs text-muted-foreground mb-1 ${
                isSent ? 'text-right' : 'text-left'
              }`}
            >
              Replying to: <span className="italic">
                {replyToMessage.text || 
                 (replyToMessage.type === 'image' ? 'Image' : 
                  replyToMessage.type === 'video' ? 'Video' : 
                  replyToMessage.type === 'voice' ? 'Voice message' : 'File')}
              </span>
            </div>
          )}
          
          <MessageBubble
            message={message}
            isSent={isSent}
            onReaction={(emoji, isCustom, customEmojiId) => handleReaction(message.id, emoji, isCustom, customEmojiId)}
            onEdit={isSent ? handleEditMessage : undefined}
            onReply={() => handleReplyMessage(message.id)}
          />
        </div>
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
        onSendVoice={sendVoiceMessage}
        replyToMessage={replyToMessage}
        onCancelReply={cancelReply}
      />
    </div>
  );
}
