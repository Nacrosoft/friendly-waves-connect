
import React from 'react';
import { UserAvatar } from '@/components/UserAvatar';
import { Phone, Video, Info, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { User } from '@/types/chat';
import { useMessaging } from '@/context/MessagingContext';
import { motion } from 'framer-motion';

interface ChatHeaderProps {
  user: User;
  onBackClick?: () => void; // Added for mobile back button
}

export function ChatHeader({ user, onBackClick }: ChatHeaderProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { initiateCall } = useMessaging();
  
  if (!user) return null;
  
  const isOnline = user.status === 'online';

  const handleVoiceCall = () => {
    initiateCall(user.id, false);
  };

  const handleVideoCall = () => {
    initiateCall(user.id, true);
  };
  
  return (
    <motion.div 
      className="p-3 border-b border-border bg-card/90 backdrop-blur-md flex items-center justify-between"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        {isMobile && onBackClick && (
          <Button variant="ghost" size="icon" onClick={onBackClick} className="mr-1 hover:bg-accent/30">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <UserAvatar user={user} />
        </motion.div>
        
        <div className="flex flex-col">
          <span className="font-medium">{user.name || 'Unknown User'}</span>
          <span className="text-xs text-muted-foreground">
            {isOnline ? (
              <span className="flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                Online
              </span>
            ) : (
              user.lastSeen ? `Last seen ${new Date(user.lastSeen).toLocaleString()}` : 'Offline'
            )}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" onClick={handleVoiceCall} className="hover:bg-accent/30">
            <Phone className="h-5 w-5" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" onClick={handleVideoCall} className="hover:bg-accent/30">
            <Video className="h-5 w-5" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" className="hover:bg-accent/30">
            <Info className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
