import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'employee' | 'admin';
  confirmPassword?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:4000/api/users';

  constructor(private http: HttpClient) {}

  register(user: User): Observable<UserResponse> {
    // Enviar solo los campos necesarios al backend
    const userData = {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role
    };
    
    console.log('Enviando datos de registro:', userData);
    
    return this.http.post<UserResponse>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/login`, credentials);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}