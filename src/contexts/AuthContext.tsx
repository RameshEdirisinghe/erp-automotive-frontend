import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { LoginData, RegisterData, User as AuthUser } from "../types/auth";
import type { UserRole } from "../types/roles";
import type { User } from "../types/users";
import UserService from "../services/UserService";

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for initial login
const mockUsers = [
  {
    _id: "1",
    fullName: "Admin User",
    email: "main.residue@gmail.com",
    role: "admin" as UserRole,
    password: "Residue@123",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    _id: "2",
    fullName: "Inventory Manager",
    email: "manager@example.com",
    role: "inventory_manager" as UserRole,
    password: "manager123",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z"
  }
] as const;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const user = JSON.parse(saved) as AuthUser;
      UserService.setCurrentUser(user as User);
      return user;
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
      const currentUser = localStorage.getItem("user");
      if (currentUser) {
        const user = JSON.parse(currentUser) as AuthUser;
        UserService.setCurrentUser(user as User);
        return user;
      }
      return null;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }, []);

  // Update the initAuth function
  const initAuth = useCallback(async () => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        setRole(currentUser.role as UserRole);
      } else {
        // No user in localStorage, clear everything
        setUser(null);
        setRole(null);
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      setUser(null);
      setRole(null);
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUser]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const checkAuth = async (): Promise<boolean> => {
    try {
      // Simulate API verification
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        setRole(currentUser.role as UserRole);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setRole(null);
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find user in mock data
      const foundUser = mockUsers.find(
        u => u.email === data.email && u.password === data.password
      );
      
      if (!foundUser) {
        throw new Error("Invalid credentials");
      }
      
      const { password: _password, ...userWithoutPassword } = foundUser;
      const loggedUser: AuthUser = userWithoutPassword;
      
      setUser(loggedUser);
      setRole(loggedUser.role as UserRole);
      UserService.setCurrentUser(loggedUser as User);
      
      localStorage.setItem("user", JSON.stringify(loggedUser));
      localStorage.setItem("role", loggedUser.role);
    } catch (error: unknown) {
      console.error("Login error:", error);
      throw error instanceof Error ? error : new Error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if email already exists
      const emailExists = mockUsers.some(u => u.email === data.email);
      if (emailExists) {
        throw new Error("Email already in use");
      }
      
      // Create new user
      const newUser = {
        _id: Date.now().toString(),
        fullName: data.fullName,
        email: data.email,
        role: (data.role || "inventory_manager") as UserRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log("Registered new user:", newUser);
      
    } catch (error: unknown) {
      console.error("Registration error:", error);
      throw error instanceof Error ? error : new Error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      UserService.setCurrentUser(null);
      
      setUser(null);
      setRole(null);
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    } catch (error) {
      console.error("Logout error:", error);
      
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