
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Video, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  user: User;
}

export function ChatHeader({ user }: ChatHeaderProps) {
  const navigate = useNavigate();
  
  const handleUserClick = () => {
    navigate(`/user/${user.id}`);
  };
  
  const isVerifiedUser = user.id === 'user-meetefy';
  
  return (
    <div className="border-b border-border p-4 flex items-center justify-between bg-card/50 backdrop-blur-md glass-effect z-10 animate-fade-in">
      <div 
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleUserClick}
      >
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <h2 className="font-medium">{user.name}</h2>
            {isVerifiedUser && (
              <BadgeCheck className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <span 
              className={`h-2 w-2 rounded-full ${
                user.status === 'online' 
                  ? 'bg-green-500' 
                  : user.status === 'away' 
                  ? 'bg-yellow-500' 
                  : 'bg-gray-400'
              }`} 
            />
            <span className="text-xs text-muted-foreground">
              {user.status === 'online' 
                ? 'Online' 
                : user.status === 'away' 
                ? 'Away' 
                : `Last seen ${new Date(user.lastSeen || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              }
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
