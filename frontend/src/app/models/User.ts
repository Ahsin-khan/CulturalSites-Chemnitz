export interface User {
  id: number;
  email: string;
  firstName: string;
  userName: string;
  lastName: string;
  bio?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  locationLat: number | null;
  locationLon: number | null;
}


export interface AuthResponse {
  token: string;
  user: User;
}