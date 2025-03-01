
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null; // Add error property
  login: (username: string, password: string) => Promise<boolean>;
  register: (name: string, password: string, avatar?: string) => Promise<boolean>;
  logout: () => void;
  updateUserStatus: (status: 'online' | 'offline' | 'away') => Promise<void>;
  updateUser: (user: User) => Promise<void>; // Changed return type to void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = () => {
      setIsLoading(true);
      try {
        const usersStr = localStorage.getItem('users');
        const users: User[] = usersStr ? JSON.parse(usersStr) : [];
        setAllUsers(users);
        
        // Check for a logged-in user
        const loggedInUserId = localStorage.getItem('loggedInUser');
        if (loggedInUserId) {
          const user = users.find(u => u.id === loggedInUserId);
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
      const usersStr = localStorage.getItem('users');
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      const user = users.find(u => u.name === username && u.password === password);
      
      if (user) {
        setCurrentUser(user);
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
      const usersStr = localStorage.getItem('users');
      let users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
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
      
      users = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(users));
      setAllUsers(users);
      
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
      
      // Update user in local storage
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
      toast({
        title: 'Status Update Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add the updateUser method to the context value
  const updateUser = async (user: User): Promise<void> => {
    try {
      // Update user in the database
      await updateUserInDatabase(user);
      
      // Update the current user if it's the same user
      if (currentUser && currentUser.id === user.id) {
        setCurrentUser(user);
      }
      
      // Update the user in the allUsers array
      if (allUsers) {
        const updatedAllUsers = allUsers.map(u => 
          u.id === user.id ? user : u
        );
        setAllUsers(updatedAllUsers);
      }
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

// Helper function to update a user in the database
const updateUserInDatabase = async (user: User): Promise<User> => {
  try {
    // Get all current users
    const usersStr = localStorage.getItem('users');
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    // Update the user
    users = users.map(u => u.id === user.id ? user : u);
    
    // Save back to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    return user;
  } catch (error) {
    console.error('Failed to update user in database:', error);
    throw error;
  }
};
