
import React, { useEffect } from 'react';
import { ChatList } from '@/components/ChatList';
import { ChatView } from '@/components/ChatView';
import { EmptyState } from '@/components/EmptyState';
import { useMessaging } from '@/context/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { initDatabase } from '@/utils/database';
import { StoriesRow } from '@/components/story/StoriesRow';
import { useStory } from '@/context/StoryContext';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { 
    conversations, 
    activeConversationId, 
    selectConversation, 
    isLoadingConversations,
    availableUsers 
  } = useMessaging();
  const { currentUser, logout } = useAuth();
  const { stories } = useStory();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize database
    const init = async () => {
      await initDatabase();
    };
    
    init();
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/auth');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  const handleGoToSettings = () => {
    navigate('/settings');
  };
  
  // Find the active conversation
  const activeConversation = conversations.find(
    conv => conv.id === activeConversationId
  );
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="w-full md:w-1/3 border-r border-border flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-border flex justify-between items-center">
          <h1 className="text-lg font-semibold">Messages</h1>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleGoToSettings}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
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
