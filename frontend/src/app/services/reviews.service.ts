import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Review, CreateReviewRequest } from '../models/Review';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getReviewsForSite(siteId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/site/${siteId}`);
  }

  submitReview(siteId: number, review: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews/site/${siteId}`, review);
  }

  updateReview(reviewId: number, review: CreateReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/reviews/${reviewId}`, review);
  }

  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`);
  }

  getUserReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/user`);
  }
}