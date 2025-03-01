
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Story, User } from '@/types/chat';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StoryContextType {
  stories: Story[];
  viewingStory: Story | null;
  viewingStoryUser: User | null;
  viewingStoryIndex: number;
  isCreatingStory: boolean;
  setViewingStory: (story: Story | null, user: User | null, index: number) => void;
  setIsCreatingStory: (isCreating: boolean) => void;
  createStory: (type: 'image' | 'video' | 'text', content: string, bgColor?: string) => Promise<void>;
  viewStory: (userId: string) => Promise<void>;
  getStoriesForUser: (userId: string) => Story[];
  closeStory: () => void;
  getUsersWithStories: () => User[];
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [viewingStoryUser, setViewingStoryUser] = useState<User | null>(null);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number>(0);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const { currentUser, allUsers, updateUser } = useAuth();
  const { toast } = useToast();

  // Load all stories on init
  useEffect(() => {
    if (!allUsers) return;

    const allStories: Story[] = [];
    allUsers.forEach(user => {
      if (user.stories && user.stories.length > 0) {
        allStories.push(...user.stories);
      }
    });

    // Sort by creation date, newest first
    allStories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Remove expired stories
    const filteredStories = allStories.filter(story => 
      new Date(story.expiresAt).getTime() > Date.now()
    );
    
    setStories(filteredStories);
  }, [allUsers]);

  const createStory = async (type: 'image' | 'video' | 'text', content: string, bgColor?: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a story",
        variant: "destructive"
      });
      return;
    }

    try {
      const newStory: Story = {
        id: `story-${Date.now()}`,
        userId: currentUser.id,
        type,
        content,
        bgColor: type === 'text' ? bgColor : undefined,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        viewers: []
      };

      // Update the user with the new story
      if (!currentUser.stories) {
        currentUser.stories = [];
      }
      
      currentUser.stories.push(newStory);
      await updateUser(currentUser);

      // Update local state
      setStories(prev => [newStory, ...prev]);
      
      toast({
        title: "Story Created",
        description: "Your story has been published and will be available for 24 hours"
      });
      
      // Close the story creator
      setIsCreatingStory(false);
    } catch (error) {
      console.error("Error creating story:", error);
      toast({
        title: "Error",
        description: "Failed to create story. Please try again.",
        variant: "destructive"
      });
    }
  };

  const viewStory = async (userId: string) => {
    if (!currentUser) return;

    try {
      const userStories = getStoriesForUser(userId);
      if (userStories.length === 0) return;
      
      // View the first story
      const story = userStories[0];
      const user = allUsers?.find(u => u.id === userId);
      
      if (story && user) {
        setViewingStory(story, user, 0);
      }
    } catch (error) {
      console.error("Error viewing story:", error);
    }
  };

  const getStoriesForUser = (userId: string): Story[] => {
    const user = allUsers?.find(u => u.id === userId);
    if (!user || !user.stories) return [];
    
    // Filter out expired stories
    return user.stories.filter(story => 
      new Date(story.expiresAt).getTime() > Date.now()
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getUsersWithStories = (): User[] => {
    if (!allUsers) return [];
    
    return allUsers.filter(user => {
      // Check if user has any non-expired stories
      if (!user.stories || user.stories.length === 0) return false;
      
      const hasValidStories = user.stories.some(story => 
        new Date(story.expiresAt).getTime() > Date.now()
      );
      
      return hasValidStories;
    });
  };

  const closeStory = () => {
    setViewingStory(null);
    setViewingStoryUser(null);
    setViewingStoryIndex(0);
  };

  return (
    <StoryContext.Provider
      value={{
        stories,
        viewingStory,
        viewingStoryUser,
        viewingStoryIndex,
        isCreatingStory,
        setViewingStory: (story, user, index) => {
          setViewingStory(story);
          setViewingStoryUser(user);
          setViewingStoryIndex(index);
          if (story) {
            // Mark as viewed if not already viewed by current user
            if (currentUser && !story.viewers.includes(currentUser.id)) {
              story.viewers.push(currentUser.id);
              
              // Update the story in the user's stories array
              const storyOwner = allUsers?.find(user => user.id === story.userId);
              if (storyOwner && storyOwner.stories) {
                const storyIndex = storyOwner.stories.findIndex(s => s.id === story.id);
                if (storyIndex !== -1) {
                  storyOwner.stories[storyIndex] = story;
                  updateUser(storyOwner);
                }
              }
              
              // Update local state
              setStories(prev => prev.map(s => s.id === story.id ? story : s));
            }
          }
        },
        setIsCreatingStory,
        createStory,
        viewStory,
        getStoriesForUser,
        closeStory,
        getUsersWithStories
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
};
