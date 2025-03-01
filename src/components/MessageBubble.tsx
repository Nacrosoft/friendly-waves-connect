
import React from 'react';
import { Message } from '@/types/chat';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
}

export function MessageBubble({ message, isSent }: MessageBubbleProps) {
  const bubbleClass = isSent 
    ? "message-bubble message-bubble-sent animate-fade-in" 
    : "message-bubble message-bubble-received animate-fade-in";
  
  return (
    <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} mb-2 message-transition`}>
      <div className={bubbleClass}>
        {message.text}
      </div>
      <div className={`text-xs text-muted-foreground flex items-center gap-1 px-2 mt-1`}>
        {formatMessageTime(message.timestamp)}
        {isSent && (
          message.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
        )}
      </div>
    </div>
  );
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
