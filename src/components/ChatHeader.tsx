
import React from 'react';
import { UserAvatar } from '@/components/UserAvatar';
import { Phone, Video, Info, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { User } from '@/types/chat';

interface ChatHeaderProps {
  user: User;
  onBackClick?: () => void; // Added for mobile back button
}

export function ChatHeader({ user, onBackClick }: ChatHeaderProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  if (!user) return null;
  
  const isOnline = user.status === 'online';
  
  return (
    <div className="p-3 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isMobile && onBackClick && (
          <Button variant="ghost" size="icon" onClick={onBackClick} className="mr-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <UserAvatar user={user} />
        
        <div className="flex flex-col">
          <span className="font-medium">{user.name || 'Unknown User'}</span>
          <span className="text-xs text-muted-foreground">
            {isOnline ? (
              <span className="flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                Online
              </span>
            ) : (
              user.lastSeen ? `Last seen ${new Date(user.lastSeen).toLocaleString()}` : 'Offline'
            )}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Info className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
