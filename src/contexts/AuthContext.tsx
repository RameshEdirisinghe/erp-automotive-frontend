import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { LoginData, RegisterData, User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  const login = async (data: LoginData) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login...');
      const response = await authService.login(data);
      console.log('Login successful:', response);
      
      setUser(response.user);
      if (response.tokens?.accessToken) {
        localStorage.setItem('accessToken', response.tokens.accessToken);
      }
      
      return Promise.resolve();
    } catch (err: any) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting registration...');
      const response = await authService.register(data);
      console.log('Registration successful:', response);
      
      setUser(response.user);
      if (response.tokens?.accessToken) {
        localStorage.setItem('accessToken', response.tokens.accessToken);
      }
      
      return Promise.resolve();
    } catch (err: any) {
      console.error('Registration failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}