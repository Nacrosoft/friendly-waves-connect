
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, UserPlus } from 'lucide-react';

export const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: 'Missing information',
        description: 'Please enter all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }
    
    const success = await register(username, password);
    
    if (success) {
      toast({
        title: 'Account created',
        description: `Welcome, ${username}!`
      });
    } else {
      toast({
        title: 'Registration failed',
        description: error || 'Could not create account',
        variant: 'destructive'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      <div className="space-y-3">
        <label htmlFor="reg-username" className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4 text-gray-500" />
          <span>Username</span>
        </label>
        <Input
          id="reg-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          disabled={isLoading}
          className="w-full mobile-friendly-input"
        />
      </div>
      
      <div className="space-y-3">
        <label htmlFor="reg-password" className="flex items-center gap-2 text-sm font-medium">
          <Lock className="h-4 w-4 text-gray-500" />
          <span>Password</span>
        </label>
        <Input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a password"
          disabled={isLoading}
          className="w-full mobile-friendly-input"
        />
      </div>
      
      <div className="space-y-3">
        <label htmlFor="confirm-password" className="flex items-center gap-2 text-sm font-medium">
          <Lock className="h-4 w-4 text-gray-500" />
          <span>Confirm Password</span>
        </label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          disabled={isLoading}
          className="w-full mobile-friendly-input"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full mobile-friendly-button bg-[#6C63FF] hover:bg-[#5A52D5] mt-6" 
        disabled={isLoading}
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};
