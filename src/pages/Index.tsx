
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-4 px-6 border-b border-border flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chat App</h1>
        
        {isAuthenticated && currentUser ? (
          <div className="flex items-center space-x-4">
            <UserAvatar user={currentUser} />
            <Button 
              variant="ghost" 
              onClick={() => navigate('/chat')}
            >
              Messages
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </div>
        )}
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <h2 className="text-3xl font-bold">Welcome to Chat App</h2>
          <p className="text-muted-foreground">
            Connect with friends, share moments, and have conversations in real-time.
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col space-y-3">
              <Button 
                size="lg" 
                className="w-full" 
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full" 
                onClick={() => navigate('/login')}
              >
                Already have an account? Login
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <Button 
                size="lg" 
                className="w-full" 
                onClick={() => navigate('/chat')}
              >
                Go to Messages
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-4 px-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Chat App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
