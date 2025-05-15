import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { validateApiKey } from '../services/pineconeService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (apiKey: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved API key in localStorage
    const savedApiKey = localStorage.getItem('pineconeApiKey');
    
    if (savedApiKey) {
      validateApiKey(savedApiKey)
        .then((isValid) => {
          if (isValid) {
            setUser({ apiKey: savedApiKey });
          } else {
            localStorage.removeItem('pineconeApiKey');
          }
        })
        .catch(() => {
          localStorage.removeItem('pineconeApiKey');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (apiKey: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const isValid = await validateApiKey(apiKey);
      
      if (isValid) {
        localStorage.setItem('pineconeApiKey', apiKey);
        setUser({ apiKey });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pineconeApiKey');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};