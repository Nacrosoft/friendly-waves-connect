
import React, { useState } from 'react';
import { Message } from '@/types/chat';
import { format } from 'date-fns';
import { Smile } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  onReaction?: (emoji: string) => void;
}

const emojis = ['👍', '❤️', '😂', '😮', '😢', '👏'];

export function MessageBubble({ message, isSent, onReaction }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  
  // Convert string date to Date object if needed
  const timestamp = message.timestamp instanceof Date 
    ? message.timestamp 
    : new Date(message.timestamp);
  
  return (
    <div 
      className={`group flex flex-col max-w-[80%] ${
        isSent ? 'ml-auto items-end' : 'mr-auto items-start'
      }`}
    >
      <div 
        className={`relative px-4 py-2 rounded-2xl ${
          isSent 
            ? 'bg-primary text-primary-foreground rounded-tr-none' 
            : 'bg-card text-card-foreground rounded-tl-none'
        }`}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
      >
        {message.text}
        
        {showReactions && onReaction && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={`absolute -bottom-8 ${isSent ? 'left-0' : 'right-0'} bg-card p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                <Smile className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isSent ? 'start' : 'end'} className="flex p-1">
              {emojis.map(emoji => (
                <DropdownMenuItem key={emoji} onClick={() => onReaction(emoji)} className="cursor-pointer">
                  {emoji}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Time */}
      <span className="text-xs text-muted-foreground mt-1">
        {format(timestamp, 'p')}
      </span>
      
      {/* Reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div className={`flex mt-1 gap-0.5 ${isSent ? 'justify-end' : 'justify-start'}`}>
          {/* Group and count reactions by emoji */}
          {Object.entries(
            message.reactions.reduce((acc, reaction) => {
              acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([emoji, count]) => (
            <span 
              key={emoji} 
              className="bg-background text-xs rounded-full px-1.5 py-0.5 border border-border"
            >
              {emoji} {count > 1 && count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
