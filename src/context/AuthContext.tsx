import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (name: string, username: string, password: string, avatar?: string) => Promise<boolean>;
  logout: () => void;
  updateUserStatus: (status: 'online' | 'offline' | 'away') => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  updateCurrentUser: (user: User) => Promise<void>;
  clearAllUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const clearAllUserData = async (): Promise<void> => {
    try {
      localStorage.removeItem('users');
      localStorage.removeItem('loggedInUser');
      
      setCurrentUser(null);
      setAllUsers([]);
      
      toast({
        title: 'Database Cleared',
        description: 'All user data has been removed from the database.',
      });
    } catch (error) {
      console.error('Failed to clear user data:', error);
      setError('Failed to clear user data');
      toast({
        title: 'Error',
        description: 'Failed to clear user data.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    clearAllUserData();
    
    const loadUsers = () => {
      setIsLoading(true);
      try {
        const usersStr = localStorage.getItem('users');
        const users: User[] = usersStr ? JSON.parse(usersStr) : [];
        setAllUsers(users);
        
        const loggedInUsername = localStorage.getItem('loggedInUser');
        if (loggedInUsername) {
          const user = users.find(u => u.username === loggedInUsername);
          if (user) {
            setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error('Failed to load users:', error);
        setError('Failed to load user data');
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
      const usersStr = localStorage.getItem('users');
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('loggedInUser', username);
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${user.name}!`,
        });
        return true;
      } else {
        setError('Invalid username or password');
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password.',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to log in. Please try again.');
      toast({
        title: 'Login Error',
        description: 'Failed to log in. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, username: string, password: string, avatar?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const usersStr = localStorage.getItem('users');
      let users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      if (users.some(u => u.username === username)) {
        setError('Username already exists');
        toast({
          title: 'Registration Failed',
          description: 'Username already exists.',
          variant: 'destructive'
        });
        return false;
      }
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        username,
        password,
        avatar: avatar || `https://avatar.vercel.sh/${name}.svg`,
        status: 'online',
        lastSeen: new Date(),
      };
      
      users = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(users));
      setAllUsers(users);
      
      setCurrentUser(newUser);
      localStorage.setItem('loggedInUser', username);
      
      toast({
        title: 'Registration Successful',
        description: `Welcome, ${name}!`,
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to register. Please try again.');
      toast({
        title: 'Registration Error',
        description: 'Failed to register. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
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
      
      const usersStr = localStorage.getItem('users');
      let users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      users = users.map(u => u.id === currentUser.id ? updatedUser : u);
      localStorage.setItem('users', JSON.stringify(users));
      
      setCurrentUser(updatedUser);
      setAllUsers(users);
      
      toast({
        title: 'Status Updated',
        description: `Your status has been updated to ${status}.`,
      });
    } catch (error) {
      console.error('Status update error:', error);
      setError('Failed to update status');
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
      await updateUserInDatabase(user);
      
      if (allUsers) {
        const updatedAllUsers = allUsers.map(u => 
          u.id === user.id ? user : u
        );
        setAllUsers(updatedAllUsers);
      }
      
      if (currentUser && currentUser.id === user.id) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
      throw error;
    }
  };

  const updateCurrentUser = async (user: User): Promise<void> => {
    if (!currentUser) return;
    
    try {
      const updatedUser = { ...currentUser, ...user };
      await updateUser(updatedUser);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating current user:', error);
      setError('Failed to update profile');
      toast({
        title: 'Update Failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive'
      });
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
    updateUser,
    updateCurrentUser,
    clearAllUserData
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

const updateUserInDatabase = async (user: User): Promise<User> => {
  try {
    const usersStr = localStorage.getItem('users');
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    users = users.map(u => u.id === user.id ? user : u);
    
    localStorage.setItem('users', JSON.stringify(users));
    
    return user;
  } catch (error) {
    console.error('Failed to update user in database:', error);
    throw error;
  }
};
