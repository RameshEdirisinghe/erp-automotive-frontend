export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthRes {
  user: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}