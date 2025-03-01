
import React from 'react';
import { StoryCircle } from './StoryCircle';
import { useStory } from '@/context/StoryContext';
import { useAuth } from '@/context/AuthContext';
import { StoryCreator } from './StoryCreator';
import { Plus } from 'lucide-react';

export const StoriesRow = ({ showCreateStory = false }: { showCreateStory?: boolean }) => {
  const { currentUser } = useAuth();
  const { getUsersWithStories, viewStory, isCreatingStory, setIsCreatingStory } = useStory();
  
  if (!currentUser) return null;
  
  const userStories = getUsersWithStories();
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 py-4 px-2 min-w-max">
        {showCreateStory && (
          <div className="flex flex-col items-center">
            <button
              onClick={() => setIsCreatingStory(true)}
              className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary cursor-pointer hover:bg-primary/20 transition"
            >
              <Plus className="h-6 w-6 text-primary" />
            </button>
            <span className="text-xs mt-2 text-center">Add Story</span>
          </div>
        )}
        
        {userStories.map((user) => (
          <StoryCircle
            key={user.id}
            user={user}
            isCreateStory={false}
            className=""
            onClick={() => viewStory(user.id)}
          />
        ))}
      </div>
      
      {isCreatingStory && <StoryCreator />}
    </div>
  );
};
