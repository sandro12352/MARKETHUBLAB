import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Ad, AdSet, Campaign } from '../interfaces/campaign.interface';

@Injectable({
    providedIn: 'root',
})
export class CampaignsService {
    private http = inject(HttpClient);

    // ─── Campañas ─────────────────────────────────────────────
    getAllCampaigns(): Observable<Campaign[]> {
        return this.http.get<Campaign[]>(`${environment.apiUrl}/api/campaigns`);
    }

    getCampaignById(id: number): Observable<Campaign> {
        return this.http.get<Campaign>(`${environment.apiUrl}/api/campaigns/${id}`);
    }

    createCampaign(campaign: Partial<Campaign>): Observable<Campaign> {
        return this.http.post<Campaign>(`${environment.apiUrl}/api/campaigns`, campaign);
    }

    updateCampaign(id: number, campaign: Partial<Campaign>): Observable<Campaign> {
        return this.http.put<Campaign>(`${environment.apiUrl}/api/campaigns/${id}`, campaign);
    }

    deleteCampaign(id: number): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/api/campaigns/${id}`);
    }

    // ─── Conjuntos de Anuncios ────────────────────────────────
    getAdSetsByCampaign(campaignId: number): Observable<AdSet[]> {
        return this.http.get<AdSet[]>(`${environment.apiUrl}/api/campaigns/${campaignId}/adsets`);
    }

    createAdSet(adSet: Partial<AdSet>): Observable<AdSet> {
        return this.http.post<AdSet>(`${environment.apiUrl}/api/adsets`, adSet);
    }

    updateAdSet(id: number, adSet: Partial<AdSet>): Observable<AdSet> {
        return this.http.put<AdSet>(`${environment.apiUrl}/api/adsets/${id}`, adSet);
    }

    deleteAdSet(id: number): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/api/adsets/${id}`);
    }

    // ─── Anuncios ─────────────────────────────────────────────
    getAdsByAdSet(adSetId: number): Observable<Ad[]> {
        return this.http.get<Ad[]>(`${environment.apiUrl}/api/adsets/${adSetId}/ads`);
    }

    createAd(ad: Partial<Ad>): Observable<Ad> {
        return this.http.post<Ad>(`${environment.apiUrl}/api/ads`, ad);
    }

    updateAd(id: number, ad: Partial<Ad>): Observable<Ad> {
        return this.http.put<Ad>(`${environment.apiUrl}/api/ads/${id}`, ad);
    }

    deleteAd(id: number): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/api/ads/${id}`);
    }

    // ─── Utilidades ───────────────────────────────────────────
    getStatusColor(status: string): string {
        const colors: Record<string, string> = {
            borrador: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
            activa: 'bg-green-500/10 text-green-400 border-green-500/20',
            activo: 'bg-green-500/10 text-green-400 border-green-500/20',
            pausada: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            pausado: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            finalizada: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            finalizado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            rechazado: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }

    getPlatformIcon(platform: string): string {
        const icons: Record<string, string> = {
            facebook: 'logos:facebook',
            instagram: 'logos:instagram-icon',
            google: 'logos:google-icon',
            tiktok: 'logos:tiktok-icon',
            linkedin: 'logos:linkedin-icon',
            youtube: 'logos:youtube-icon',
            twitter: 'logos:twitter',
        };
        return icons[platform?.toLowerCase()] || 'lucide:globe';
    }
}
