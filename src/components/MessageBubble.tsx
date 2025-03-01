
import React, { useState } from 'react';
import { Message, CustomEmoji } from '@/types/chat';
import { format } from 'date-fns';
import { Smile } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  onReaction?: (emoji: string, isCustom?: boolean, customEmojiId?: string) => void;
}

const emojis = ['👍', '❤️', '😂', '😮', '😢', '👏'];

export function MessageBubble({ message, isSent, onReaction }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const { currentUser } = useAuth();
  
  // Convert string date to Date object if needed
  const timestamp = message.timestamp instanceof Date 
    ? message.timestamp 
    : new Date(message.timestamp);
  
  const handleEmojiClick = (emoji: string) => {
    if (onReaction) {
      onReaction(emoji);
    }
  };
  
  const handleCustomEmojiClick = (emoji: CustomEmoji) => {
    if (onReaction) {
      onReaction('', true, emoji.id);
    }
  };
  
  const renderMessageContent = () => {
    if (message.type === 'text') {
      return message.text;
    } else if (message.type === 'image' && message.attachmentUrl) {
      return (
        <img 
          src={message.attachmentUrl} 
          alt="Message attachment" 
          className="max-w-full rounded-lg max-h-60 object-contain"
        />
      );
    } else if (message.type === 'video' && message.attachmentUrl) {
      return (
        <video 
          src={message.attachmentUrl} 
          controls 
          className="max-w-full rounded-lg max-h-60"
        />
      );
    } else {
      return message.text;
    }
  };
  
  // Group reactions by emoji (standard or custom)
  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    const key = reaction.isCustom ? `custom:${reaction.customEmojiId}` : `standard:${reaction.emoji}`;
    
    if (!acc[key]) {
      acc[key] = {
        emoji: reaction.emoji,
        isCustom: reaction.isCustom,
        customEmojiId: reaction.customEmojiId,
        count: 0,
        users: []
      };
    }
    
    acc[key].count++;
    acc[key].users.push(reaction.userId);
    
    return acc;
  }, {} as Record<string, {
    emoji: string,
    isCustom?: boolean,
    customEmojiId?: string,
    count: number,
    users: string[]
  }>);
  
  // Find custom emoji details for reactions
  const customEmojiMap = currentUser?.customEmojis?.reduce((acc, emoji) => {
    acc[emoji.id] = emoji;
    return acc;
  }, {} as Record<string, CustomEmoji>) || {};
  
  return (
    <div 
      className={`group flex flex-col max-w-[80%] ${
        isSent ? 'ml-auto items-end' : 'mr-auto items-start'
      }`}
    >
      <div 
        className={`relative px-4 py-2 rounded-2xl ${
          isSent 
            ? 'bg-primary text-primary-foreground rounded-tr-none' 
            : 'bg-card text-card-foreground rounded-tl-none'
        }`}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
      >
        {renderMessageContent()}
        
        {showReactions && onReaction && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={`absolute -bottom-8 ${isSent ? 'left-0' : 'right-0'} bg-card p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                <Smile className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isSent ? 'start' : 'end'} className="flex flex-wrap p-1">
              {emojis.map(emoji => (
                <DropdownMenuItem 
                  key={emoji} 
                  onClick={() => handleEmojiClick(emoji)} 
                  className="cursor-pointer"
                >
                  {emoji}
                </DropdownMenuItem>
              ))}
              
              {currentUser?.customEmojis && currentUser.customEmojis.length > 0 && (
                <>
                  <div className="w-full h-px bg-border my-1" />
                  {currentUser.customEmojis.map(emoji => (
                    <DropdownMenuItem 
                      key={emoji.id} 
                      onClick={() => handleCustomEmojiClick(emoji)} 
                      className="cursor-pointer p-1 h-8 w-8"
                    >
                      {emoji.type === 'image' ? (
                        <img src={emoji.url} alt={emoji.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <video src={emoji.url} className="w-6 h-6 object-contain" autoPlay muted loop />
                      )}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Time */}
      <span className="text-xs text-muted-foreground mt-1">
        {format(timestamp, 'p')}
      </span>
      
      {/* Reactions */}
      {groupedReactions && Object.values(groupedReactions).length > 0 && (
        <div className={`flex mt-1 gap-0.5 ${isSent ? 'justify-end' : 'justify-start'}`}>
          {Object.values(groupedReactions).map((reaction) => (
            <span 
              key={reaction.isCustom ? `custom:${reaction.customEmojiId}` : `standard:${reaction.emoji}`} 
              className="bg-background text-xs rounded-full px-1.5 py-0.5 border border-border flex items-center"
            >
              {reaction.isCustom && reaction.customEmojiId && customEmojiMap[reaction.customEmojiId] ? (
                customEmojiMap[reaction.customEmojiId].type === 'image' ? (
                  <img 
                    src={customEmojiMap[reaction.customEmojiId].url} 
                    alt={customEmojiMap[reaction.customEmojiId].name}
                    className="w-4 h-4 mr-0.5 object-contain" 
                  />
                ) : (
                  <video 
                    src={customEmojiMap[reaction.customEmojiId].url}
                    className="w-4 h-4 mr-0.5 object-contain"
                    autoPlay
                    muted
                    loop
                  />
                )
              ) : (
                <span>{reaction.emoji}</span>
              )}
              {reaction.count > 1 && <span className="ml-0.5">{reaction.count}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
