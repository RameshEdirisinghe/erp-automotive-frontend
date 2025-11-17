import React, { createContext, useContext, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  const login = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      const loggedUser = res.data.user;
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
    await api.post("/auth/logout");
    setUser(null);
    setRole(null);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
