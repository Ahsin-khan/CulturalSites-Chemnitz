import { Request } from 'express';

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  location_lat: number | null;
  location_lon: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreation {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  location_lat?: number;
  location_lon?: number;
}

export interface UserAuthentication {
  username: string;
  password: string;
}

// Cultural Site Types
export interface CulturalSite {
  id: number;
  osm_id: number;
  name: string;
  type: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: any | null;
  opening_hours: string | null;
  website: string | null;
  phone: string | null;
  tags: any;
  created_at: Date;
  updated_at: Date;
  distance?: number;
}

export interface CulturalSiteCreation {
  osm_id: number;
  name: string;
  type: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: any;
  opening_hours?: string;
  website?: string;
  phone?: string;
  tags: any;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryCreation {
  name: string;
  description?: string;
  icon?: string;
}

// Favorite Types
export interface Favorite {
  id: number;
  user_id: number;
  site_id: number;
  created_at: Date;
}

export interface FavoriteCreation {
  user_id: number;
  site_id: number;
}

// Review Types
export interface Review {
  id: number;
  user_id: number;
  site_id: number;
  rating: number;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ReviewCreation {
  user_id: number;
  site_id: number;
  rating: number;
  comment?: string;
}

// OpenStreetMap Types
export interface OverpassResult {
  elements: OverpassElement[];
}

export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: {
    [key: string]: string;
  };
  center?: {
    lat: number;
    lon: number;
  };
  nodes?: number[];
  geometry?: Array<{
    lat: number;
    lon: number;
  }>;
}

// Dashboard Types
export interface DashboardData {
  user: User;
  favorites: Array<CulturalSite & { categories: Category[] }>;
  recentReviews: Array<Review & { site: CulturalSite }>;
  totalFavorites: number;
  totalReviews: number;
  totalSites: number;
}

// Token and Auth Types
export interface TokenPayload {
  user_id: number;
  username: string;
  email?: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}
