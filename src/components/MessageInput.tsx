
import React, { useState, useRef } from 'react';
import { Smile, Paperclip, Mic, Send, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { CustomEmoji, Message } from '@/types/chat';
import { useAuth } from '@/context/AuthContext';
import CustomEmojiCreator from './CustomEmojiCreator';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendAttachment?: (file: File, type: 'image' | 'video') => void;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
}

const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '😊', '🙏'];

export function MessageInput({ 
  onSendMessage, 
  onSendAttachment, 
  replyToMessage,
  onCancelReply 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<'image' | 'video' | null>(null);
  const [showEmojiCreator, setShowEmojiCreator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attachment && onSendAttachment && attachmentType) {
      onSendAttachment(attachment, attachmentType);
      clearAttachment();
      return;
    }
    
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image or video
    if (file.type.startsWith('image/')) {
      setAttachmentType('image');
    } else if (file.type.startsWith('video/')) {
      setAttachmentType('video');
    } else {
      toast({
        title: 'Unsupported file type',
        description: 'Please select an image or video file',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'File size should be less than 10MB',
        variant: 'destructive',
      });
      return;
    }
    
    setAttachment(file);
    const previewUrl = URL.createObjectURL(file);
    setAttachmentPreview(previewUrl);
    
    // Clear the file input value so the same file can be selected again
    e.target.value = '';
  };
  
  const clearAttachment = () => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }
    setAttachment(null);
    setAttachmentPreview(null);
    setAttachmentType(null);
  };
  
  const addEmojiToMessage = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };
  
  const addCustomEmojiToMessage = (emoji: CustomEmoji) => {
    // In a real app, you might add a special token that gets replaced with the custom emoji
    // Here we're just adding the emoji name as a placeholder
    setMessage(prev => prev + `:${emoji.name}:`);
  };
  
  const handleEmojiCreated = (emoji: CustomEmoji) => {
    toast({
      title: 'Emoji Created',
      description: `Custom emoji "${emoji.name}" is now available`,
    });
  };

  const handleCancelReply = () => {
    if (onCancelReply) {
      onCancelReply();
    }
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 bg-card/50 backdrop-blur-md border-t border-border glass-effect">
        {/* Reply indicator */}
        {replyToMessage && (
          <div className="mb-2 bg-secondary/30 p-2 rounded-md border border-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium">Replying to message</span>
              <span className="text-sm text-muted-foreground truncate">
                {replyToMessage.text || (replyToMessage.type === 'image' ? 'Image' : 'Video')}
              </span>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={handleCancelReply}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {attachment && attachmentPreview && (
          <div className="mb-2 relative">
            <div className="flex items-center gap-2 p-2 bg-background rounded-md border border-border">
              <div className="relative w-16 h-16 rounded overflow-hidden">
                {attachmentType === 'image' ? (
                  <img 
                    src={attachmentPreview} 
                    alt="Attachment preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video 
                    src={attachmentPreview} 
                    className="w-full h-full object-cover" 
                    autoPlay 
                    muted 
                    loop
                  />
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              </div>
              
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={clearAttachment}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                <Smile className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="p-2">
              <div className="grid grid-cols-4 gap-2 mb-2">
                {emojis.map((emoji) => (
                  <Button 
                    key={emoji} 
                    variant="ghost" 
                    className="h-8 w-8 p-0" 
                    onClick={() => addEmojiToMessage(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
              
              {currentUser?.customEmojis && currentUser.customEmojis.length > 0 && (
                <>
                  <div className="h-px bg-border my-2" />
                  <div className="text-xs text-muted-foreground mb-1 px-2">Custom Emojis</div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {currentUser.customEmojis.map((emoji) => (
                      <Button 
                        key={emoji.id} 
                        variant="ghost" 
                        className="h-8 w-8 p-0 overflow-hidden" 
                        onClick={() => addCustomEmojiToMessage(emoji)}
                      >
                        {emoji.type === 'image' ? (
                          <img src={emoji.url} alt={emoji.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <video src={emoji.url} className="w-6 h-6 object-contain" autoPlay muted loop />
                        )}
                      </Button>
                    ))}
                  </div>
                </>
              )}
              
              <div className="h-px bg-border my-2" />
              <DropdownMenuItem 
                className="cursor-pointer justify-center font-medium text-sm text-primary"
                onClick={() => setShowEmojiCreator(true)}
              >
                Create Custom Emoji
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="rounded-full flex-shrink-0"
            onClick={handleFileSelect}
          >
            <Paperclip className="h-5 w-5" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </Button>
          
          <div className="relative flex-1">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pr-10 bg-background/80 border-muted"
              disabled={!!attachment}
            />
            {!message.trim() && !attachment && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 flex-shrink-0"
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!message.trim() && !attachment} 
            variant={(message.trim() || attachment) ? "default" : "ghost"}
            className="rounded-full transition-all duration-200 flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
      
      <CustomEmojiCreator
        open={showEmojiCreator}
        onOpenChange={setShowEmojiCreator}
        onEmojiCreated={handleEmojiCreated}
      />
    </>
  );
}
