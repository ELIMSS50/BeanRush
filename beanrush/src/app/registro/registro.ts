import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro {
  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'employee' | 'admin'
  };

  errors = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  };

  isLoading = false;
  generalError = '';

  constructor(
    private router: Router,
    private usersService: UsersService
  ) {}

  onRegister() {
    this.generalError = '';
    
    if (this.validateForm()) {
      this.isLoading = true;
      
      // Determinar el rol basado en el email
      const role = this.determineRoleFromEmail(this.user.email);
      if (!role) {
        this.errors.email = 'El correo debe terminar en @cliente.com, @empleado.com o @admin.com';
        this.isLoading = false;
        return;
      }

      this.user.role = role;

      console.log('Intentando registrar usuario:', this.user);

      // Registrar en la base de datos
      this.usersService.register(this.user).subscribe({
        next: (response) => {
          console.log('Usuario registrado exitosamente:', response);
          
          // Guardar en localStorage
          const userData = {
            id: response.id,
            email: response.email,
            name: response.name,
            role: response.role
          };
          localStorage.setItem('currentUser', JSON.stringify(userData));
          
          this.isLoading = false;
          
          // Redirigir según el rol
          this.redirectByRole(response.role);
        },
        error: (error) => {
          console.error('Error completo al registrar:', error);
          
          if (error.status === 0) {
            this.generalError = 'Error de conexión. Verifica que el servidor esté funcionando.';
          } else if (error.status === 400) {
            this.errors.email = error.error?.error || 'El correo ya está registrado';
          } else if (error.status === 500) {
            this.generalError = 'Error del servidor. Intenta nuevamente.';
          } else {
            this.generalError = error.error?.error || 'Error al registrar usuario';
          }
          
          this.isLoading = false;
        }
      });
    }
  }

  determineRoleFromEmail(email: string): 'customer' | 'employee' | 'admin' | null {
    if (email.endsWith('@cliente.com')) return 'customer';
    if (email.endsWith('@empleado.com')) return 'employee';
    if (email.endsWith('@admin.com')) return 'admin';
    return null;
  }

  redirectByRole(role: string) {
    switch(role) {
      case 'customer':
        this.router.navigate(['/customer']);
        break;
      case 'employee':
        this.router.navigate(['/employee']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/customer']);
    }
  }

  validateForm(): boolean {
    let isValid = true;
    this.clearErrors();
    this.generalError = '';

    // Validar nombre
    if (!this.user.name.trim()) {
      this.errors.name = 'El nombre es obligatorio';
      isValid = false;
    } else if (this.user.name.trim().length < 2) {
      this.errors.name = 'El nombre debe tener al menos 2 caracteres';
      isValid = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.user.email) {
      this.errors.email = 'El correo es obligatorio';
      isValid = false;
    } else if (!emailRegex.test(this.user.email)) {
      this.errors.email = 'El correo no es válido';
      isValid = false;
    } else {
      // Validar dominio del email
      const role = this.determineRoleFromEmail(this.user.email);
      if (!role) {
        this.errors.email = 'El correo debe terminar en @cliente.com, @empleado.com o @admin.com';
        isValid = false;
      }
    }

    // Validar contraseña
    if (!this.user.password) {
      this.errors.password = 'La contraseña es obligatoria';
      isValid = false;
    } else if (this.user.password.length < 6) {
      this.errors.password = 'Mínimo 6 caracteres';
      isValid = false;
    }

    // Validar confirmación
    if (!this.user.confirmPassword) {
      this.errors.confirmPassword = 'Confirma tu contraseña';
      isValid = false;
    } else if (this.user.password !== this.user.confirmPassword) {
      this.errors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    return isValid;
  }

  clearErrors() {
    this.errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    };
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}