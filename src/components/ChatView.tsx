import React, { useState, useEffect, useRef } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import { MessageBubble } from '@/components/MessageBubble';
import { MessageInput } from '@/components/MessageInput';
import { useMessaging } from '@/context/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Lock } from 'lucide-react';
import { StoryCircle } from './story/StoryCircle';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface ChatViewProps {
  conversation: any;
  onBackClick: () => void; // Required for back button functionality
}

export function ChatView({ conversation, onBackClick }: ChatViewProps) {
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
      
      const otherUser = getOtherUser();
      if (otherUser?.id === 'user-meetefy') {
        setIsOfficialAccount(true);
      } else {
        setIsOfficialAccount(false);
      }
    }
  }, [conversation]);

  useEffect(() => {
    if (conversation && messagingContext.selectedConversation?.id === conversation.id) {
      setMessages(messagingContext.selectedConversation.messages);
    }
  }, [conversation, messagingContext.selectedConversation]);

  const sendMessage = (text: string) => {
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
    if (isOfficialAccount) {
      toast({
        title: "Cannot message Meetefy",
        description: "This is the official Meetefy account. You cannot send messages to it.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = () => {
        const base64data = reader.result as string;
        
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          senderId: currentUser?.id || '',
          text: '',
          timestamp: new Date(),
          read: false,
          type: type,
          attachmentUrl: base64data,
          replyToId: replyToMessage?.id
        };
        
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
    if (isOfficialAccount) {
      toast({
        title: "Cannot message Meetefy",
        description: "This is the official Meetefy account. You cannot send messages to it.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = () => {
        const base64data = reader.result as string;
        
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          senderId: currentUser?.id || '',
          text: '',
          timestamp: new Date(),
          read: false,
          type: 'voice',
          attachmentUrl: base64data,
          audioDuration: duration,
          replyToId: replyToMessage?.id
        };
        
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
      
      const replyToMessage = message.replyToId ? messages.find(msg => msg.id === message.replyToId) : null;
      
      return (
        <div key={message.id} className="flex flex-col">
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

  const getOtherUser = () => {
    if (!conversation || !currentUser) return null;
    return conversation.participants.find(user => user.id !== currentUser.id);
  };

  const otherUser = getOtherUser();

  return (
    <div className="flex flex-col h-full">
      <ChatHeader user={otherUser} onBackClick={onBackClick} />
      
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
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
        
        {/* End-to-End Encryption Information */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center justify-center">
              <button className="text-xs text-muted-foreground flex items-center gap-1.5 hover:text-primary transition-colors">
                <Lock className="h-3 w-3" />
                End-to-End Encryption
              </button>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>End-to-End Encryption</DialogTitle>
              <DialogDescription>
                Your messages are protected with advanced encryption technology.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p>End-to-End Encryption (E2EE) ensures that your conversations remain private. Only you and the person you're communicating with can read the messages.</p>
              
              <div className="bg-secondary/30 p-3 rounded-md text-sm">
                <p className="font-medium mb-2">How it works:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Messages are encrypted on your device before being sent</li>
                  <li>Only the recipient's device can decrypt the messages</li>
                  <li>Not even Meetefy can read your encrypted conversations</li>
                  <li>All media and attachments are also encrypted</li>
                </ul>
              </div>
              
              <p className="text-sm text-muted-foreground">
                This level of security means your conversations are protected from third parties, including service providers and potential attackers.
              </p>
            </div>
          </DialogContent>
        </Dialog>
        
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
