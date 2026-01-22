export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  roles: Role | null;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  rol_id: number;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  rol_id?: number;
  is_active?: boolean;
}
