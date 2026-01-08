import type { User, CreateUserDto, UpdateUserDto } from "../types/users";

// Mock users data
const mockUsers: User[] = [
  {
    _id: "1",
    fullName: "Admin User",
    email: "admin@example.com",
    role: "admin",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    _id: "2",
    fullName: "Inventory Manager 1",
    email: "inventory1@example.com",
    role: "inventory_manager",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z"
  },
  {
    _id: "3",
    fullName: "Inventory Manager 2",
    email: "inventory2@example.com",
    role: "inventory_manager",
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z"
  }
];

class UserService {
  private users: User[] = [...mockUsers];
  private currentUser: User | null = null;

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  async getUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.users];
  }

  async getUserById(id: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.users.find(user => user._id === id) || null;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      _id: Date.now().toString(),
      fullName: dto.fullName,
      email: dto.email,
      role: dto.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.users.findIndex(user => user._id === id);
    if (index === -1) return null;
    
    // Prevent updating admin if not admin
    const userToUpdate = this.users[index];
    if (userToUpdate.role === 'admin' && this.currentUser?.role !== 'admin') {
      throw new Error("Only admins can modify admin users");
    }
    
    this.users[index] = {
      ...this.users[index],
      ...dto,
      updatedAt: new Date().toISOString()
    };
    
    return this.users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const userToDelete = this.users.find(user => user._id === id);
    
    // Prevent deleting admin users
    if (userToDelete?.role === 'admin') {
      throw new Error("Cannot delete admin users");
    }
    
    if (!userToDelete) return false;
    
    this.users = this.users.filter(user => user._id !== id);
    return true;
  }

  async checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.users.some(user => 
      user.email === email && user._id !== excludeId
    );
  }
}

export default new UserService();