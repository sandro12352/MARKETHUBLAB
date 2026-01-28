import { Routes } from '@angular/router';

export const CONTRACTS_ROUTES: Routes = [
    {
        path: 'contracts',
        loadComponent: () => import('./pages/contracts-component/contracts-component').then(m => m.ContractsComponent),
    },
];
