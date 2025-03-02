
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
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent pb-2">
      <motion.div 
        className="flex gap-5 py-4 px-2 min-w-max"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {showCreateStory && (
          <motion.div 
            className="flex flex-col items-center"
            variants={itemVariants}
          >
            <button
              onClick={() => setIsCreatingStory(true)}
              className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-dashed border-primary cursor-pointer hover:from-indigo-500/30 hover:to-purple-500/30 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Plus className="h-6 w-6 text-primary" />
            </button>
            <span className="text-xs mt-2 text-center font-medium">Add Story</span>
          </motion.div>
        )}
        
        {userStories.map((user, index) => (
          <motion.div key={user.id} variants={itemVariants}>
            <StoryCircle
              user={user}
              isCreateStory={false}
              className=""
              onClick={() => viewStory(user.id)}
            />
          </motion.div>
        ))}

        {userStories.length === 0 && showCreateStory && (
          <motion.div 
            className="flex flex-col items-center justify-center px-4 py-2"
            variants={itemVariants}
          >
            <p className="text-sm text-muted-foreground">No stories yet</p>
            <p className="text-xs text-muted-foreground">Be the first to share</p>
          </motion.div>
        )}
      </motion.div>
      
      {isCreatingStory && <StoryCreator />}
    </div>
  );
};
