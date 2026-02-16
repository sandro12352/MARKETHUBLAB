import { Routes } from '@angular/router';

export const PROJECTS_ROUTES: Routes = [
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects-component/projects-component').then(m => m.ProjectsComponent),
  },
  {
    path: 'projects/:id_proyecto',
    loadComponent: () => import('./pages/details-project-component/details-project-component').then(m => m.DetailsProjectComponent),
  },
  {
    path: 'projects/:id_proyecto/folder/:id_carpeta',
    loadComponent: () => import('./pages/folder-content-component/folder-content-component').then(m => m.FolderContentComponent),
  }
];
