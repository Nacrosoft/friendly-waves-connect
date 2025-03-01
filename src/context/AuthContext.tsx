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
  updateCurrentUser: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
            
            const updatedUser = {
              ...user,
              status: 'online' as const,
              lastSeen: new Date()
            };
            
            await saveUser(updatedUser);
            setCurrentUser(updatedUser);
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

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          status: 'offline' as const,
          lastSeen: new Date()
        };
        
        try {
          await saveUser(updatedUser);
        } catch (error) {
          console.error('Error updating user status on unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userId = `user-${username.toLowerCase().replace(/\s+/g, '-')}`;
      
      const user = await getUser(userId);
      
      if (!user) {
        setError('User not found');
        return false;
      }
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      localStorage.setItem('currentUserId', user.id);
      
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
      const userId = `user-${username.toLowerCase().replace(/\s+/g, '-')}`;
      
      const existingUser = await getUser(userId);
      
      if (existingUser) {
        setError('Username already taken');
        return false;
      }
      
      const newUser: User = {
        id: userId,
        name: username,
        status: 'online',
        avatar: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        lastSeen: new Date()
      };
      
      await saveUser(newUser);
      
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      
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
    
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUserId');
  };

  const updateCurrentUser = async (updatedUser: User): Promise<void> => {
    if (!updatedUser) return;
    
    try {
      await saveUser(updatedUser);
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user information');
    }
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
        isAuthenticated,
        updateCurrentUser
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
