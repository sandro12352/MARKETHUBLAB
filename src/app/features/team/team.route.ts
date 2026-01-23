import { Routes } from '@angular/router';

export const TEAM_ROUTES: Routes = [
  {
    path: 'team',
    loadComponent: () => import('./pages/team-component/team-component').then(m => m.TeamComponent),
  },
];
