import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import UserService from "../services/UserService";
import type { LoginData, RegisterData, User as AuthUser, AuthRes } from "../types/auth";
import type { UserRole } from "../types/roles";
import type { User } from "../types/users";

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<AuthRes>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const user = JSON.parse(saved) as AuthUser;
        UserService.setCurrentUser(user as User);
        return user;
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const [role, setRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem("role");
    return saved ? (saved as UserRole) : null;
  });
  
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const getCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const savedUser = localStorage.getItem("user");
      
      if (!savedUser) {
        return null;
      }
      
      const user = JSON.parse(savedUser) as AuthUser;
      UserService.setCurrentUser(user as User);
      
      return user;
    } catch (error) {
      return null;
    }
  }, []);

  const initAuth = useCallback(async () => {
    setIsLoading(true);

    try {
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        setRole(currentUser.role as UserRole);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUser]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        setRole(currentUser.role as UserRole);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  const login = async (data: LoginData): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await authService.login(data);
      
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("role", result.user.role);
      
      setUser(result.user);
      setRole(result.user.role as UserRole);
      UserService.setCurrentUser(result.user as User);
      
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<AuthRes> => {
    setIsLoading(true);
    try {
      const result = await authService.register(data);
      
      // User creation success is handled by the returned result
      return result;
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      // Silent error handling for logout
    } finally {
      UserService.setCurrentUser(null);
      
      setUser(null);
      setRole(null);
      
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}