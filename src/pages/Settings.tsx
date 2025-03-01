
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AvatarMaker from '@/components/AvatarMaker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Settings = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState(currentUser?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  const handleProfileUpdate = async (newAvatarUrl: string) => {
    if (!currentUser) return;
    
    setIsUpdating(true);
    try {
      const updatedUser = { 
        ...currentUser, 
        avatar: newAvatarUrl
      };
      
      await updateUser(updatedUser);
      
      toast({
        title: 'Profile Updated',
        description: 'Your avatar has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!currentUser || username === currentUser.name || username.trim() === '') return;
    
    setIsUpdating(true);
    try {
      const updatedUser = { 
        ...currentUser, 
        name: username.trim()
      };
      
      await updateUser(updatedUser);
      
      toast({
        title: 'Profile Updated',
        description: 'Your username has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating username:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your username. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="p-4 text-center">
        <p>Please log in to view settings</p>
        <Button onClick={() => navigate('/login')} className="mt-4">
          Log In
        </Button>
      </div>
    );
  }

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
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto flex-1 p-4 max-w-2xl mb-16">
        <div className="space-y-8">
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">{currentUser.id}</p>
                </div>
              </div>
              
              <div className="pt-4">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2 mt-1">
                  <Input 
                    id="username"
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleUsernameUpdate} 
                    disabled={isUpdating || username === currentUser.name || username.trim() === ''}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-4">Avatar</h2>
            <AvatarMaker user={currentUser} onUpdate={handleProfileUpdate} />
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <Button 
              variant="destructive" 
              className="flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
