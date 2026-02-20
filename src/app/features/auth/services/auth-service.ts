import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthResponse } from '../interfaces/auth.interface';

export interface User {
  id?: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  id_rol?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();
  private token: string | null = this.getTokenFromStorage();

  constructor() {
    // Cargar usuario del localStorage si existe
    const storedUser = this.getUserFromStorage();
    if (storedUser) {
      this.userSubject.next(storedUser);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, { email, password }, { withCredentials: true });
  }

  /**
   * Maneja la respuesta del login y persiste user + token
   */
  handleLoginResponse(resp: AuthResponse): void {
    if (resp?.token) {
      this.setToken(resp.token);
    }
    if (resp?.user) {
      this.setUser(resp.user);
    }
  }

  /**
   * Establece el usuario autenticado
   */
  setUser(user: User, token?: string): void {
    this.userSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (token) {
      this.setToken(token);
    }
  }

  /**
   * Obtiene el usuario autenticado actual
   */
  getUser(): User | null {
    return this.userSubject.value;
  }

  /**
   * Obtiene el usuario como observable
   */
  getUser$(): Observable<User | null> {
    return this.user$;
  }

  /**
   * Guarda el token en memoria y en localStorage
   */
  setToken(token: string): void {
    this.token = token;
    try {
      localStorage.setItem('authToken', token);
    } catch (e) {
      console.error('Error saving auth token:', e);
    }
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Recupera token desde localStorage
   */
  private getTokenFromStorage(): string | null {
    try {
      return localStorage.getItem('authToken');
    } catch (e) {
      console.error('Error reading auth token from storage:', e);
      return null;
    }
  }

  /**
   * Devuelve opciones para llamadas HTTP autenticadas
   */
  getAuthOptions(): { headers: HttpHeaders; withCredentials: boolean } {
    const t = this.getToken();
    const headers = new HttpHeaders({
      Authorization: t ? `Bearer ${t}` : ''
    });
    return { headers, withCredentials: true };
  }

  /**
   * Recupera el usuario del localStorage
   */
  private getUserFromStorage(): User | null {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error al recuperar usuario del localStorage:', error);
      return null;
    }
  }

  /**
   * Limpia el usuario autenticado (logout)
   */
  clearUser(): void {
    this.userSubject.next(null);
    localStorage.removeItem('currentUser');
    this.clearToken();
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    return this.userSubject.value !== null;
  }

  /**
   * Limpiar token
   */
  clearToken(): void {
    this.token = null;
    try {
      localStorage.removeItem('authToken');
    } catch (e) {
      console.error('Error removing auth token:', e);
    }
  }

}
