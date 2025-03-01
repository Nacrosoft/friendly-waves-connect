
import React, { useEffect, useRef, useState } from 'react';
import { Conversation, Message } from '@/types/chat';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { currentUser, getOtherParticipant } from '@/data/conversations';

interface ChatViewProps {
  conversation: Conversation;
}

export function ChatView({ conversation }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const otherUser = getOtherParticipant(conversation);
  
  useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: new Date(),
      read: false,
      type: 'text'
    };
    
    setMessages([...messages, newMessage]);
    
    // Simulate typing response
    setIsTyping(true);
    
    // Simulate a reply after a random delay
    const delay = 1500 + Math.random() * 3000;
    setTimeout(() => {
      setIsTyping(false);
      
      const response: Message = {
        id: `msg-${Date.now() + 1}`,
        senderId: otherUser.id,
        text: getRandomResponse(text),
        timestamp: new Date(),
        read: true,
        type: 'text'
      };
      
      setMessages(prevMessages => [...prevMessages, response]);
    }, delay);
  };
  
  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in bg-secondary/30">
      <ChatHeader user={otherUser} />
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
        <div className="flex flex-col space-y-2">
          {messages.map(message => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isSent={message.senderId === currentUser.id} 
            />
          ))}
          {isTyping && (
            <div className="message-bubble message-bubble-received typing-indicator animate-fade-in">
              <span>.</span><span>.</span><span>.</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}

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
