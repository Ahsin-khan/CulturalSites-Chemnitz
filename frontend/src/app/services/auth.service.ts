import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';


import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private tokenKey = 'token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    const payload = {
    username: userData.username,
    email: userData.email,
    password: userData.password,
    first_name: userData.firstName,
    last_name: userData.lastName,
    location_lat: userData.locationLat,
    location_lon: userData.locationLon
  };
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map(user => {
        const transformedUser: User = {
          id: user.id,
          userName: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          bio: user.bio || '',
          location: user.location_lat && user.location_lon
            ? `${user.location_lat}, ${user.location_lon}`
            : '',
          createdAt: user.created_at,
          updatedAt: user.updated_at
        };
        this.currentUserSubject.next(transformedUser);
        return transformedUser;
      })
    );
  }


  updateProfile(userData: Partial<User>): Observable<User> {
    const payload: any = {
      username: userData.userName,
      first_name: userData.firstName,
      last_name: userData.lastName,
      email : userData.email,
    };

  return this.http.put<any>(`${this.apiUrl}/me`, payload).pipe(
    map((res) => ({
      id: res.id,
      userName: res.username,
      firstName: res.first_name,
      lastName: res.last_name,
      email: res.email,
      location: `${res.location_lat}, ${res.location_lon}`,
      createdAt: res.created_at,
      updatedAt: res.updated_at
    })),
    tap(user => this.currentUserSubject.next(user))
  );
  }


  checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.getCurrentUser().subscribe({
        error: () => this.logout()
      });
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map(user => {
        const transformedUser: User = {
          id: user.id,
          userName: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          bio: user.bio || '',
          location: user.location_lat && user.location_lon
            ? `${user.location_lat}, ${user.location_lon}`
            : '',
          createdAt: user.created_at,
          updatedAt: user.updated_at
        };
        this.currentUserSubject.next(transformedUser);
        return transformedUser;
      })
    );
  }


    setCurrentUser(user: User) {
    this.currentUserSubject.next(user);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

}