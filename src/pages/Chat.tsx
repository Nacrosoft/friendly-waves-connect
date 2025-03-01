
import React, { useState, useEffect } from 'react';
import { ChatView } from '@/components/ChatView';
import { ChatList } from '@/components/ChatList';
import { StoryProvider } from '@/context/StoryContext';
import { useAuth } from '@/context/AuthContext';
import { useMessaging } from '@/context/MessagingContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

const Chat = () => {
  const { currentUser } = useAuth();
  const { conversations, selectedConversation, selectConversation } = useMessaging();
  const [showMobileChat, setShowMobileChat] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // When conversation is selected on mobile, show the chat view
  useEffect(() => {
    if (selectedConversation && isMobile) {
      setShowMobileChat(true);
    }
  }, [selectedConversation, isMobile]);
  
  // Handle back button on mobile
  const handleBackToList = () => {
    setShowMobileChat(false);
  };
  
  if (!currentUser) return null;
  
  return (
    <StoryProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Chat list - Hidden on mobile when conversation is selected */}
        <div className={`${
          showMobileChat && isMobile ? 'hidden' : 'w-full'
        } md:w-1/3 lg:w-1/4 border-r border-border h-full overflow-hidden flex flex-col`}>
          <ChatList 
            conversations={conversations}
            selectedConversationId={selectedConversation?.id || null}
            onSelectConversation={selectConversation}
            currentUserId={currentUser.id}
          />
        </div>
        
        {/* Chat view - Only shown on mobile when conversation is selected */}
        <div className={`${
          !showMobileChat && isMobile ? 'hidden' : 'w-full'
        } md:w-2/3 lg:w-3/4 h-full flex flex-col`}>
          {isMobile && selectedConversation && (
            <div className="p-2 border-b">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToList}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>
          )}
          
          <div className="flex-1 overflow-hidden">
            {selectedConversation ? (
              <ChatView conversation={selectedConversation} />
            ) : (
              <div className="h-full flex items-center justify-center p-4">
                <p className="text-muted-foreground text-center">
                  Select a conversation to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StoryProvider>
  );
};

export default Chat;
