import { Routes } from '@angular/router';

export const TASKS_ROUTES: Routes = [
  {
    path: 'tasks',
    loadComponent: () => import('./pages/task-component/task-component').then(m => m.TaskComponent),
  },
];
