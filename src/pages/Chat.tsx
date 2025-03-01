
import React, { useState } from 'react';
import { ChatView } from '@/components/ChatView';
import { ChatList } from '@/components/ChatList';
import { StoriesRow } from '@/components/story/StoriesRow';
import { StoryProvider } from '@/context/StoryContext';
import { useAuth } from '@/context/AuthContext';
import { useMessaging } from '@/context/MessagingContext';

const Chat = () => {
  const { currentUser } = useAuth();
  const { conversations, selectedConversation, selectConversation } = useMessaging();
  
  return (
    <StoryProvider>
      <div className="flex h-screen bg-background">
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-border h-full overflow-hidden flex flex-col">
          <StoriesRow />
          <ChatList 
            conversations={conversations}
            selectedConversationId={selectedConversation?.id || null}
            onSelectConversation={selectConversation}
            currentUserId={currentUser?.id || ''}
          />
        </div>
        <div className="hidden md:block md:w-2/3 lg:w-3/4 h-full">
          <ChatView conversation={selectedConversation} />
        </div>
      </div>
    </StoryProvider>
  );
};

export default Chat;
