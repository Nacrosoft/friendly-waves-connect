
import React, { useState } from 'react';
import { ChatList } from '@/components/ChatList';
import { ChatView } from '@/components/ChatView';
import { EmptyState } from '@/components/EmptyState';
import { MessageSquare, Users, Settings, Menu, PanelLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMessaging } from '@/context/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    conversations, 
    selectedConversation, 
    selectConversation,
    isLoading: isMessagingLoading
  } = useMessaging();
  
  const { currentUser, logout, isLoading: isAuthLoading } = useAuth();
  
  const isLoading = isMessagingLoading || isAuthLoading;
  
  // On mobile, sidebar is closed by default
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);
    // On mobile, close sidebar when conversation is selected
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate('/auth');
  };

  const goToSettings = () => {
    navigate('/settings');
  };

  const showComingSoonToast = () => {
    toast({
      title: "Coming Soon",
      description: "This feature will be available in a future update.",
    });
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Navigation sidebar */}
      <div className="w-16 border-r border-border flex flex-col items-center py-4 bg-card animate-fade-in">
        <div className="flex-1 flex flex-col items-center space-y-4">
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
            onClick={goToSettings}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Logout button at bottom */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground mt-auto"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
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
            currentUserId={currentUser?.id || ''}
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

const LoadingState = () => (
  <div className="flex h-screen overflow-hidden bg-background">
    <div className="w-16 border-r border-border"></div>
    <div className="w-80 border-r border-border p-4">
      <Skeleton className="h-8 w-3/4 mb-6" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 mb-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
    <div className="flex-1 flex justify-center items-center">
      <div className="text-center">
        <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </div>
  </div>
);

export default Index;
