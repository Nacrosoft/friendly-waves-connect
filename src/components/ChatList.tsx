
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Conversation } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getOtherParticipant } from '@/data/conversations';
import { Badge } from '@/components/ui/badge';

interface ChatListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  currentUserId: string;
}

export function ChatList({ conversations, selectedConversationId, onSelectConversation, currentUserId }: ChatListProps) {
  const navigate = useNavigate();
  const [sortedConversations, setSortedConversations] = useState<Conversation[]>([]);
  
  // Sort conversations by last message time whenever conversations change
  useEffect(() => {
    const sorted = [...conversations].sort((a, b) => {
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });
    setSortedConversations(sorted);
  }, [conversations]);
  
  const handleUserClick = (event: React.MouseEvent, userId: string) => {
    event.stopPropagation();
    navigate(`/user/${userId}`);
  };
  
  return (
    <div className="flex flex-col overflow-hidden h-full animate-fade-in">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-semibold">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        {sortedConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations yet. Start chatting!
          </div>
        ) : (
          sortedConversations.map(conversation => {
            const otherUser = getOtherParticipant(conversation, currentUserId);
            const isSelected = selectedConversationId === conversation.id;
            
            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-all duration-200 ${
                  isSelected ? 'bg-muted/80' : ''
                }`}
              >
                <div className="relative">
                  <Avatar 
                    className="h-12 w-12 border border-border cursor-pointer hover:opacity-80"
                    onClick={(e) => handleUserClick(e, otherUser.id)}
                  >
                    <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                    <AvatarFallback>{otherUser.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  {otherUser.status === 'online' && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 
                      className="font-medium truncate cursor-pointer hover:underline"
                      onClick={(e) => handleUserClick(e, otherUser.id)}
                    >
                      {otherUser.name}
                    </h3>
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
          })
        )}
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const now = new Date();
  const isToday = now.toDateString() === dateObj.toDateString();
  
  if (isToday) {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If within the last week, return day name
  const daysDiff = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return dateObj.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Otherwise return date
  return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
