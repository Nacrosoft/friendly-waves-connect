import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ChatList } from "@/components/ChatList";
import { ChatView } from "@/components/ChatView";
import { EmptyState } from "@/components/EmptyState";
import { AddUserDialog } from "@/components/AddUserDialog";
import { UserAvatar } from "@/components/UserAvatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StoriesRow } from "@/components/story/StoriesRow";
import { useMessaging } from "@/context/MessagingContext";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const newUser = searchParams.get("newUser");
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);

  const { conversations, selectedConversationId, selectConversation } = useMessaging();
  const { currentUser } = useAuth();
  const [showAddUserDialog, setShowAddUserDialog] = React.useState(false);

  useEffect(() => {
    if (isFirstLoad) {
      if (newUser === "true") {
        setShowAddUserDialog(true);
      }
      setIsFirstLoad(false);
    }
  }, [newUser, isFirstLoad]);

  const handleAddUser = (userId: string) => {
    console.log("Adding user:", userId);
    setShowAddUserDialog(false);
    setSearchParams({});
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:flex w-72 flex-col border-r border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserAvatar />
          </div>
        </div>
        
        <StoriesRow />
        
        <ChatList 
          conversations={conversations} 
          selectedConversationId={selectedConversationId} 
          onSelectConversation={selectConversation}
          currentUserId={currentUser?.id || ''}
        />
        
        <AddUserDialog 
          open={showAddUserDialog} 
          onOpenChange={setShowAddUserDialog} 
          onAddUser={handleAddUser}
        />
      </div>
      <div className="flex flex-col flex-1">
        {selectedConversationId ? (
          <ChatView 
            conversationId={selectedConversationId} 
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default Index;
