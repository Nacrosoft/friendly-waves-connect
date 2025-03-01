
import React from 'react';
import { MessageSquare } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-secondary/30 animate-fade-in">
      <div className="p-6 rounded-full bg-secondary/50 mb-6">
        <MessageSquare className="h-12 w-12 text-primary/50" />
      </div>
      <h2 className="text-2xl font-medium mb-2">No conversation selected</h2>
      <p className="text-muted-foreground max-w-md">
        Choose a conversation from the list or start a new one to begin messaging
      </p>
    </div>
  );
}
