
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Conversation, User } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getOtherParticipant } from '@/data/conversations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users } from 'lucide-react';
import { useMessaging } from '@/context/MessagingContext';

interface ChatListProps {
  conversations: Conversation[];
  availableUsers: User[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  currentUserId: string;
}

export function ChatList({ 
  conversations, 
  availableUsers,
  selectedConversationId, 
  onSelectConversation, 
  currentUserId 
}: ChatListProps) {
  const navigate = useNavigate();
  const { startNewConversation } = useMessaging();
  const [activeTab, setActiveTab] = useState<string>('chats');
  
  const handleUserClick = (event: React.MouseEvent, userId: string) => {
    event.stopPropagation();
    navigate(`/user/${userId}`);
  };

  const handleStartChat = async (userId: string) => {
    await startNewConversation(userId);
  };
  
  return (
    <div className="flex flex-col overflow-hidden h-full animate-fade-in">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-semibold">Messages</h1>
      </div>

      <Tabs defaultValue="chats" className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mx-4 mt-2">
          <TabsTrigger value="chats" className="flex items-center gap-2">
            <MessageCircle size={16} />
            Chats
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users size={16} />
            Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chats" className="flex-1 overflow-y-auto scrollbar-hidden data-[state=inactive]:hidden">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations yet. Start chatting!
            </div>
          ) : (
            conversations.map(conversation => {
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
        </TabsContent>

        <TabsContent value="contacts" className="flex-1 overflow-y-auto scrollbar-hidden data-[state=inactive]:hidden">
          {availableUsers.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No contacts available.
            </div>
          ) : (
            availableUsers.map(user => (
              <div
                key={user.id}
                className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-all duration-200"
              >
                <div className="relative">
                  <Avatar 
                    className="h-12 w-12 border border-border cursor-pointer hover:opacity-80"
                    onClick={(e) => handleUserClick(e, user.id)}
                  >
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  {user.status === 'online' && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 
                      className="font-medium truncate cursor-pointer hover:underline"
                      onClick={(e) => handleUserClick(e, user.id)}
                    >
                      {user.name}
                    </h3>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-muted-foreground truncate mr-2">
                      {user.status || 'offline'}
                    </p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleStartChat(user.id)}
                      className="hover:bg-primary/10"
                    >
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
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
