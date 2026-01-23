import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  {
    path: 'clients',
    loadComponent: () => import('./pages/clients-component/clients-component').then(m => m.ClientsComponent),
  },
];
