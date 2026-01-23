import { Routes } from '@angular/router';

export const PROJECTS_ROUTES: Routes = [
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects-component/projects-component').then(m => m.ProjectsComponent),
  },
];
