import api from "../api/axios";
import type { User, CreateUserDto, UpdateUserDto } from "../types/users";
import type { AuthRes } from "../types/auth";

type UnifiedUser = User & {
  createdAt?: string;
  updatedAt?: string;
};

class UserService {
  private currentUser: User | null = null;

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<UnifiedUser[]>("/users");
      // Transform the response to match User type
      return response.data.map(user => ({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString()
      }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch users";
      throw new Error(errorMessage);
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await api.get<UnifiedUser>(`/users/${id}`);
      const user = response.data;
      // Transform the response to match User type
      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString()
      };
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      if (err.response?.status === 404) {
        return null;
      }
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch user";
      throw new Error(errorMessage);
    }
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    try {
      const response = await api.post<AuthRes>("/auth/register", dto);
      
      if (!response.data?.user) {
        throw new Error("Invalid response format from server");
      }
      
      const userData = response.data.user;
      
      // Transform AuthUser to User type
      return {
        _id: userData._id,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString()
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err.response?.data?.message || err.message || "Failed to create user";
      throw new Error(errorMessage);
    }
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User | null> {
    try {
      const response = await api.put<UnifiedUser>(`/users/${id}`, dto);
      const user = response.data;
      // Transform the response to match User type
      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString()
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err.response?.data?.message || err.message || "Failed to update user";
      throw new Error(errorMessage);
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await api.delete(`/users/${id}`);
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete user";
      throw new Error(errorMessage);
    }
  }

  async checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const users = await this.getUsers();
      return users.some(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        (!excludeId || user._id !== excludeId)
      );
    } catch (error) {
      return false;
    }
  }
}

export default new UserService();