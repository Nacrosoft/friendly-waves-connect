
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types/chat';

interface UserAvatarProps {
  user: User;
  className?: string;
}

export function UserAvatar({ user, className = "" }: UserAvatarProps) {
  if (!user) return null;
  
  return (
    <Avatar className={`border ${user.status === 'online' ? 'border-green-500' : 'border-gray-300'} ${className}`}>
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback>
        {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
      </AvatarFallback>
    </Avatar>
  );
}
