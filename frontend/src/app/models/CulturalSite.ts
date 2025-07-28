import { Review } from "./Review";

export interface CulturalSite {
  id: number;
  name: string;
  description: string;
  inscription?: string;
  type: string;
  osmId?: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  admissionFee?: string;
  accessibility?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
  reviews?: Review[];
  favorite_count?: number;
  average_rating?: number;
  is_favorited?: boolean;
  distance?: number;
  tags?: { [key: string]: string };
  wheelchair?: string | number ;
  fee?: string | number ;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}