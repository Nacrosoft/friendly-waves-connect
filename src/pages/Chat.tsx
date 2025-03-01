
import React from 'react';
import { ChatView } from '@/components/ChatView';
import { ChatList } from '@/components/ChatList';
import { StoriesRow } from '@/components/story/StoriesRow';
import { StoryProvider } from '@/context/StoryContext';

const Chat = () => {
  return (
    <StoryProvider>
      <div className="flex h-screen bg-background">
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-border h-full overflow-hidden flex flex-col">
          <StoriesRow />
          <ChatList />
        </div>
        <div className="hidden md:block md:w-2/3 lg:w-3/4 h-full">
          <ChatView />
        </div>
      </div>
    </StoryProvider>
  );
};

export default Chat;
