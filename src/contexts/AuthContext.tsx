import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import type { LoginData, RegisterData, User } from "../types/auth";
import type { UserRole } from "../types/roles";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [role, setRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem("role");
    return saved ? (saved as UserRole) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    await checkAuth();
  };

  const checkAuth = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Auth check failed:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        setUser(null);
        setRole(null);
      }

      setIsLoading(false);
      return false;
    }
  };

  const login = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      const { user: loggedUser } = res.data;

      setUser(loggedUser);
      setRole(loggedUser.role);
      localStorage.setItem("user", JSON.stringify(loggedUser));
      localStorage.setItem("role", loggedUser.role);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await api.post("/auth/register", data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
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
