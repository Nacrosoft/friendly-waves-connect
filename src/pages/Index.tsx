
import React, { useState } from 'react';
import { ChatList } from '@/components/ChatList';
import { ChatView } from '@/components/ChatView';
import { EmptyState } from '@/components/EmptyState';
import { conversations } from '@/data/conversations';
import { Conversation } from '@/types/chat';
import { MessageSquare, Users, Settings, Menu, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // On mobile, sidebar is closed by default
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // On mobile, close sidebar when conversation is selected
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon",
      description: "This feature will be available in a future update.",
    });
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Navigation sidebar */}
      <div className="w-16 border-r border-border flex flex-col items-center py-4 bg-card animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full h-10 w-10 transition-all ${
              sidebarOpen ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <PanelLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 text-primary"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
            onClick={showComingSoonToast}
          >
            <Users className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
            onClick={showComingSoonToast}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Conversations list */}
      <div 
        className={`border-r border-border transition-all duration-300 overflow-hidden ${
          sidebarOpen ? 'w-80' : 'w-0'
        }`}
      >
        {sidebarOpen && (
          <ChatList 
            conversations={conversations} 
            selectedConversationId={selectedConversation?.id || null}
            onSelectConversation={handleSelectConversation}
          />
        )}
      </div>
      
      {/* Chat content */}
      <div className="flex-1 flex overflow-hidden">
        {selectedConversation ? (
          <ChatView conversation={selectedConversation} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default Index;
