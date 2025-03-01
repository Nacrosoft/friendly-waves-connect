
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/chat';
import { initDatabase, saveUser, getUser } from '@/utils/database';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, avatar?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize database and check for existing session
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        const userId = localStorage.getItem('currentUserId');
        
        if (userId) {
          const user = await getUser(userId);
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For simplicity, we're doing a very basic "login" here
      // In a real app, you would hash passwords and validate credentials securely
      // You would also use JWT or sessions for secure authentication
      
      // Create a user ID based on the username (in a real app, you'd query by username)
      const userId = `user-${username.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Try to get the user from the database
      const user = await getUser(userId);
      
      if (!user) {
        setError('User not found');
        return false;
      }
      
      // In a real app, you would validate the password here
      // Since we're just doing a demo, we'll skip password validation for now
      
      // Set the current user and mark as authenticated
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Store user ID in localStorage for persistent login
      localStorage.setItem('currentUserId', user.id);
      
      // Update user's status to online
      const updatedUser = {
        ...user,
        status: 'online' as const,
        lastSeen: new Date()
      };
      
      await saveUser(updatedUser);
      setCurrentUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, avatarUrl?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a user ID based on the username
      const userId = `user-${username.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Check if user already exists
      const existingUser = await getUser(userId);
      
      if (existingUser) {
        setError('Username already taken');
        return false;
      }
      
      // In a real app, you would hash the password here before storing it
      
      // Create new user
      const newUser: User = {
        id: userId,
        name: username,
        status: 'online',
        avatar: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`, // Generate avatar
        lastSeen: new Date()
      };
      
      // Save user to database
      await saveUser(newUser);
      
      // Set the current user and mark as authenticated
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      
      // Store user ID in localStorage for persistent login
      localStorage.setItem('currentUserId', newUser.id);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to register');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (currentUser) {
      try {
        // Update user's status to offline before logging out
        const updatedUser = {
          ...currentUser,
          status: 'offline' as const,
          lastSeen: new Date()
        };
        
        await saveUser(updatedUser);
      } catch (error) {
        console.error('Error updating user status on logout:', error);
      }
    }
    
    // Clear user data
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUserId');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        error,
        login,
        register,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
