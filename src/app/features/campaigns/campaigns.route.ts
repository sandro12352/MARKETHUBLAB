import { Routes } from '@angular/router';

export const CAMPAIGNS_ROUTES: Routes = [
    {
        path: 'campaigns',
        loadComponent: () => import('./pages/campaigns-component/campaigns-component').then(m => m.CampaignsComponent),
    },
    {
        path: 'campaigns/:id_campana',
        loadComponent: () => import('./pages/campaign-detail-component/campaign-detail-component').then(m => m.CampaignDetailComponent),
    }
];
