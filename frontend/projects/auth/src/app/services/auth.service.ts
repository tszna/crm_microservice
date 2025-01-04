import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getAuthEndpoint } from '../../../../shared/config';

interface AuthResponse {
  token: string;
  type: string;
  expiresIn: number;
}

interface AuthRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = getAuthEndpoint('login');
  private registerUrl = getAuthEndpoint('register');

  constructor(private http: HttpClient) {}

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.loginUrl, credentials);
  }

  register(userData: AuthRequest): Observable<void> {
    return this.http.post<void>(this.registerUrl, userData);
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
