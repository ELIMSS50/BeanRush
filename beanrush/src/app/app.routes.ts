import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Cliente } from './cliente/cliente';
import { Empleado } from './empleado/empleado';
import { Pagos } from './pagos/pagos';
import { Pantalla } from './pantalla/pantalla';
import { Admin } from './admin/admin';
import { FormsModule } from '@angular/forms';
import { Registro } from './registro/registro';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'customer', component: Cliente },
  {path: 'pagos', component: Pagos },
  {path: 'pantalla', component: Pantalla },
  { path: 'employee', component: Empleado },
  { path: 'admin', component: Admin },
  {path: 'registro', component: Registro },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),FormsModule],
  exports: [RouterModule]
  
})
export class AppRoutingModule { }