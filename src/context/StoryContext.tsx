
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Story, User } from '@/types/chat';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { saveStory, getStoriesForUser, getAllStories, updateStoryViewers } from '@/utils/database';

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
  loadStories: () => Promise<void>;
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
    if (allUsers) {
      loadStories();
    }
  }, [allUsers]);

  const loadStories = async () => {
    try {
      const allDbStories = await getAllStories();
      
      // Filter to only include non-expired stories
      const filteredStories = allDbStories.filter(story => {
        const expiryDate = story.expiresAt instanceof Date ? story.expiresAt : new Date(story.expiresAt);
        return expiryDate.getTime() > Date.now();
      });
      
      setStories(filteredStories);
      return filteredStories;
    } catch (error) {
      console.error("Error loading stories:", error);
      return [];
    }
  };

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
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        viewers: []
      };

      // Save the story to the database
      await saveStory(newStory);
      
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
      const userDbStories = await getStoriesForUser(userId);
      if (userDbStories.length === 0) return;
      
      // View the first story
      const story = userDbStories[0];
      const user = allUsers?.find(u => u.id === userId);
      
      if (story && user) {
        setViewingStoryState(story, user, 0);
      }
    } catch (error) {
      console.error("Error viewing story:", error);
    }
  };

  // Helper function to handle setting the viewing story state
  const setViewingStoryState = (story: Story | null, user: User | null, index: number) => {
    setViewingStory(story);
    setViewingStoryUser(user);
    setViewingStoryIndex(index);
    if (story && currentUser && !story.viewers.includes(currentUser.id)) {
      markStoryAsViewed(story);
    }
  };

  // Helper function to mark a story as viewed
  const markStoryAsViewed = async (story: Story) => {
    if (!currentUser) return;
    
    try {
      // Update the story viewers in the database
      await updateStoryViewers(story.id, currentUser.id);
      
      // Update local state
      setStories(prev => 
        prev.map(s => 
          s.id === story.id 
            ? { ...s, viewers: [...s.viewers, currentUser.id] } 
            : s
        )
      );
    } catch (error) {
      console.error("Error marking story as viewed:", error);
    }
  };

  const getStoriesForUserFromContext = (userId: string): Story[] => {
    return stories.filter(story => story.userId === userId);
  };

  const getUsersWithStories = (): User[] => {
    if (!allUsers) return [];
    
    // Get unique user IDs from stories
    const userIdsWithStories = [...new Set(stories.map(story => story.userId))];
    
    // Return users that have stories
    return allUsers.filter(user => userIdsWithStories.includes(user.id));
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
        setViewingStory: setViewingStoryState,
        setIsCreatingStory,
        createStory,
        viewStory,
        getStoriesForUser: getStoriesForUserFromContext,
        closeStory,
        getUsersWithStories,
        loadStories
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
