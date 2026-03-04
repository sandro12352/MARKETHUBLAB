import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmButtonImports } from '@spartan/ui/button';
import { HlmInputImports } from '@spartan/ui/input';
import { HlmLabelImports } from '@spartan/ui/label';
import { HlmTextareaImports } from '@spartan/ui/textarea';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmAlertDialogImports } from '@spartan/ui/alert-dialog';
import { HlmDropdownMenuImports } from '@spartan/ui/dropdown-menu';
import { HlmToasterImports } from '@spartan/ui/sonner';
import { toast } from 'ngx-sonner';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan/ui/select';
import { CampaignsService } from '../../services/campaigns.service';
import { Ad, AdSet, Campaign } from '../../interfaces/campaign.interface';

@Component({
    selector: 'app-campaign-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        HlmButtonImports,
        HlmInputImports,
        HlmLabelImports,
        HlmTextareaImports,
        BrnAlertDialogImports,
        HlmAlertDialogImports,
        HlmDropdownMenuImports,
        HlmToasterImports,
        BrnSelectImports,
        HlmSelectImports,
    ],
    templateUrl: './campaign-detail-component.html',
    styleUrl: './campaign-detail-component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CampaignDetailComponent implements OnInit {
    private campaignsService = inject(CampaignsService);
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);

    campaign = signal<Campaign | null>(null);
    adSets = signal<AdSet[]>([]);
    expandedAdSet = signal<number | null>(null);
    adsBySet = signal<Map<number, Ad[]>>(new Map());
    isLoading = signal(true);

    // ─── Ad Set Form ──────────────────────────────────────────
    adSetForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        presupuesto_diario: [5, [Validators.required, Validators.min(4)]],
        edad_min: [18, [Validators.min(13), Validators.max(65)]],
        edad_max: [65, [Validators.min(13), Validators.max(65)]],
        genero: ['todos'],
        optimization_goal: ['REACH', [Validators.required]],
        billing_event: ['IMPRESSIONS', [Validators.required]],
        status: ['PAUSED'],
        bid_strategy: ['LOWEST_COST_WITHOUT_CAP'],
        bid_amount: [null as number | null],
        countries: [['PE']],
        publisher_platforms: [['facebook', 'instagram']],
        promoted_object_page_id: [''],
        promoted_object_pixel_id: [''],
        promoted_object_event_type: [''],
    });
    selectedAdSet = signal<AdSet | null>(null);
    adSetStep = signal<number>(1);
    adSetTotalSteps = 3;

    // ─── Ad Form ──────────────────────────────────────────────
    adForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        tipo: ['imagen', [Validators.required]],
        titulo: ['', [Validators.required]],
        descripcion: [''],
        url_destino: [''],
        texto_principal: [''],
        call_to_action: ['mas_informacion'],
    });
    selectedAd = signal<Ad | null>(null);
    activeAdSetForAd = signal<number | null>(null);

    // ─── Countries available ──────────────────────────────────
    availableCountries = [
        { code: 'PE', name: 'Perú' },
        { code: 'CO', name: 'Colombia' },
        { code: 'MX', name: 'México' },
        { code: 'AR', name: 'Argentina' },
        { code: 'CL', name: 'Chile' },
        { code: 'EC', name: 'Ecuador' },
        { code: 'BR', name: 'Brasil' },
        { code: 'US', name: 'Estados Unidos' },
        { code: 'ES', name: 'España' },
        { code: 'BO', name: 'Bolivia' },
    ];

    availablePlatforms = [
        { id: 'facebook', name: 'Facebook', icon: 'logos:facebook' },
        { id: 'instagram', name: 'Instagram', icon: 'logos:instagram-icon' },
        { id: 'messenger', name: 'Messenger', icon: 'logos:messenger' },
        { id: 'audience_network', name: 'Audience Network', icon: 'lucide:network' },
    ];

    ngOnInit(): void {
        const id = this.route.snapshot.params['id_campaign'];
        console.log(id)
        this.loadCampaignData(id);
    }

    loadCampaignData(id: string) {
        this.isLoading.set(true);
        this.campaignsService.getCampaignById(id).subscribe({
            next: (campaign) => {
                console.log(campaign);
                this.campaign.set(campaign);
                this.loadAdSets(Number(id));
            },
            error: () => {
                this.isLoading.set(false);
                toast.error('Error al cargar la campaña');
            }
        });
    }

    loadAdSets(campaignId: number) {
        this.campaignsService.getAdSetsByCampaign(campaignId).subscribe({
            next: (adSets) => {
                this.adSets.set(adSets);
                this.isLoading.set(false);
                // Load ads for each set
                adSets.forEach(set => {
                    if (set.id_conjunto) {
                        this.loadAdsForSet(set.id_conjunto);
                    }
                });
            },
            error: () => {
                this.isLoading.set(false);
            }
        });
    }

    loadAdsForSet(adSetId: number) {
        this.campaignsService.getAdsByAdSet(adSetId).subscribe({
            next: (ads) => {
                this.adsBySet.update(map => {
                    const newMap = new Map(map);
                    newMap.set(adSetId, ads);
                    return newMap;
                });
            }
        });
    }

    toggleAdSet(adSetId: number) {
        this.expandedAdSet.set(this.expandedAdSet() === adSetId ? null : adSetId);
    }

    getAdsForSet(adSetId: number): Ad[] {
        return this.adsBySet().get(adSetId) || [];
    }

    // ─── Ad Set CRUD ──────────────────────────────────────────
    nextAdSetStep() {
        if (this.adSetStep() < this.adSetTotalSteps) {
            this.adSetStep.update(s => s + 1);
        }
    }

    prevAdSetStep() {
        if (this.adSetStep() > 1) {
            this.adSetStep.update(s => s - 1);
        }
    }

    isCountrySelected(code: string): boolean {
        const countries = this.adSetForm.value.countries || [];
        return countries.includes(code);
    }

    toggleCountry(code: string) {
        const current = this.adSetForm.value.countries || [];
        if (current.includes(code)) {
            this.adSetForm.patchValue({ countries: current.filter((c: string) => c !== code) });
        } else {
            this.adSetForm.patchValue({ countries: [...current, code] });
        }
    }

    isPlatformSelected(id: string): boolean {
        const platforms = this.adSetForm.value.publisher_platforms || [];
        return platforms.includes(id);
    }

    togglePlatform(id: string) {
        const current = this.adSetForm.value.publisher_platforms || [];
        if (current.includes(id)) {
            if (current.length > 1) {
                this.adSetForm.patchValue({ publisher_platforms: current.filter((p: string) => p !== id) });
            }
        } else {
            this.adSetForm.patchValue({ publisher_platforms: [...current, id] });
        }
    }

    onSubmitAdSet(ctx: any) {
        if (this.adSetForm.invalid) {
            this.adSetForm.markAllAsTouched();
            return;
        }

        const formVal = this.adSetForm.value;
        // Meta API requires daily_budget in cents
        const dailyBudgetCents = Math.round((formVal.presupuesto_diario || 5) * 100);

        const genderMap: Record<string, number[]> = {
            'todos': [1, 2],
            'masculino': [1],
            'femenino': [2],
        };

        const adSetData: Partial<AdSet> = {
            id_campaign: this.campaign()?.id_campaign!,
            name: formVal.nombre!,
            daily_budget: dailyBudgetCents,
            targeting: {
                geo_locations: {
                    countries: formVal.countries || ['PE']
                },
                age_min: formVal.edad_min || 18,
                age_max: formVal.edad_max || 65,
                genders: genderMap[formVal.genero || 'todos'] || [1, 2],
                publisher_platforms: formVal.publisher_platforms || ['facebook', 'instagram']
            },
            status: (formVal.status as 'ACTIVE' | 'PAUSED' | 'ARCHIVED') || 'PAUSED',
            optimization_goal: formVal.optimization_goal as AdSet['optimization_goal'],
            billing_event: formVal.billing_event as AdSet['billing_event'],
        };

        // Add promoted_object if any field is filled
        if (formVal.promoted_object_page_id || formVal.promoted_object_pixel_id) {
            adSetData.promoted_object = {};
            if (formVal.promoted_object_page_id) {
                adSetData.promoted_object.page_id = formVal.promoted_object_page_id;
            }
            if (formVal.promoted_object_pixel_id) {
                adSetData.promoted_object.pixel_id = formVal.promoted_object_pixel_id;
                if (formVal.promoted_object_event_type) {
                    adSetData.promoted_object.custom_event_type = formVal.promoted_object_event_type as any;
                }
            }
        }

        if (this.selectedAdSet()) {
            this.campaignsService.updateAdSet(this.selectedAdSet()!.id_conjunto!, adSetData).subscribe({
                next: (updated) => {
                    this.adSets.update(list => list.map(s => s.id_conjunto === updated.id_conjunto ? updated : s));
                    toast.success('¡Conjunto actualizado con éxito!');
                    this.resetAdSetForm();
                    ctx.close();
                },
                error: (err) => {
                    const msg = err?.error?.message || err?.error?.error_user_msg || 'Error al actualizar el conjunto';
                    toast.error(msg);
                }
            });
        } else {
            this.campaignsService.createAdSet(adSetData).subscribe({
                next: (created) => {
                    this.adSets.update(list => [...list, created]);
                    toast.success('¡Conjunto de anuncios creado con éxito!');
                    this.resetAdSetForm();
                    ctx.close();
                },
                error: (err) => {
                    const msg = err?.error?.message || err?.error?.error_user_msg || 'Error al crear el conjunto';
                    toast.error(msg);
                }
            });
        }
    }

    editAdSet(adSet: AdSet) {
        this.selectedAdSet.set(adSet);
        this.adSetStep.set(1);
        // daily_budget comes from API in cents, convert back to currency units for display
        const budgetDisplay = adSet.daily_budget ? adSet.daily_budget / 100 : 5;
        this.adSetForm.patchValue({
            nombre: adSet.name,
            presupuesto_diario: budgetDisplay,
            edad_min: adSet.targeting?.age_min || 18,
            edad_max: adSet.targeting?.age_max || 65,
            genero: !adSet.targeting?.genders || adSet.targeting?.genders?.length === 2 ? 'todos' : (adSet.targeting?.genders?.[0] === 1 ? 'masculino' : 'femenino'),
            optimization_goal: adSet.optimization_goal,
            billing_event: adSet.billing_event,
            status: adSet.status || 'PAUSED',
            countries: adSet.targeting?.geo_locations?.countries || ['PE'],
            publisher_platforms: adSet.targeting?.publisher_platforms || ['facebook', 'instagram'],
            promoted_object_page_id: adSet.promoted_object?.page_id || '',
            promoted_object_pixel_id: adSet.promoted_object?.pixel_id || '',
            promoted_object_event_type: adSet.promoted_object?.custom_event_type || '',
        });
    }

    deleteAdSet(id: number) {
        if (confirm('¿Estás seguro de que deseas eliminar este conjunto de anuncios?')) {
            this.campaignsService.deleteAdSet(id).subscribe({
                next: () => {
                    this.adSets.update(list => list.filter(s => s.id_conjunto !== id));
                    toast.success('Conjunto eliminado con éxito');
                },
                error: () => toast.error('Error al eliminar el conjunto')
            });
        }
    }

    resetAdSetForm() {
        this.selectedAdSet.set(null);
        this.adSetStep.set(1);
        this.adSetForm.reset({
            presupuesto_diario: 5,
            edad_min: 18,
            edad_max: 65,
            genero: 'todos',
            optimization_goal: 'REACH',
            billing_event: 'IMPRESSIONS',
            status: 'PAUSED',
            bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
            bid_amount: null,
            countries: ['PE'],
            publisher_platforms: ['facebook', 'instagram'],
            promoted_object_page_id: '',
            promoted_object_pixel_id: '',
            promoted_object_event_type: '',
        });
    }

    // ─── Ad CRUD ──────────────────────────────────────────────
    openAdDialog(adSetId: number) {
        this.activeAdSetForAd.set(adSetId);
        this.resetAdForm();
    }

    onSubmitAd(ctx: any) {
        if (this.adForm.invalid) {
            this.adForm.markAllAsTouched();
            return;
        }

        const adData: Partial<Ad> = {
            id_conjunto: this.activeAdSetForAd()!,
            nombre: this.adForm.value.nombre!,
            tipo: this.adForm.value.tipo! as Ad['tipo'],
            titulo: this.adForm.value.titulo!,
            descripcion: this.adForm.value.descripcion || '',
            url_destino: this.adForm.value.url_destino || '',
            texto_principal: this.adForm.value.texto_principal || '',
            call_to_action: this.adForm.value.call_to_action || 'mas_informacion',
            estado: 'borrador',
        };

        if (this.selectedAd()) {
            this.campaignsService.updateAd(this.selectedAd()!.id_anuncio!, adData).subscribe({
                next: (updated) => {
                    const setId = this.activeAdSetForAd()!;
                    this.adsBySet.update(map => {
                        const newMap = new Map(map);
                        const ads = newMap.get(setId) || [];
                        newMap.set(setId, ads.map(a => a.id_anuncio === updated.id_anuncio ? updated : a));
                        return newMap;
                    });
                    toast.success('¡Anuncio actualizado con éxito!');
                    this.resetAdForm();
                    ctx.close();
                },
                error: () => toast.error('Error al actualizar el anuncio')
            });
        } else {
            this.campaignsService.createAd(adData).subscribe({
                next: (created) => {
                    const setId = this.activeAdSetForAd()!;
                    this.adsBySet.update(map => {
                        const newMap = new Map(map);
                        const ads = newMap.get(setId) || [];
                        newMap.set(setId, [...ads, created]);
                        return newMap;
                    });
                    toast.success('¡Anuncio creado con éxito!');
                    this.resetAdForm();
                    ctx.close();
                },
                error: () => toast.error('Error al crear el anuncio')
            });
        }
    }

    editAd(ad: Ad, adSetId: number) {
        this.selectedAd.set(ad);
        this.activeAdSetForAd.set(adSetId);
        this.adForm.patchValue({
            nombre: ad.nombre,
            tipo: ad.tipo,
            titulo: ad.titulo,
            descripcion: ad.descripcion || '',
            url_destino: ad.url_destino || '',
            texto_principal: ad.texto_principal || '',
            call_to_action: ad.call_to_action || 'mas_informacion',
        });
    }

    deleteAd(adId: number, adSetId: number) {
        if (confirm('¿Estás seguro de que deseas eliminar este anuncio?')) {
            this.campaignsService.deleteAd(adId).subscribe({
                next: () => {
                    this.adsBySet.update(map => {
                        const newMap = new Map(map);
                        const ads = newMap.get(adSetId) || [];
                        newMap.set(adSetId, ads.filter(a => a.id_anuncio !== adId));
                        return newMap;
                    });
                    toast.success('Anuncio eliminado con éxito');
                },
                error: () => toast.error('Error al eliminar el anuncio')
            });
        }
    }

    resetAdForm() {
        this.selectedAd.set(null);
        this.adForm.reset({ tipo: 'imagen', call_to_action: 'mas_informacion' });
    }

    // ─── Helpers ──────────────────────────────────────────────
    getStatusColor(status: string): string {
        return this.campaignsService.getStatusColor(status);
    }

    getPlatformIcon(platform: string): string {
        return this.campaignsService.getPlatformIcon(platform);
    }

    getAdTypeIcon(type: string): string {
        const icons: Record<string, string> = {
            imagen: 'lucide:image',
            video: 'lucide:video',
            carrusel: 'lucide:gallery-horizontal',
            historia: 'lucide:smartphone',
        };
        return icons[type] || 'lucide:file';
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            borrador: 'Borrador',
            activa: 'Activa',
            activo: 'Activo',
            ACTIVE: 'Activa',
            pausada: 'Pausada',
            pausado: 'Pausado',
            PAUSED: 'Pausada',
            finalizada: 'Finalizada',
            finalizado: 'Finalizado',
            rechazado: 'Rechazado',
            ARCHIVED: 'Archivado',
        };
        return labels[status] || status;
    }

    getCtaLabel(cta: string): string {
        const labels: Record<string, string> = {
            mas_informacion: 'Más Información',
            comprar: 'Comprar Ahora',
            registrarse: 'Registrarse',
            descargar: 'Descargar',
            contactar: 'Contactar',
            reservar: 'Reservar',
        };
        return labels[cta] || cta;
    }

    getObjectiveLabel(objective: string): string {
        const labels: Record<string, string> = {
            'OUTCOME_AWARENESS': 'Reconocimiento',
            'OUTCOME_TRAFFIC': 'Tráfico',
            'OUTCOME_ENGAGEMENT': 'Interacción',
            'OUTCOME_LEADS': 'Clientes Potenciales',
            'OUTCOME_SALES': 'Ventas',
            'OUTCOME_APP_PROMOTION': 'Promoción App',
        };
        return labels[objective] || objective;
    }
}
