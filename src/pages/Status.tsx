
import React, { useEffect } from 'react';
import { StoriesRow } from '@/components/story/StoriesRow';
import { StoryProvider } from '@/context/StoryContext';
import { StoryViewer } from '@/components/story/StoryViewer';

const Status = () => {
  return (
    <StoryProvider>
      <div className="container max-w-md mx-auto p-4 pt-8 pb-20">
        <h1 className="text-2xl font-bold mb-6">Status</h1>
        
        <div className="p-4 bg-card rounded-lg border border-border">
          <h2 className="text-lg font-medium mb-4">My Status</h2>
          <StoriesRow showCreateStory />
        </div>
        
        <div className="mt-6 p-4 bg-card rounded-lg border border-border">
          <h2 className="text-lg font-medium mb-4">Recent Updates</h2>
          <StoriesRow />
        </div>
      </div>
      
      {/* Story viewer component */}
      <StoryViewer />
    </StoryProvider>
  );
};

export default Status;
