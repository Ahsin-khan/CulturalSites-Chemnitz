import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DashboardData } from '../models/Dashboard';
import { CulturalSite } from '../models/CulturalSite';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }

  getNearbyDashboardData(lat: number, lng: number, radius?: number): Observable<any> {
    let params = new HttpParams()
      .set('lat', lat.toString())
      .set('lng', lng.toString());
    if (radius) {
      params = params.set('radius', radius.toString());
    }
    return this.http.get(`${this.apiUrl}/dashboard/nearby`, { params });
  }
}