export interface Review {
  id: number;
  user_id: number;
  site_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  site_name: string;
  site_type: string;
  visitDate?: string;
    user: {
    id: number;
    firstName: string;
    lastName: string;
  };
    culturalSite?: {
    id: number;
    name: string;
  };

  username?: string;
  first_name?: string;
  last_name?: string;
}


export interface CreateReviewRequest {
  rating: number;
  comment: string;
  visitDate?: string;
}