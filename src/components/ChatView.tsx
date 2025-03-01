
import React, { useState, useEffect, useRef } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import { MessageBubble } from '@/components/MessageBubble';
import { MessageInput } from '@/components/MessageInput';
import { useMessaging } from '@/context/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { StoryCircle } from './story/StoryCircle';

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
  const [isOfficialAccount, setIsOfficialAccount] = useState(false);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
      
      // Check if this is a conversation with the official Meetefy account
      const otherUser = getOtherUser();
      if (otherUser?.id === 'user-meetefy') {
        setIsOfficialAccount(true);
      } else {
        setIsOfficialAccount(false);
      }
    }
  }, [conversation]);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
    }
  }, [conversation, messagingContext.conversations]);

  const sendMessage = (text: string) => {
    // If trying to message the official account, show a notification instead
    if (isOfficialAccount) {
      toast({
        title: "Cannot message Meetefy",
        description: "This is the official Meetefy account. You cannot send messages to it.",
        variant: "destructive"
      });
      return;
    }
    
    messagingContext.sendMessage(text, replyToMessage?.id);
    setReplyToMessage(null);
    scrollToBottom();
  };

  const sendAttachment = async (file: File, type: 'image' | 'video') => {
    // If trying to message the official account, show a notification instead
    if (isOfficialAccount) {
      toast({
        title: "Cannot message Meetefy",
        description: "This is the official Meetefy account. You cannot send messages to it.",
        variant: "destructive"
      });
      return;
    }
    
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
    // If trying to message the official account, show a notification instead
    if (isOfficialAccount) {
      toast({
        title: "Cannot message Meetefy",
        description: "This is the official Meetefy account. You cannot send messages to it.",
        variant: "destructive"
      });
      return;
    }
    
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
    // Don't allow reactions in the official account chat
    if (isOfficialAccount) {
      toast({
        title: "Cannot react to Meetefy messages",
        description: "This is the official Meetefy account. You cannot react to messages in this conversation.",
        variant: "destructive"
      });
      return;
    }
    
    messagingContext.addReaction(messageId, emoji, isCustom, customEmojiId);
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    // Don't allow editing in the official account chat
    if (isOfficialAccount) {
      toast({
        title: "Cannot edit messages to Meetefy",
        description: "This is the official Meetefy account. You cannot edit messages in this conversation.",
        variant: "destructive"
      });
      return;
    }
    
    messagingContext.editMessage(messageId, newText);
  };

  const handleDeleteMessage = (messageId: string) => {
    // Don't allow deleting in the official account chat
    if (isOfficialAccount) {
      toast({
        title: "Cannot delete messages to Meetefy",
        description: "This is the official Meetefy account. You cannot delete messages in this conversation.",
        variant: "destructive"
      });
      return;
    }
    
    messagingContext.deleteMessage(messageId);
  };

  const handleReplyMessage = (messageId: string) => {
    // Don't allow replying in the official account chat
    if (isOfficialAccount) {
      toast({
        title: "Cannot reply to Meetefy messages",
        description: "This is the official Meetefy account. You cannot reply to messages in this conversation.",
        variant: "destructive"
      });
      return;
    }
    
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
            onEdit={isSent && !isOfficialAccount ? handleEditMessage : undefined}
            onReply={() => handleReplyMessage(message.id)}
            onDelete={isSent && !isOfficialAccount ? handleDeleteMessage : undefined}
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

  const otherUser = getOtherUser();

  return (
    <div className="flex flex-col h-full">
      {/* Updated to pass the other user instead of the whole conversation */}
      <ChatHeader user={otherUser} />
      
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Display user's story at top if they have one */}
        {otherUser && !isOfficialAccount && (
          <div className="flex items-center justify-center mb-4">
            <StoryCircle user={otherUser} size="sm" showName={false} />
          </div>
        )}
        
        {isOfficialAccount && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Official Meetefy Account</h3>
              <p className="text-sm text-muted-foreground mb-2">
                This is the official Meetefy account. You cannot send messages to it.
              </p>
              <a 
                href="/blog/why-cant-message-meetefy" 
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Read why &rarr;
              </a>
            </div>
          </div>
        )}
        
        {renderMessages()}
      </div>
      
      <MessageInput 
        onSendMessage={sendMessage} 
        onSendAttachment={sendAttachment}
        onSendVoice={sendVoiceMessage}
        replyToMessage={replyToMessage}
        onCancelReply={cancelReply}
        disabled={isOfficialAccount}
      />
    </div>
  );
}
