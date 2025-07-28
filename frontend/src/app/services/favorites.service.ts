import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CulturalSite } from '../models/CulturalSite';
import { Favorite } from '../models/Favorites';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/favorites`);
  }

  addToFavorites(siteId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/favorites/${siteId}`, {});
  }

  removeFromFavorites(siteId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favorites/${siteId}`);
  }

  checkFavoriteStatus(siteId: number): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${this.apiUrl}/favorites/${siteId}/check`);
  }
}