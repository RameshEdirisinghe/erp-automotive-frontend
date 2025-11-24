import api from "../api/axios";
import type { LoginData, RegisterData, AuthRes } from "../types/auth";

export const authService = {
  async login(loginData: LoginData): Promise<AuthRes> {
    try {
      const response = await api.post<AuthRes>("/auth/login", loginData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      throw new Error(errorMessage);
    }
  },

  async register(registerData: RegisterData): Promise<AuthRes> {
    try {
      const response = await api.post<AuthRes>("/auth/register", registerData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      throw new Error(errorMessage);
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    }
  },
};

export const loginAPI = authService.login;
export const registerAPI = authService.register;
