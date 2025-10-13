import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Cliente } from './cliente/cliente';
import { Empleado } from './empleado/empleado';
import { Admin } from './admin/admin';
import { FormsModule } from '@angular/forms';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'customer', component: Cliente },
  { path: 'employee', component: Empleado },
  { path: 'admin', component: Admin },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),FormsModule],
  exports: [RouterModule]
  
})
export class AppRoutingModule { }