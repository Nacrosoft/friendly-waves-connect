import React from 'react';
import { StoryCircle } from './StoryCircle';
import { useStory } from '@/context/StoryContext';
import { useAuth } from '@/context/AuthContext';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function StoriesRow() {
  const { getUsersWithStories } = useStory();
  const { currentUser } = useAuth();
  
  const usersWithStories = getUsersWithStories();
  
  // Filter out current user from the list
  const otherUsersWithStories = usersWithStories.filter(
    user => user.id !== currentUser?.id
  );
  
  if (!currentUser) return null;
  
  return (
    <div className="w-full mb-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 p-2">
          {/* Current user's story circle (for creating stories) */}
          <StoryCircle 
            user={currentUser} 
            isCreateStory={true} 
            size="md"
          />
          
          {/* Other users' story circles */}
          {otherUsersWithStories.map(user => (
            <StoryCircle
              key={user.id}
              user={user}
              size="md"
            />
          ))}
          
          {/* If no other users have stories, show a message */}
          {otherUsersWithStories.length === 0 && (
            <div className="flex items-center justify-center h-16 text-sm text-muted-foreground">
              No stories to view. Be the first to share a story!
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
