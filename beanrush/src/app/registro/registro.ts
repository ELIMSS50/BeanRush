import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro{
  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  };

  errors = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = false;

  constructor(private router: Router) {}

  onRegister() {
    if (this.validateForm()) {
      this.isLoading = true;
      
      // Simular registro (después conectarás con la API)
      setTimeout(() => {
        console.log('Usuario registrado:', this.user);
        
        // Guardar en localStorage (temporal)
        const userData = {
          email: this.user.email,
          name: this.user.name,
          role: this.user.role
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        this.isLoading = false;
        this.router.navigate(['/customer']);
      }, 1500);
    }
  }

  validateForm(): boolean {
    let isValid = true;
    this.clearErrors();

    // Validar nombre
    if (!this.user.name.trim()) {
      this.errors.name = 'El nombre es obligatorio';
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
    if (this.user.password !== this.user.confirmPassword) {
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
      confirmPassword: ''
    };
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
}