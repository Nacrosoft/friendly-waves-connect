
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, User, Settings, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

export function DesktopSidebar() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) return null;
  
  return (
    <div 
      className={cn(
        "hidden md:flex flex-col h-screen bg-gradient-to-b from-background to-background/95 border-r border-sidebar-border fixed left-0 top-0 shadow-lg transition-all duration-300 ease-in-out z-40",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 border-b border-sidebar-border flex justify-between items-center">
        {!collapsed && (
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent animate-pulse-subtle">
            Meetefy
          </h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto rounded-full hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex-1 py-6 overflow-y-auto scrollbar-hidden">
        <nav className={cn("space-y-3", collapsed ? "px-2" : "px-4")}>
          <SidebarItem 
            to="/" 
            icon={<Home className="h-5 w-5" />}
            isActive={isActive('/')}
            label="Home"
            collapsed={collapsed}
          />
          
          <SidebarItem 
            to="/chat" 
            icon={<MessageSquare className="h-5 w-5" />}
            isActive={isActive('/chat')}
            label="Messages"
            collapsed={collapsed}
          />
          
          <SidebarItem 
            to="/status" 
            icon={<Camera className="h-5 w-5" />}
            isActive={isActive('/status')}
            label="Status"
            collapsed={collapsed}
          />
          
          <SidebarItem 
            to={currentUser ? `/user/${currentUser.id}` : "/"} 
            icon={<User className="h-5 w-5" />}
            isActive={location.pathname.startsWith('/user/')}
            label="Profile"
            collapsed={collapsed}
          />
          
          <SidebarItem 
            to="/settings" 
            icon={<Settings className="h-5 w-5" />}
            isActive={isActive('/settings')}
            label="Settings"
            collapsed={collapsed}
          />
        </nav>
      </div>
      
      {currentUser && (
        <div className={cn(
          "p-4 border-t border-sidebar-border bg-sidebar-accent/20 backdrop-blur-sm",
          collapsed ? "flex justify-center" : ""
        )}>
          {collapsed ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
              {currentUser.name?.charAt(0) || 'U'}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                {currentUser.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentUser.name || 'User'}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{currentUser.id}</p>
              </div>
            </div>
          )}
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
  collapsed: boolean;
}

function SidebarItem({ to, icon, label, isActive, collapsed }: SidebarItemProps) {
  return (
    <Link to={to} className="block">
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full transition-all duration-300 group",
          isActive 
            ? "bg-sidebar-accent/80 text-sidebar-foreground font-medium shadow-md" 
            : "bg-transparent hover:bg-sidebar-accent/50",
          collapsed ? "justify-center px-2" : "justify-start"
        )}
      >
        <span className={cn(
          "transition-transform duration-300",
          isActive ? "text-blue-500" : "",
          collapsed ? "" : "mr-3"
        )}>
          {icon}
        </span>
        {!collapsed && (
          <span className="transition-transform duration-300 group-hover:translate-x-1 truncate">
            {label}
          </span>
        )}
      </Button>
    </Link>
  );
}
