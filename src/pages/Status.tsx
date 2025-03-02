
import React, { useEffect } from 'react';
import { StoriesRow } from '@/components/story/StoriesRow';
import { StoryProvider } from '@/context/StoryContext';
import { StoryViewer } from '@/components/story/StoryViewer';
import { motion } from 'framer-motion';

const Status = () => {
  return (
    <StoryProvider>
      <div className="container max-w-md md:max-w-2xl mx-auto p-4 pt-8 pb-20 md:p-8 md:pb-12 animate-fade-in">
        <motion.h1 
          className="text-2xl font-bold mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Status
        </motion.h1>
        
        <motion.div 
          className="p-4 bg-card rounded-lg border border-border shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-lg font-medium mb-4">My Status</h2>
          <StoriesRow showCreateStory />
        </motion.div>
        
        <motion.div 
          className="mt-6 p-4 bg-card rounded-lg border border-border shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-lg font-medium mb-4">Recent Updates</h2>
          <StoriesRow />
        </motion.div>
      </div>
      
      {/* Story viewer component */}
      <StoryViewer />
    </StoryProvider>
  );
};

export default Status;
