
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Lock } from 'lucide-react';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: 'Missing information',
        description: 'Please enter both username and password',
        variant: 'destructive'
      });
      return;
    }
    
    const success = await login(username, password);
    
    if (success) {
      toast({
        title: 'Logged in',
        description: `Welcome back, ${username}!`
      });
    } else {
      toast({
        title: 'Login failed',
        description: error || 'Invalid username or password',
        variant: 'destructive'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      <div className="space-y-3">
        <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4 text-gray-500" />
          <span>Username</span>
        </label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          disabled={isLoading}
          className="w-full mobile-friendly-input"
        />
      </div>
      
      <div className="space-y-3">
        <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
          <Lock className="h-4 w-4 text-gray-500" />
          <span>Password</span>
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={isLoading}
          className="w-full mobile-friendly-input"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full mobile-friendly-button bg-[#6C63FF] hover:bg-[#5A52D5] mt-6" 
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};
