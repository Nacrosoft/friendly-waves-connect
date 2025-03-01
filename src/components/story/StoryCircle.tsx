
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Story, User } from '@/types/chat';
import { useStory } from '@/context/StoryContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

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
  const { setViewingStory, setIsCreatingStory, getStoriesForUser } = useStory();
  const { currentUser } = useAuth();
  
  const stories = getStoriesForUser(user.id);
  const hasStories = stories.length > 0;
  const hasUnviewedStories = hasStories && currentUser && stories.some(story => 
    !story.viewers.includes(currentUser.id)
  );
  
  const sizeClasses = {
    sm: {
      wrapper: "h-16 w-16",
      avatar: "h-14 w-14",
      ring: "p-[2px]",
    },
    md: {
      wrapper: "h-20 w-20",
      avatar: "h-18 w-18",
      ring: "p-[2px]",
    },
    lg: {
      wrapper: "h-24 w-24",
      avatar: "h-[88px] w-[88px]",
      ring: "p-[3px]",
    },
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (isCreateStory) {
      setIsCreatingStory(true);
    } else if (hasStories) {
      // View the first story
      setViewingStory(stories[0], user, 0);
    }
  };
  
  // For the gradient ring effect when has stories
  const storyRingClasses = cn(
    "rounded-full",
    sizeClasses[size].ring,
    hasUnviewedStories 
      ? "bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500" 
      : hasStories 
        ? "bg-gray-300 dark:bg-gray-600" 
        : "bg-transparent",
    className
  );
  
  // For create story button
  const plusIconClasses = "absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm border-2 border-background";
  const plusIconSizes = {
    sm: "h-5 w-5 text-xs",
    md: "h-6 w-6 text-sm",
    lg: "h-7 w-7",
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn("flex items-center justify-center cursor-pointer", sizeClasses[size].wrapper)}
        onClick={handleClick}
      >
        <div className={storyRingClasses}>
          <Avatar className={cn("border-2 border-background", sizeClasses[size].avatar)}>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          
          {isCreateStory && (
            <div className={cn(plusIconClasses, plusIconSizes[size])}>
              +
            </div>
          )}
        </div>
      </div>
      
      {showName && (
        <span className="text-xs mt-1 text-center truncate w-full">
          {isCreateStory ? "Your Story" : user.name}
        </span>
      )}
    </div>
  );
}
