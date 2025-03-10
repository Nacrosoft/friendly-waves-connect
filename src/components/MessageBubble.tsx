import React, { useState, useRef } from 'react';
import { Message } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Smile, Reply, Pencil, Play, Pause, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMessaging } from '@/context/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { TextToSpeech } from './TextToSpeech';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  onReaction: (emoji: string, isCustom?: boolean, customEmojiId?: string) => void;
  onEdit?: (messageId: string, newText: string) => void;
  onReply: () => void;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({ message, isSent, onReaction, onEdit, onReply, onDelete }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showReactions, setShowReactions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { currentUser } = useAuth();
  const { conversations } = useMessaging();
  
  const getSender = () => {
    for (const conversation of conversations) {
      const sender = conversation.participants.find(user => user.id === message.senderId);
      if (sender) return sender;
    }
    return null;
  };
  
  const sender = getSender();
  
  const handleSaveEdit = () => {
    if (onEdit && editText.trim() !== message.text) {
      onEdit(message.id, editText.trim());
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(message.text);
    }
  };
  
  const renderEmojis = () => {
    const defaultEmojis = ['👍', '❤️', '😂', '😮', '😡', '👏'];
    
    return (
      <div className="flex space-x-1 mb-1">
        {defaultEmojis.map(emoji => (
          <button
            key={emoji}
            className="hover:bg-secondary rounded-full p-1"
            onClick={() => onReaction(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  };
  
  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;
    
    const groupedReactions = message.reactions.reduce((acc, reaction) => {
      const key = reaction.isCustom ? `custom-${reaction.customEmojiId}` : reaction.emoji;
      if (!acc[key]) {
        acc[key] = { 
          emoji: reaction.emoji, 
          count: 0, 
          isCustom: reaction.isCustom,
          customEmojiId: reaction.customEmojiId,
          users: []
        };
      }
      acc[key].count++;
      acc[key].users.push(reaction.userId);
      return acc;
    }, {} as Record<string, {emoji: string, count: number, isCustom?: boolean, customEmojiId?: string, users: string[]}>);
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.values(groupedReactions).map((reaction, index) => (
          <div 
            key={index}
            className="flex items-center bg-secondary/30 rounded-full px-2 py-0.5 text-xs"
          >
            <span>{reaction.emoji}</span>
            <span className="ml-1">{reaction.count}</span>
          </div>
        ))}
      </div>
    );
  };
  
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (message.deleted) {
    return (
      <div className={`flex mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}>
        {!isSent && sender && (
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={sender.avatar} alt={sender.name} />
            <AvatarFallback>{sender.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-[75%] ${isSent ? 'order-1' : 'order-2'}`}>
          <div 
            className={`rounded-lg px-4 py-2 ${
              isSent 
                ? 'bg-primary/30 text-primary-foreground/70' 
                : 'bg-card/70 border border-border text-muted-foreground'
            }`}
          >
            <div className="italic text-sm">This message was deleted</div>
            <div className={`text-xs mt-1 ${isSent ? 'text-primary-foreground/40' : 'text-muted-foreground/70'}`}>
              {format(new Date(message.timestamp), 'h:mm a')}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`flex mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {!isSent && sender && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={sender.avatar} alt={sender.name} />
          <AvatarFallback>{sender.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[75%] relative ${isSent ? 'order-1' : 'order-2'}`}>
        {showReactions && !isEditing && (
          <div className={`absolute -top-8 ${isSent ? 'right-0' : 'left-0'} bg-card border border-border rounded-full shadow-md z-10`}>
            {renderEmojis()}
          </div>
        )}
        
        <div 
          className={`rounded-lg px-4 py-2 ${
            isSent 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-card border border-border'
          }`}
        >
          {message.type === 'text' && !isEditing && (
            <div className="break-words whitespace-pre-wrap">{message.text}</div>
          )}
          
          {message.type === 'text' && isEditing && (
            <div className="space-y-2">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="bg-background/10 border-none focus-visible:ring-0"
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(message.text);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSaveEdit}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
          
          {(message.type === 'image' || message.type === 'video') && message.attachmentUrl && (
            <div className="rounded overflow-hidden">
              {message.type === 'image' ? (
                <img 
                  src={message.attachmentUrl} 
                  alt="Attachment" 
                  className="max-w-full"
                />
              ) : (
                <video 
                  src={message.attachmentUrl} 
                  controls
                  className="max-w-full"
                />
              )}
            </div>
          )}
          
          {message.type === 'voice' && message.attachmentUrl && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-accent"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <div className="flex-1">
                <div className="h-1 w-full bg-secondary/30 rounded-full relative">
                  <div className="absolute inset-0 bg-secondary rounded-full" style={{ 
                    width: audioRef.current ? 
                      `${(audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100}%` : '0%' 
                  }}></div>
                </div>
              </div>
              
              <div className="text-xs opacity-80">
                {message.audioDuration ? formatTime(message.audioDuration) : "00:00"}
              </div>
              
              <audio 
                ref={audioRef} 
                src={message.attachmentUrl} 
                onEnded={handleAudioEnded}
                onTimeUpdate={() => setIsPlaying(true)}
                className="hidden"
              />
            </div>
          )}
          
          {renderReactions()}
          
          <div className={`text-xs mt-1 ${isSent ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
            {format(new Date(message.timestamp), 'h:mm a')}
            {message.edited && <span className="ml-1">(edited)</span>}
          </div>
        </div>
        
        {!isEditing && (
          <div className={`flex mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
            {message.type === 'text' && (
              <TextToSpeech 
                text={message.text} 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-50 hover:opacity-100"
              />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isSent ? "end" : "start"}>
                <DropdownMenuItem onClick={onReply} className="cursor-pointer">
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                
                <DropdownMenuItem className="cursor-pointer" onClick={() => setShowReactions(prev => !prev)}>
                  <Smile className="h-4 w-4 mr-2" />
                  Add Reaction
                </DropdownMenuItem>
                
                {isSent && message.type === 'text' && onEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                
                {isSent && onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(message.id)} 
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
