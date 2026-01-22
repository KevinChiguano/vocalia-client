export type UserRole = "ADMIN" | "VOCAL" | "USER";

export interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  rol: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse =
  | {
      success: true;
      data: {
        user: User;
        token: string;
      };
      message?: string;
      error?: string;
    }
  | {
      success: false;
      data?: never;
      message?: string;
      error?: string;
    };
