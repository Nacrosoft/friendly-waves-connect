import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser } from '@/utils/database';
import { User } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Mail, Settings, UserIcon, LogOut } from 'lucide-react';
import { useMessaging } from '@/context/MessagingContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { startNewConversation } = useMessaging();
  const { toast } = useToast();
  const { currentUser, logout } = useAuth();

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

  const handleGoToSettings = () => {
    navigate('/settings');
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
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
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
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
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
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

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
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
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
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
                    onClick={handleGoToSettings}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
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
                
                {isOwnProfile && (
                  <Button onClick={handleGoToSettings} className="w-full sm:w-auto">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
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
