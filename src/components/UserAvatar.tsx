
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

export const UserAvatar = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <Avatar className="h-8 w-8 border border-border">
      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
      <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
