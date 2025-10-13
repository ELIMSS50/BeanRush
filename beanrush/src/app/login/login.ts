import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email: string = '';
  password: string = '';

  // Usuarios de prueba
  private testUsers = [
    { email: 'cliente@cafetin.com', password: '123456', role: 'customer', name: 'Juan Cliente' },
    { email: 'empleado@cafetin.com', password: '123456', role: 'employee', name: 'Pedro Empleado' },
    { email: 'admin@cafetin.com', password: '123456', role: 'admin', name: 'Ana Admin' }
  ];

  constructor(private router: Router) {}

  login() {
    const user = this.testUsers.find(u => 
      u.email === this.email && u.password === this.password
    );

    if (user) {
      // Guardar en localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Redirigir según rol
      this.redirectByRole(user.role);
    } else {
      alert('Credenciales incorrectas');
    }
  }

  private redirectByRole(role: string) {
    switch(role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'employee':
        this.router.navigate(['/employee']);
        break;
      default:
        this.router.navigate(['/customer']);
    }
  }
}