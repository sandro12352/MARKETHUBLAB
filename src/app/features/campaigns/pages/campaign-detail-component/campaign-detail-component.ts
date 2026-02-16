import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
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
        segmentacion: ['', [Validators.required]],
        presupuesto_diario: [0, [Validators.required, Validators.min(1)]],
        ubicacion: [''],
        edad_min: [18],
        edad_max: [65],
        genero: ['todos'],
    });
    selectedAdSet = signal<AdSet | null>(null);

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

    ngOnInit(): void {
        const id = this.route.snapshot.params['id_campana'];
        this.loadCampaignData(Number(id));
    }

    loadCampaignData(id: number) {
        this.isLoading.set(true);
        this.campaignsService.getCampaignById(id).subscribe({
            next: (campaign) => {
                this.campaign.set(campaign);
                this.loadAdSets(id);
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
    onSubmitAdSet(ctx: any) {
        if (this.adSetForm.invalid) {
            this.adSetForm.markAllAsTouched();
            return;
        }

        const adSetData: Partial<AdSet> = {
            id_campana: this.campaign()?.id_campana!,
            nombre: this.adSetForm.value.nombre!,
            segmentacion: this.adSetForm.value.segmentacion!,
            presupuesto_diario: this.adSetForm.value.presupuesto_diario!,
            ubicacion: this.adSetForm.value.ubicacion || '',
            edad_min: this.adSetForm.value.edad_min || 18,
            edad_max: this.adSetForm.value.edad_max || 65,
            genero: this.adSetForm.value.genero || 'todos',
            estado: 'borrador',
        };

        if (this.selectedAdSet()) {
            this.campaignsService.updateAdSet(this.selectedAdSet()!.id_conjunto!, adSetData).subscribe({
                next: (updated) => {
                    this.adSets.update(list => list.map(s => s.id_conjunto === updated.id_conjunto ? updated : s));
                    toast.success('¡Conjunto actualizado con éxito!');
                    this.resetAdSetForm();
                    ctx.close();
                },
                error: () => toast.error('Error al actualizar el conjunto')
            });
        } else {
            this.campaignsService.createAdSet(adSetData).subscribe({
                next: (created) => {
                    this.adSets.update(list => [...list, created]);
                    toast.success('¡Conjunto de anuncios creado con éxito!');
                    this.resetAdSetForm();
                    ctx.close();
                },
                error: () => toast.error('Error al crear el conjunto')
            });
        }
    }

    editAdSet(adSet: AdSet) {
        this.selectedAdSet.set(adSet);
        this.adSetForm.patchValue({
            nombre: adSet.nombre,
            segmentacion: adSet.segmentacion,
            presupuesto_diario: adSet.presupuesto_diario,
            ubicacion: adSet.ubicacion || '',
            edad_min: adSet.edad_min || 18,
            edad_max: adSet.edad_max || 65,
            genero: adSet.genero || 'todos',
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
        this.adSetForm.reset({ presupuesto_diario: 0, edad_min: 18, edad_max: 65, genero: 'todos' });
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
            pausada: 'Pausada',
            pausado: 'Pausado',
            finalizada: 'Finalizada',
            finalizado: 'Finalizado',
            rechazado: 'Rechazado',
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
}
