
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, User, Settings, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export function MobileNavBar() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <motion.div 
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 z-50 shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Link 
        to="/" 
        className={`flex flex-col items-center justify-center w-16 h-full ${
          isActive('/') ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </motion.div>
      </Link>
      
      <Link 
        to="/chat" 
        className={`flex flex-col items-center justify-center w-16 h-full ${
          isActive('/chat') ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs mt-1">Messages</span>
        </motion.div>
      </Link>
      
      <Link 
        to="/status" 
        className={`flex flex-col items-center justify-center w-16 h-full ${
          isActive('/status') ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Camera className="h-5 w-5" />
          <span className="text-xs mt-1">Status</span>
        </motion.div>
      </Link>
      
      <Link 
        to={currentUser ? `/user/${currentUser.id}` : "/"}
        className={`flex flex-col items-center justify-center w-16 h-full ${
          location.pathname.startsWith('/user/') ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </motion.div>
      </Link>
      
      <Link 
        to="/settings" 
        className={`flex flex-col items-center justify-center w-16 h-full ${
          isActive('/settings') ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </motion.div>
      </Link>
    </motion.div>
  );
}
