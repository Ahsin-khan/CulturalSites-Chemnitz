export interface Category {
  name: string;
}

export interface Site {
  id: number;
  name: string;
  type: string;
  tags: any;
  latitude: string;
  longitude: string;
  averageRating?: number;
  reviewCount?: number;
  categories?: Category[];
}

export interface Favorite {
  id: number;
  user_id: number;
  site_id: number;
  created_at: string;
  site: Site;
}