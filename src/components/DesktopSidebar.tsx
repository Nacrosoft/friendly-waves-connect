
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, User, Settings, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function DesktopSidebar() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-sidebar border-r border-sidebar-border fixed left-0 top-0 shadow-md animate-slide-in-right">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Meetefy
        </h1>
      </div>
      
      <div className="flex-1 py-6">
        <nav className="space-y-2 px-4">
          <SidebarItem 
            to="/" 
            icon={<Home className="h-5 w-5" />}
            isActive={isActive('/')}
            label="Home"
          />
          
          <SidebarItem 
            to="/chat" 
            icon={<MessageSquare className="h-5 w-5" />}
            isActive={isActive('/chat')}
            label="Messages"
          />
          
          <SidebarItem 
            to="/status" 
            icon={<Camera className="h-5 w-5" />}
            isActive={isActive('/status')}
            label="Status"
          />
          
          <SidebarItem 
            to={currentUser ? `/user/${currentUser.id}` : "/"} 
            icon={<User className="h-5 w-5" />}
            isActive={location.pathname.startsWith('/user/')}
            label="Profile"
          />
          
          <SidebarItem 
            to="/settings" 
            icon={<Settings className="h-5 w-5" />}
            isActive={isActive('/settings')}
            label="Settings"
          />
        </nav>
      </div>
      
      {currentUser && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              {currentUser.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{currentUser.name || 'User'}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{currentUser.id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function SidebarItem({ to, icon, label, isActive }: SidebarItemProps) {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-300",
          isActive ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "bg-transparent"
        )}
      >
        <span className="mr-3">{icon}</span>
        <span className="transition-transform duration-300 hover:translate-x-1">{label}</span>
      </Button>
    </Link>
  );
}
