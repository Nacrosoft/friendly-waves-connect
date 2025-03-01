
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { saveUser, getUser, getAllUsers, updateUser as updateUserInDb } from '@/utils/database';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (name: string, password: string, avatar?: string) => Promise<boolean>;
  logout: () => void;
  updateUserStatus: (status: 'online' | 'offline' | 'away') => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const users = await getAllUsers();
        setAllUsers(users);
        
        // Check for a logged-in user
        const loggedInUserId = localStorage.getItem('loggedInUser');
        if (loggedInUserId) {
          const user = await getUser(loggedInUserId);
          if (user) {
            setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error('Failed to load users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user data.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsers();
  }, [toast]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const users = await getAllUsers();
      
      const user = users.find(u => u.name === username && u.password === password);
      
      if (user) {
        // Update the user's status to online
        const updatedUser = {
          ...user,
          status: 'online' as const,
          lastSeen: new Date()
        };
        
        await updateUserInDb(updatedUser);
        setCurrentUser(updatedUser);
        localStorage.setItem('loggedInUser', user.id);
        
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${user.name}!`,
        });
        return true;
      } else {
        const errorMessage = 'Invalid username or password.';
        setError(errorMessage);
        toast({
          title: 'Login Failed',
          description: errorMessage,
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      const errorMessage = 'Failed to log in. Please try again.';
      console.error('Login error:', error);
      setError(errorMessage);
      toast({
        title: 'Login Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, password: string, avatar?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const users = await getAllUsers();
      
      if (users.some(u => u.name === name)) {
        const errorMessage = 'Username already exists.';
        setError(errorMessage);
        toast({
          title: 'Registration Failed',
          description: errorMessage,
          variant: 'destructive'
        });
        return false;
      }
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        password,
        avatar: avatar || `https://avatar.vercel.sh/${name}.svg`,
        status: 'online',
        lastSeen: new Date(),
      };
      
      await saveUser(newUser);
      
      // Refresh the users list
      const updatedUsers = await getAllUsers();
      setAllUsers(updatedUsers);
      
      setCurrentUser(newUser);
      localStorage.setItem('loggedInUser', newUser.id);
      
      toast({
        title: 'Registration Successful',
        description: `Welcome, ${name}!`,
      });
      return true;
    } catch (error) {
      const errorMessage = 'Failed to register. Please try again.';
      console.error('Registration error:', error);
      setError(errorMessage);
      toast({
        title: 'Registration Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (currentUser) {
      // Update user status to offline before logging out
      const updatedUser = {
        ...currentUser,
        status: 'offline' as const,
        lastSeen: new Date()
      };
      
      try {
        await updateUserInDb(updatedUser);
      } catch (error) {
        console.error('Error updating user status during logout:', error);
      }
    }
    
    setCurrentUser(null);
    localStorage.removeItem('loggedInUser');
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  const updateUserStatus = async (status: 'online' | 'offline' | 'away') => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const updatedUser = { ...currentUser, status, lastSeen: new Date() };
      
      // Update user in database
      await updateUserInDb(updatedUser);
      
      setCurrentUser(updatedUser);
      
      // Refresh the users list
      const updatedUsers = await getAllUsers();
      setAllUsers(updatedUsers);
      
      toast({
        title: 'Status Updated',
        description: `Your status has been updated to ${status}.`,
      });
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: 'Status Update Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (user: User): Promise<void> => {
    try {
      // Update user in the database
      await updateUserInDb(user);
      
      // Update the current user if it's the same user
      if (currentUser && currentUser.id === user.id) {
        setCurrentUser(user);
      }
      
      // Refresh the users list
      const updatedUsers = await getAllUsers();
      setAllUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    allUsers,
    isAuthenticated: !!currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUserStatus,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
