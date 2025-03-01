
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

// Import the StoriesRow component
import { StoriesRow } from "@/components/story/StoriesRow";

const Index = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const messagingContext = useMessaging();
  const { currentUser } = useAuth();
  const { conversations, selectedConversation, selectConversation } = messagingContext;

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      // Select the first conversation by default
      handleConversationSelect(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    selectConversation(conversationId);
  };

  const handleAddUser = (userId: string) => {
    console.log("Adding user:", userId);
    messagingContext.startNewConversation(userId);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 overflow-hidden">
        <div className="grid lg:grid-cols-[320px_1fr] h-full">
          <div className="border-r border-border h-full flex flex-col">
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
                  onSelectConversation={handleConversationSelect}
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
          <div className="flex flex-col h-full">
            {selectedConversation ? (
              <ChatView conversation={selectedConversation} />
            ) : (
              <div className="flex-1 flex flex-col overflow-auto p-4">
                {/* Add StoriesRow here */}
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
    </div>
  );
};

export default Index;
