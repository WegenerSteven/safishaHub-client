import type { User } from "./User.interface";

export interface AuthResponse{
    user: User;
    accessToken: string;
    refreshToken: string;
    message?: string;
}

export interface AuthError{
    message: string;
    statusCode: number;
    error?: string;
}

export interface GoogleAuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}