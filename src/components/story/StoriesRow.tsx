
import React from 'react';
import { StoryCircle } from './StoryCircle';
import { useStory } from '@/context/StoryContext';
import { useAuth } from '@/context/AuthContext';
import { StoryCreator } from './StoryCreator';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const StoriesRow = ({ showCreateStory = false }: { showCreateStory?: boolean }) => {
  const { currentUser } = useAuth();
  const { getUsersWithStories, viewStory, isCreatingStory, setIsCreatingStory } = useStory();
  
  if (!currentUser) return null;
  
  const userStories = getUsersWithStories();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };
  
  return (
    <div className="w-full overflow-x-auto scrollbar-none pb-1">
      <motion.div 
        className="flex gap-3 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {showCreateStory && (
          <motion.div 
            className="flex flex-col items-center max-w-[65px]"
            variants={itemVariants}
          >
            <div className="relative">
              <button
                onClick={() => setIsCreatingStory(true)}
                className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 relative overflow-hidden"
                aria-label="Add story"
              >
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
              </button>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs border-2 border-background">
                +
              </div>
            </div>
            <span className="text-xs mt-1 text-center w-full truncate font-normal">Add Story</span>
          </motion.div>
        )}
        
        {userStories.map((user) => (
          <motion.div key={user.id} variants={itemVariants} className="flex flex-col items-center max-w-[65px]">
            <StoryCircle
              user={user}
              isCreateStory={false}
              onClick={() => viewStory(user.id)}
            />
          </motion.div>
        ))}

        {userStories.length === 0 && showCreateStory && (
          <motion.div 
            className="flex flex-col items-center justify-center ml-4"
            variants={itemVariants}
          >
            <p className="text-xs text-muted-foreground">No stories yet</p>
          </motion.div>
        )}
      </motion.div>
      
      {isCreatingStory && <StoryCreator />}
    </div>
  );
};
