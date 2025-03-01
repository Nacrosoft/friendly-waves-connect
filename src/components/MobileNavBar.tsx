
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, User, Settings, Camera } from 'lucide-react';

export function MobileNavBar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around px-2 z-50">
      <Link 
        to="/" 
        className={`flex flex-col items-center justify-center w-16 h-full ${
          isActive('/') ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link 
        to="/chat" 
        className={`flex flex-col items-center justify-center w-16 h-full ${
          isActive('/chat') ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-xs mt-1">Messages</span>
      </Link>
      
      <Link 
        to="/status" 
        className={`flex flex-col items-center justify-center w-16 h-full ${
          isActive('/status') ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <Camera className="h-5 w-5" />
        <span className="text-xs mt-1">Status</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`flex flex-col items-center justify-center w-16 h-full ${
          isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <User className="h-5 w-5" />
        <span className="text-xs mt-1">Profile</span>
      </Link>
      
      <Link 
        to="/settings" 
        className={`flex flex-col items-center justify-center w-16 h-full ${
          isActive('/settings') ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <Settings className="h-5 w-5" />
        <span className="text-xs mt-1">Settings</span>
      </Link>
    </div>
  );
}
