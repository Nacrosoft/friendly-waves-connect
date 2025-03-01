
import React, { useEffect, useRef, useState } from 'react';
import { Conversation, Message } from '@/types/chat';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { getOtherParticipant } from '@/data/conversations';
import { useMessaging } from '@/context/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { AddUserDialog } from './AddUserDialog';
import { useToast } from '@/hooks/use-toast';

interface ChatViewProps {
  conversation: Conversation;
}

export function ChatView({ conversation }: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, addReaction, startNewConversation } = useMessaging();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  const otherUser = getOtherParticipant(conversation, currentUser?.id || '');
  
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (text: string) => {
    sendMessage(text);
  };
  
  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  };

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
    <div className="flex flex-col h-full overflow-hidden animate-fade-in bg-secondary/30">
      <ChatHeader user={otherUser} />
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
        <div className="flex flex-col space-y-2">
          {conversation.messages.map(message => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isSent={message.senderId === currentUser?.id}
              onReaction={(emoji) => handleReaction(message.id, emoji)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex items-center">
        <Button 
          onClick={() => setIsAddUserDialogOpen(true)}
          variant="ghost" 
          size="icon"
          className="rounded-full h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
      <AddUserDialog 
        open={isAddUserDialogOpen} 
        onOpenChange={setIsAddUserDialogOpen} 
        onAddUser={handleAddUser}
      />
    </div>
  );
}
