
import React, { useState, ReactNode } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddUserDialog } from './AddUserDialog';
import { useMessaging } from '@/context/MessagingContext';
import { useToast } from '@/hooks/use-toast';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
}

export function EmptyState({ 
  icon = <MessageSquare className="h-12 w-12 text-primary" />,
  title = "No conversation selected",
  description = "Choose a conversation from the sidebar or start a new one to begin messaging"
}: EmptyStateProps) {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const { startNewConversation } = useMessaging();
  const { toast } = useToast();

  const handleAddUser = async (userId: string) => {
    try {
      await startNewConversation(userId);
      toast({
        title: 'Success',
        description: 'New conversation started',
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Could not start conversation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 animate-fade-in">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        {description}
      </p>
      <Button onClick={() => setIsAddUserDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Conversation
      </Button>
      
      <AddUserDialog 
        open={isAddUserDialogOpen} 
        onOpenChange={setIsAddUserDialogOpen} 
        onAddUser={handleAddUser}
      />
    </div>
  );
}
