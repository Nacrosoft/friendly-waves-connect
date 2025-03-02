
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types/chat';
import { useStory } from '@/context/StoryContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StoryCircleProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  isCreateStory?: boolean;
  className?: string;
  onClick?: () => void;
}

export function StoryCircle({ 
  user, 
  size = 'md', 
  showName = true, 
  isCreateStory = false,
  className,
  onClick
}: StoryCircleProps) {
  const { getStoriesForUser } = useStory();
  const { currentUser } = useAuth();
  
  const stories = getStoriesForUser(user.id);
  const hasStories = stories.length > 0;
  const hasUnviewedStories = hasStories && currentUser && stories.some(story => 
    !story.viewers.includes(currentUser.id)
  );
  
  const sizeClasses = {
    sm: {
      wrapper: "h-12 w-12",
      avatar: "h-10 w-10",
      ring: "p-[2px]",
    },
    md: {
      wrapper: "h-14 w-14",
      avatar: "h-[52px] w-[52px]",
      ring: "p-[2px]",
    },
    lg: {
      wrapper: "h-16 w-16",
      avatar: "h-[60px] w-[60px]",
      ring: "p-[2px]",
    },
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  
  // For the gradient ring effect when has stories
  const storyRingClasses = cn(
    "rounded-full flex items-center justify-center",
    sizeClasses[size].ring,
    hasUnviewedStories 
      ? "bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500" 
      : hasStories 
        ? "bg-gray-300 dark:bg-gray-600" 
        : "bg-transparent",
    className
  );
  
  return (
    <div className="flex flex-col items-center w-full">
      <motion.div 
        className={cn("cursor-pointer transition-transform duration-300", sizeClasses[size].wrapper)}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className={storyRingClasses}>
          <Avatar className={cn("border-2 border-background", sizeClasses[size].avatar)}>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-sm">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </motion.div>
      
      {showName && (
        <span className="text-xs mt-1 text-center truncate w-full font-normal">
          {user.name}
        </span>
      )}
    </div>
  );
}
