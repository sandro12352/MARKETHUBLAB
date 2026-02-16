import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout-component/auth-layout-component';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { MainLayoutComponent } from './layout/main-layout/main-layout-component/main-layout-component';
import { DASHBOARD_ROUTES } from './features/dashboard/dashboard.route';
import { TASKS_ROUTES } from './features/tasks/tasks.route';
import { TEAM_ROUTES } from './features/team/team.route';
import { CLIENTS_ROUTES } from './features/clients/client.route';
import { PROJECTS_ROUTES } from './features/projects/projects.route';
import { REPORTS_ROUTES } from './features/reports/reports.route';
import { CONTRACTS_ROUTES } from './features/contracts/contracts.route';
import { CAMPAIGNS_ROUTES } from './features/campaigns/campaigns.route';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: AUTH_ROUTES
  },
  {
    path: 'home',
    component: MainLayoutComponent,
    children: [
      ...DASHBOARD_ROUTES,
      ...TASKS_ROUTES,
      ...TEAM_ROUTES,
      ...CLIENTS_ROUTES,
      ...PROJECTS_ROUTES,
      ...REPORTS_ROUTES,
      ...CONTRACTS_ROUTES,
      ...CAMPAIGNS_ROUTES,
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  }
];
