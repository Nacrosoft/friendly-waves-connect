
import React, { useEffect } from 'react';
import { ChatList } from '@/components/ChatList';
import { ChatView } from '@/components/ChatView';
import { EmptyState } from '@/components/EmptyState';
import { useMessaging } from '@/context/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { initDatabase } from '@/utils/database';
import { StoriesRow } from '@/components/story/StoriesRow';
import { useStory } from '@/context/StoryContext';

const Index = () => {
  const { 
    conversations, 
    activeConversationId, 
    selectConversation, 
    isLoadingConversations,
    availableUsers 
  } = useMessaging();
  const { currentUser } = useAuth();
  const { stories } = useStory();
  
  useEffect(() => {
    // Initialize database
    const init = async () => {
      await initDatabase();
    };
    
    init();
  }, []);
  
  // Find the active conversation
  const activeConversation = conversations.find(
    conv => conv.id === activeConversationId
  );
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="w-full md:w-1/3 border-r border-border flex flex-col h-full overflow-hidden">
        <StoriesRow />
        
        {isLoadingConversations ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading conversations...</p>
          </div>
        ) : (
          <ChatList
            conversations={conversations}
            availableUsers={availableUsers}
            selectedConversationId={activeConversationId}
            onSelectConversation={selectConversation}
            currentUserId={currentUser?.id || ''}
          />
        )}
      </div>
      
      <div className="hidden md:block md:w-2/3 h-full">
        {activeConversation ? (
          <ChatView 
            conversation={activeConversation}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default Index;
