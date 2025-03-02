
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Story, User } from '@/types/chat';
import { useStory } from '@/context/StoryContext';
import { ChevronLeft, ChevronRight, X, Play, Volume2, VolumeX, Send, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export function StoryViewer() {
  const { 
    viewingStory, 
    viewingStoryUser, 
    viewingStoryIndex,
    setViewingStory, 
    closeStory,
    getStoriesForUser 
  } = useStory();
  
  const { currentUser } = useAuth();
  const [progressValue, setProgressValue] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const progressInterval = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Get all stories for the current user being viewed
  const userStories = viewingStoryUser ? getStoriesForUser(viewingStoryUser.id) : [];
  
  // Story duration based on type (video duration or fixed time for images/text)
  const storyDuration = viewingStory?.type === 'video' ? 0 : 5000; // 5 seconds for image/text
  
  // Reset progress when story changes
  useEffect(() => {
    if (!viewingStory) return;
    
    setProgressValue(0);
    clearProgressInterval();
    
    if (viewingStory.type === 'video') {
      // For videos, we'll update the progress based on the video's currentTime
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
      }
    } else {
      // For images and text, we use a timer
      startProgressTimer();
    }
    
    // Reset like state for new story
    setIsLiked(false);
    
    return () => {
      clearProgressInterval();
    };
  }, [viewingStory, viewingStoryIndex]);
  
  // Handle video timeupdate event to update progress
  const handleTimeUpdate = () => {
    if (!videoRef.current || !viewingStory) return;
    
    const video = videoRef.current;
    const progress = (video.currentTime / video.duration) * 100;
    setProgressValue(progress);
    
    // Move to next story when video ends
    if (video.ended) {
      goToNextStory();
    }
  };
  
  const startProgressTimer = () => {
    // Clear any existing interval
    clearProgressInterval();
    
    // Set new interval
    const intervalTime = 100; // Update every 100ms
    progressInterval.current = window.setInterval(() => {
      setProgressValue(prev => {
        const newValue = prev + (intervalTime / storyDuration) * 100;
        if (newValue >= 100) {
          goToNextStory();
          return 0;
        }
        return newValue;
      });
    }, intervalTime);
  };
  
  const clearProgressInterval = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };
  
  const handlePauseToggle = () => {
    setIsPaused(prev => {
      const newPausedState = !prev;
      
      if (newPausedState) {
        clearProgressInterval();
        if (videoRef.current && viewingStory?.type === 'video') {
          videoRef.current.pause();
        }
      } else {
        if (viewingStory?.type === 'video') {
          if (videoRef.current) {
            videoRef.current.play().catch(err => console.error('Error playing video:', err));
          }
        } else {
          startProgressTimer();
        }
      }
      
      return newPausedState;
    });
  };
  
  const handleMuteToggle = () => {
    setIsMuted(prev => {
      const newMutedState = !prev;
      if (videoRef.current) {
        videoRef.current.muted = newMutedState;
      }
      return newMutedState;
    });
  };
  
  const goToPreviousStory = () => {
    if (!viewingStoryUser) return;
    
    if (viewingStoryIndex > 0) {
      // Go to previous story of same user
      const prevStory = userStories[viewingStoryIndex - 1];
      setViewingStory(prevStory, viewingStoryUser, viewingStoryIndex - 1);
    } else {
      // Close the story viewer if it's the first story
      closeStory();
    }
  };
  
  const goToNextStory = () => {
    if (!viewingStoryUser) return;
    
    if (viewingStoryIndex < userStories.length - 1) {
      // Go to next story of same user
      const nextStory = userStories[viewingStoryIndex + 1];
      setViewingStory(nextStory, viewingStoryUser, viewingStoryIndex + 1);
    } else {
      // Close the story viewer if it's the last story
      closeStory();
    }
  };
  
  const handleSendReply = () => {
    if (!replyText.trim() || !viewingStoryUser || !currentUser) return;
    
    // In a real app, you would send this to your backend
    console.log(`Replying to ${viewingStoryUser.name}'s story: ${replyText}`);
    
    // Clear the input
    setReplyText('');
  };
  
  const handleLike = () => {
    setIsLiked(prev => !prev);
  };
  
  if (!viewingStory || !viewingStoryUser) return null;
  
  return (
    <Dialog open={!!viewingStory} onOpenChange={(open) => !open && closeStory()}>
      <DialogContent className="p-0 max-w-md w-full max-h-[90vh] h-[600px] flex flex-col overflow-hidden bg-gradient-to-b from-gray-900 to-black border-none rounded-xl shadow-2xl">
        {/* Story header */}
        <div className="p-4 flex items-center justify-between bg-black/40 backdrop-blur-md text-white z-10 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9 border border-white/20 ring-2 ring-primary/20">
              <AvatarImage src={viewingStoryUser.avatar} alt={viewingStoryUser.name} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">{viewingStoryUser.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{viewingStoryUser.name}</span>
              <span className="text-xs opacity-70">
                {format(new Date(viewingStory.createdAt), 'HH:mm')}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={closeStory}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Progress bars */}
        <div className="flex gap-1 px-2 pt-1 bg-black/40 backdrop-blur-md">
          {userStories.map((story, index) => (
            <Progress
              key={story.id}
              value={index === viewingStoryIndex ? progressValue : index < viewingStoryIndex ? 100 : 0}
              className="h-1"
            />
          ))}
        </div>
        
        {/* Story content */}
        <div 
          className="flex-1 relative bg-black overflow-hidden"
          onClick={handlePauseToggle}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={viewingStory.id}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {viewingStory.type === 'image' && (
                <img
                  src={viewingStory.content}
                  alt="Story"
                  className="w-full h-full object-contain"
                />
              )}
              
              {viewingStory.type === 'video' && (
                <video
                  ref={videoRef}
                  src={viewingStory.content}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                  muted={isMuted}
                  onTimeUpdate={handleTimeUpdate}
                />
              )}
              
              {viewingStory.type === 'text' && (
                <div 
                  className="w-full h-full flex items-center justify-center p-6 text-white text-center text-xl font-medium"
                  style={{ 
                    backgroundImage: !viewingStory.bgColor?.includes('gradient') 
                      ? `linear-gradient(135deg, ${viewingStory.bgColor || '#4F46E5'}, ${viewingStory.bgColor ? adjustColorBrightness(viewingStory.bgColor, -20) : '#7C3AED'})` 
                      : viewingStory.bgColor || 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                  }}
                >
                  {viewingStory.content}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Story controls */}
          <div className="absolute top-0 left-0 w-full h-full flex">
            {/* Left navigation area */}
            <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); goToPreviousStory(); }}>
              <div className="w-8 h-8 absolute top-1/2 left-2 flex items-center justify-center opacity-0 hover:opacity-70">
                <ChevronLeft className="h-8 w-8 text-white" />
              </div>
            </div>
            
            {/* Center area (for pause/play) */}
            <div className="w-1/3 h-full flex items-center justify-center">
              {isPaused && (
                <motion.div 
                  className="bg-black/30 backdrop-blur-sm rounded-full p-2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Play className="h-8 w-8 text-white" />
                </motion.div>
              )}
            </div>
            
            {/* Right navigation area */}
            <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); goToNextStory(); }}>
              <div className="w-8 h-8 absolute top-1/2 right-2 flex items-center justify-center opacity-0 hover:opacity-70">
                <ChevronRight className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          {/* Story actions */}
          <div className="absolute right-4 bottom-24 flex flex-col gap-4 items-center">
            <motion.button
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md ${isLiked ? 'bg-red-500/20' : 'bg-white/10'}`}
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
            </motion.button>
            
            <motion.button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md"
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle className="h-5 w-5 text-white" />
            </motion.button>
            
            <motion.button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md"
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="h-5 w-5 text-white" />
            </motion.button>
          </div>
          
          {/* Volume control for videos */}
          {viewingStory.type === 'video' && (
            <Button 
              variant="glass" 
              size="icon" 
              className="absolute bottom-4 left-4 text-white bg-black/30 backdrop-blur-md rounded-full h-9 w-9"
              onClick={(e) => { e.stopPropagation(); handleMuteToggle(); }}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        {/* Reply input */}
        <div className="p-3 bg-black/40 backdrop-blur-md flex items-center gap-2 rounded-b-xl">
          <Input
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full px-4"
            placeholder="Reply to story..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <Button 
            variant="story-gradient" 
            size="icon" 
            className="rounded-full"
            onClick={handleSendReply}
            disabled={!replyText.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number) {
  // Remove the # if it exists
  hex = hex.replace(/^#/, '');
  
  // Parse the hex string
  let r = parseInt(hex.length === 3 ? hex.substring(0, 1).repeat(2) : hex.substring(0, 2), 16);
  let g = parseInt(hex.length === 3 ? hex.substring(1, 2).repeat(2) : hex.substring(2, 4), 16);
  let b = parseInt(hex.length === 3 ? hex.substring(2, 3).repeat(2) : hex.substring(4, 6), 16);
  
  // Adjust the brightness
  r = Math.round(r * (100 + percent) / 100);
  g = Math.round(g * (100 + percent) / 100);
  b = Math.round(b * (100 + percent) / 100);
  
  // Ensure values stay within range
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  
  // Convert back to hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
