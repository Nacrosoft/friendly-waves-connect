
import React, { useState, useEffect } from 'react';
import { ChatList } from '@/components/ChatList';
import { ChatView } from '@/components/ChatView';
import { EmptyState } from '@/components/EmptyState';
import { AddUserDialog } from '@/components/AddUserDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserAvatar } from '@/components/UserAvatar';
import { useMessaging } from '@/context/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { MessagesSquare, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoriesRow } from "@/components/story/StoriesRow";
import { MobileNavBar } from '@/components/MobileNavBar';
import { useMediaQuery } from '@/hooks/use-media-query';

const Index = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagingContext = useMessaging();
  const { currentUser } = useAuth();
  const { conversations, selectedConversation, selectConversation } = messagingContext;
  
  // Check if screen is mobile size
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      // Select the first conversation by default
      handleConversationSelect(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);
  
  useEffect(() => {
    // On mobile, hide sidebar when a conversation is selected
    if (isMobile && selectedConversation) {
      setShowSidebar(false);
    } else if (!isMobile) {
      setShowSidebar(true);
    }
  }, [selectedConversation, isMobile]);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    selectConversation(conversationId);
  };

  const handleAddUser = (userId: string) => {
    console.log("Adding user:", userId);
    messagingContext.startNewConversation(userId);
  };
  
  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden main-content-mobile">
      <main className="flex-1 overflow-hidden">
        <div className="grid sm:grid-cols-[320px_1fr] h-full">
          {/* Sidebar - only show on larger screens or when toggled on mobile */}
          {(showSidebar || !isMobile) && (
            <div className={`border-r border-border h-full flex flex-col ${isMobile ? 'absolute inset-0 z-10 bg-background' : ''}`}>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h1 className="font-semibold text-xl">Meetefy</h1>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <UserAvatar />
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {currentUser && (
                  <ChatList 
                    conversations={conversations}
                    selectedConversationId={selectedConversation?.id}
                    onSelectConversation={(id) => {
                      handleConversationSelect(id);
                      if (isMobile) setShowSidebar(false);
                    }}
                    currentUserId={currentUser.id}
                  />
                )}
              </div>
              <div className="p-3 border-t border-border">
                <Button 
                  onClick={() => setIsAddUserDialogOpen(true)}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <PlusIcon size={16} />
                  <span>New Conversation</span>
                </Button>
                
                <AddUserDialog 
                  open={isAddUserDialogOpen}
                  onOpenChange={setIsAddUserDialogOpen}
                  onAddUser={handleAddUser}
                />
              </div>
            </div>
          )}
          
          {/* Main chat area */}
          <div className="flex flex-col h-full">
            {selectedConversation ? (
              <>
                <ChatView 
                  conversation={selectedConversation} 
                  onBackClick={isMobile ? toggleSidebar : undefined}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col overflow-auto p-4">
                <StoriesRow />
                
                <div className="flex-1 flex items-center justify-center">
                  <EmptyState 
                    icon={<MessagesSquare className="h-12 w-12 text-muted-foreground" />}
                    title="No conversation selected"
                    description="Select a conversation from the sidebar or start a new one"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation Bar */}
      <MobileNavBar />
    </div>
  );
};

export default Index;
