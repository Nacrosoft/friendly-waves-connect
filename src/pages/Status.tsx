
import React from 'react';
import { StoriesRow } from '@/components/story/StoriesRow';
import { StoryProvider } from '@/context/StoryContext';
import { StoryViewer } from '@/components/story/StoryViewer';
import { motion } from 'framer-motion';

const Status = () => {
  return (
    <StoryProvider>
      <div className="container max-w-md mx-auto p-4 pt-8 pb-20 animate-fade-in">
        <motion.h1 
          className="text-xl font-semibold mb-6 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Stories
        </motion.h1>
        
        <div className="space-y-6">
          <motion.div 
            className="rounded-xl overflow-hidden bg-background shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="px-4 py-3 border-b border-border/20">
              <h2 className="text-sm font-medium text-foreground/90">Your Story</h2>
            </div>
            <div className="py-2">
              <StoriesRow showCreateStory />
            </div>
          </motion.div>
          
          <motion.div 
            className="rounded-xl overflow-hidden bg-background shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="px-4 py-3 border-b border-border/20">
              <h2 className="text-sm font-medium text-foreground/90">Recent Updates</h2>
            </div>
            <div className="py-2">
              <StoriesRow />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Story viewer component */}
      <StoryViewer />
    </StoryProvider>
  );
};

export default Status;
