import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CulturalSite, Category } from '../models/CulturalSite';

@Injectable({
  providedIn: 'root'
})
export class CulturalSitesService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getCulturalSites(params?: any): Observable<CulturalSite[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<CulturalSite[]>(`${this.apiUrl}/cultural-sites`, { params: httpParams });
  }

  searchSites(query: string, filters?: any): Observable<CulturalSite[]> {
    let params = new HttpParams().set('q', query);
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<CulturalSite[]>(`${this.apiUrl}/cultural-sites/search`, { params });
  }

  getSiteById(id: number): Observable<CulturalSite> {
    return this.http.get<CulturalSite>(`${this.apiUrl}/cultural-sites/${id}`);
  }

  getSitesByType(type: string): Observable<CulturalSite[]> {
    return this.http.get<CulturalSite[]>(`${this.apiUrl}/cultural-sites/type/${type}`);
  }

  getSitesByCategory(categoryId: number): Observable<CulturalSite[]> {
    return this.http.get<CulturalSite[]>(`${this.apiUrl}/cultural-sites/category/${categoryId}`);
  }

  getNearbySites(lat: number, lng: number, radius?: number): Observable<CulturalSite[]> {
    let params = new HttpParams()
      .set('lat', lat.toString())
      .set('lng', lng.toString());
    if (radius) {
      params = params.set('radius', radius.toString());
    }
    return this.http.get<CulturalSite[]>(`${this.apiUrl}/cultural-sites/nearby`, { params });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }
}