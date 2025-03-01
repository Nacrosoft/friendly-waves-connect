
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const UserAvatar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  if (!currentUser) {
    return null;
  }
  
  const handleProfileClick = () => {
    navigate('/settings');
  };
  
  return (
    <Avatar 
      className="h-8 w-8 border border-border cursor-pointer hover:opacity-80 transition-opacity"
      onClick={handleProfileClick}
    >
      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
      <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
