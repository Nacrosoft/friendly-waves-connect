
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
  const [showChatListDesktop, setShowChatListDesktop] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // When conversation is selected, handle view accordingly
  useEffect(() => {
    if (selectedConversation) {
      if (isMobile) {
        setShowMobileChat(true);
      } else {
        setShowChatListDesktop(false); // Hide chat list on desktop when conversation is selected
      }
    }
  }, [selectedConversation, isMobile]);
  
  // Handle back button
  const handleBackToList = () => {
    if (isMobile) {
      setShowMobileChat(false);
    } else {
      setShowChatListDesktop(true);
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <StoryProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Chat list - Hidden on mobile when conversation is selected
            - On desktop, hidden when conversation is selected AND showChatListDesktop is false */}
        <div className={`${
          (showMobileChat && isMobile) || (!showChatListDesktop && !isMobile && selectedConversation) 
            ? 'hidden' 
            : 'w-full'
        } md:w-1/3 lg:w-1/4 border-r border-border h-full overflow-hidden flex flex-col`}>
          <ChatList 
            conversations={conversations}
            selectedConversationId={selectedConversation?.id || null}
            onSelectConversation={(id) => {
              selectConversation(id);
              if (!isMobile) {
                setShowChatListDesktop(false);
              }
            }}
            currentUserId={currentUser.id}
          />
        </div>
        
        {/* Chat view - Only shown when conversation is selected */}
        <div className={`${
          (!showMobileChat && isMobile) || (!selectedConversation && !isMobile)
            ? 'hidden'
            : 'w-full'
        } h-full flex flex-col`}>
          {selectedConversation && (
            <ChatView 
              conversation={selectedConversation} 
              onBackClick={handleBackToList}
            />
          )}
        </div>
      </div>
    </StoryProvider>
  );
};

export default Chat;
