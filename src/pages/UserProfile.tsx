
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, saveUser } from '@/utils/database';
import { User } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Mail, Upload, UserIcon } from 'lucide-react';
import { useMessaging } from '@/context/MessagingContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
  'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1',
  'https://images.unsplash.com/photo-1517022812141-23620dba5c23',
];

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { startNewConversation } = useMessaging();
  const { toast } = useToast();
  const { currentUser, updateCurrentUser } = useAuth();
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const userData = await getUser(userId);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          title: 'Error',
          description: 'Could not load user profile',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [userId, toast]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleStartChat = async () => {
    if (!user || !currentUser) return;
    
    try {
      await startNewConversation(user.id);
      navigate('/');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Could not start conversation',
        variant: 'destructive'
      });
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;
    
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      if (!e.target || !e.target.result) return;
      
      const avatarUrl = e.target.result.toString();
      
      try {
        const updatedUser = { ...user, avatar: avatarUrl };
        await saveUser(updatedUser);
        setUser(updatedUser);
        
        // If this is the current user, update their data in context
        if (currentUser && user.id === currentUser.id) {
          updateCurrentUser({ ...currentUser, avatar: avatarUrl });
        }
        
        toast({
          title: 'Success',
          description: 'Avatar updated successfully',
        });
      } catch (error) {
        console.error('Error updating avatar:', error);
        toast({
          title: 'Error',
          description: 'Could not update avatar',
          variant: 'destructive'
        });
      }
    };
    
    reader.readAsDataURL(file);
  };

  const handleSelectDefaultAvatar = async (avatarUrl: string) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, avatar: avatarUrl };
      await saveUser(updatedUser);
      setUser(updatedUser);
      
      // If this is the current user, update their data in context
      if (currentUser && user.id === currentUser.id) {
        updateCurrentUser({ ...currentUser, avatar: avatarUrl });
      }
      
      setShowAvatarOptions(false);
      
      toast({
        title: 'Success',
        description: 'Avatar updated successfully',
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: 'Error',
        description: 'Could not update avatar',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b border-border p-4">
          <div className="container mx-auto flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">User Profile</h1>
          </div>
        </header>
        
        <main className="container mx-auto flex-1 p-4 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
            <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
            <Button onClick={handleBack}>Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  // Don't show message button on your own profile
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="container mx-auto flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">User Profile</h1>
        </div>
      </header>

      <main className="container mx-auto flex-1 p-4 max-w-2xl">
        <div className="space-y-6 animate-fade-in">
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start">
              <div className="relative mb-4 sm:mb-0 sm:mr-6">
                <Avatar className="h-24 w-24 border border-border">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    <UserIcon className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                
                {isOwnProfile && (
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                    onClick={() => setShowAvatarOptions(!showAvatarOptions)}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                )}
                
                {isOwnProfile && showAvatarOptions && (
                  <div className="absolute top-full mt-2 left-0 bg-card border border-border rounded-lg shadow-md p-4 z-10 w-64">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Change Avatar</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {DEFAULT_AVATARS.map((avatar, index) => (
                          <button 
                            key={index}
                            onClick={() => handleSelectDefaultAvatar(avatar)}
                            className="h-12 w-12 rounded-full overflow-hidden border border-border hover:opacity-80 transition-opacity"
                          >
                            <img src={avatar} alt={`Default avatar ${index + 1}`} className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                          <div className="border border-dashed border-border rounded-lg p-3 text-center hover:bg-muted/50 transition-colors">
                            <Upload className="h-4 w-4 mx-auto mb-1" />
                            <span className="text-xs">Upload your own</span>
                          </div>
                          <input 
                            type="file" 
                            id="avatar-upload" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleAvatarUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <p className="text-muted-foreground mb-2">User ID: {user.id}</p>
                <div className="flex items-center justify-center sm:justify-start mt-2 mb-4">
                  <span 
                    className={`h-2.5 w-2.5 rounded-full ${
                      user.status === 'online' 
                        ? 'bg-green-500' 
                        : user.status === 'away' 
                        ? 'bg-yellow-500' 
                        : 'bg-gray-400'
                    }`} 
                  />
                  <span className="ml-1.5 text-sm text-muted-foreground">
                    {user.status === 'online' 
                      ? 'Online' 
                      : user.status === 'away' 
                      ? 'Away' 
                      : 'Offline'
                    }
                  </span>
                </div>
                
                {!isOwnProfile && (
                  <Button onClick={handleStartChat} className="w-full sm:w-auto">
                    <Mail className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <h3 className="text-lg font-medium mb-4">Last Seen</h3>
            <p className="text-muted-foreground">
              {user.lastSeen 
                ? new Date(user.lastSeen).toLocaleString() 
                : 'Not available'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
