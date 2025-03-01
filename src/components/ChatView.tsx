
import React, { useEffect, useRef } from 'react';
import { Conversation, Message } from '@/types/chat';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { getOtherParticipant } from '@/data/conversations';
import { useMessaging } from '@/context/MessagingContext';

interface ChatViewProps {
  conversation: Conversation;
}

export function ChatView({ conversation }: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser, sendMessage, addReaction } = useMessaging();
  
  const otherUser = getOtherParticipant(conversation);
  
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (text: string) => {
    sendMessage(text);
  };
  
  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  };
  
  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in bg-secondary/30">
      <ChatHeader user={otherUser} />
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
        <div className="flex flex-col space-y-2">
          {conversation.messages.map(message => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isSent={message.senderId === currentUser.id}
              onReaction={(emoji) => handleReaction(message.id, emoji)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}
