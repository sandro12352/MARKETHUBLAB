import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [ 
  {
    path:'dashboard',
    loadComponent:()=>import('./pages/home-dashboard-componente/home-dashboard-componente').then(m=>m.HomeDashboardComponente),
  }
  
];
