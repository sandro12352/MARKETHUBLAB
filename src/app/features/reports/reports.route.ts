import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports-component/reports-component').then(m => m.ReportsComponent),
  },
];
