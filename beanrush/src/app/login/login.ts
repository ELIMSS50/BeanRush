import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Login {
  credentials = {
    email: '',
    password: ''
  };

  error = '';
  isLoading = false;

  constructor(
    private router: Router,
    private usersService: UsersService
  ) {}

  login() {
    if (this.validateForm()) {
      this.isLoading = true;
      this.error = '';

      console.log('Intentando login con:', this.credentials);

      this.usersService.login(this.credentials).subscribe({
        next: (user) => {
          console.log('Login exitoso:', user);
          
          // Guardar en localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.isLoading = false;
          
          // Redirigir según el rol
          this.redirectByRole(user.role);
        },
        error: (error) => {
          console.error('Error en login:', error);
          
          if (error.status === 0) {
            this.error = 'Error de conexión. Verifica que el servidor esté funcionando.';
          } else if (error.status === 400) {
            this.error = error.error?.error || 'Credenciales incorrectas';
          } else {
            this.error = error.error?.error || 'Error al iniciar sesión';
          }
          
          this.isLoading = false;
        }
      });
    }
  }

  validateForm(): boolean {
    if (!this.credentials.email || !this.credentials.password) {
      this.error = 'Todos los campos son obligatorios';
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.credentials.email)) {
      this.error = 'El correo no es válido';
      return false;
    }
    
    return true;
  }

  private redirectByRole(role: string) {
    switch(role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'employee':
        this.router.navigate(['/employee']);
        break;
      case 'customer':
        this.router.navigate(['/customer']);
        break;
      default:
        this.router.navigate(['/customer']);
    }
  }

  newAccount() {
    this.router.navigate(['/registro']);
  }
}