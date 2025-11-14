import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginAPI, registerAPI } from '../api';
import type { LoginData, RegisterData, User } from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const login = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login...');
      const response = await loginAPI(data);
      console.log('Login successful:', response);
      
      setUser(response.user);
      if (response.tokens?.accessToken) {
        localStorage.setItem('accessToken', response.tokens.accessToken);
      }
      
      return Promise.resolve();
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting registration...');
      const response = await registerAPI(data);
      console.log('Registration successful:', response);
      
      setUser(response.user);
      if (response.tokens?.accessToken) {
        localStorage.setItem('accessToken', response.tokens.accessToken);
      }
      
      return Promise.resolve();
    } catch (err) {
      console.error('Registration failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};