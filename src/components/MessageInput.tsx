
import React, { useState } from 'react';
import { Smile, Paperclip, Mic, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4 bg-card/50 backdrop-blur-md border-t border-border glass-effect">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" className="rounded-full flex-shrink-0">
          <Smile className="h-5 w-5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="rounded-full flex-shrink-0">
          <Paperclip className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="pr-10 bg-background/80 border-muted"
          />
          {!message.trim() && (
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 flex-shrink-0">
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim()} 
          variant={message.trim() ? "default" : "ghost"}
          className="rounded-full transition-all duration-200 flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
