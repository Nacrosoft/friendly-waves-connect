import React from 'react';
import { Conversation } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getOtherParticipant } from '@/data/conversations';
import { Badge } from '@/components/ui/badge';

interface ChatListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export function ChatList({ conversations, selectedConversationId, onSelectConversation }: ChatListProps) {
  return (
    <div className="flex flex-col overflow-hidden h-full animate-fade-in">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-semibold">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        {conversations.map(conversation => {
          const otherUser = getOtherParticipant(conversation);
          const isSelected = selectedConversationId === conversation.id;
          
          return (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-all duration-200 ${
                isSelected ? 'bg-muted/80' : ''
              }`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                  <AvatarFallback>{otherUser.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                {otherUser.status === 'online' && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium truncate">{otherUser.name}</h3>
                  <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                    {formatTime(conversation.lastMessageTime)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-muted-foreground truncate mr-2">
                    {conversation.lastMessageText}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <Badge variant="default" className="rounded-full px-[0.35rem] py-px min-w-[1.25rem] h-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const isToday = now.toDateString() === date.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If within the last week, return day name
  const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Otherwise return date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
