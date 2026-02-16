import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { Campaign } from '../../interfaces/campaign.interface';

@Component({
    selector: 'app-campaigns',
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
    templateUrl: './campaigns-component.html',
    styleUrl: './campaigns-component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CampaignsComponent implements OnInit {
    private campaignsService = inject(CampaignsService);
    private fb = inject(FormBuilder);

    campaigns = signal<Campaign[]>([]);
    filteredCampaigns = signal<Campaign[]>([]);
    searchTerm = signal('');
    activeFilter = signal<string>('todas');
    isLoading = signal(true);

    campaignForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        objetivo: ['', [Validators.required]],
        plataforma: ['', [Validators.required]],
        presupuesto_total: [0, [Validators.required, Validators.min(1)]],
        fecha_inicio: ['', [Validators.required]],
        fecha_fin: ['', [Validators.required]],
    });

    selectedCampaign = signal<Campaign | null>(null);

    ngOnInit(): void {
        this.loadCampaigns();
    }

    loadCampaigns() {
        this.isLoading.set(true);
        this.campaignsService.getAllCampaigns().subscribe({
            next: (campaigns) => {
                this.campaigns.set(campaigns);
                this.applyFilters();
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                toast.error('Error al cargar las campañas');
            }
        });
    }

    applyFilters() {
        let filtered = [...this.campaigns()];

        if (this.activeFilter() !== 'todas') {
            filtered = filtered.filter(c => c.status === this.activeFilter());
        }

        if (this.searchTerm()) {
            const term = this.searchTerm().toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.plataforma.toLowerCase().includes(term) ||
                c.objective.toLowerCase().includes(term)
            );
        }

        this.filteredCampaigns.set(filtered);
    }

    onSearch(event: Event) {
        this.searchTerm.set((event.target as HTMLInputElement).value);
        this.applyFilters();
    }

    setFilter(filter: string) {
        this.activeFilter.set(filter);
        this.applyFilters();
    }

    onSubmitCampaign(ctx: any) {
        console.log(this.campaignForm.get('objetivo')?.value);

        if (this.campaignForm.invalid) {
            this.campaignForm.markAllAsTouched();
            return;
        }

        const campaignData: Partial<Campaign> = {
            name: this.campaignForm.value.nombre!,
            objective: this.campaignForm.value.objetivo!,
            plataforma: this.campaignForm.value.plataforma!,
            presupuesto_total: this.campaignForm.value.presupuesto_total!,
            fecha_inicio: this.campaignForm.value.fecha_inicio!,
            fecha_fin: this.campaignForm.value.fecha_fin!,
            status: 'PAUSED',
        };

        if (this.selectedCampaign()) {
            this.campaignsService.updateCampaign(this.selectedCampaign()!.id_campana!, campaignData).subscribe({
                next: (updated) => {
                    this.campaigns.update(list => list.map(c => c.id_campana === updated.id_campana ? updated : c));
                    this.applyFilters();
                    toast.success('¡Campaña actualizada con éxito!');
                    this.resetForm();
                    ctx.close();
                },
                error: (error) => toast.error(error.error.message)
            });
        } else {
            this.campaignsService.createCampaign(campaignData).subscribe({
                next: (created) => {
                    this.campaigns.update(list => [...list, created]);
                    this.applyFilters();
                    toast.success('¡Campaña creada con éxito!');
                    this.resetForm();
                    ctx.close();
                },
                error: () => toast.error('Error al crear la campaña')
            });
        }
    }

    editCampaign(campaign: Campaign) {
        this.selectedCampaign.set(campaign);
        this.campaignForm.patchValue({
            nombre: campaign.name,
            objetivo: campaign.objective,
            plataforma: campaign.plataforma,
            presupuesto_total: campaign.presupuesto_total,
            fecha_inicio: campaign.fecha_inicio,
            fecha_fin: campaign.fecha_fin,
        });
    }

    deleteCampaign(id: number) {
        if (confirm('¿Estás seguro de que deseas eliminar esta campaña?')) {
            this.campaignsService.deleteCampaign(id).subscribe({
                next: () => {
                    this.campaigns.update(list => list.filter(c => c.id_campana !== id));
                    this.applyFilters();
                    toast.success('Campaña eliminada con éxito');
                },
                error: () => toast.error('Error al eliminar la campaña')
            });
        }
    }

    resetForm() {
        this.selectedCampaign.set(null);
        this.campaignForm.reset({ presupuesto_total: 0 });
    }

    getStatusColor(status: string): string {
        return this.campaignsService.getStatusColor(status);
    }

    getPlatformIcon(platform: string): string {
        return this.campaignsService.getPlatformIcon(platform);
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            borrador: 'Borrador',
            activa: 'Activa',
            pausada: 'Pausada',
            finalizada: 'Finalizada',
        };
        return labels[status] || status;
    }

    getCampaignStats() {
        const all = this.campaigns();
        return {
            total: all.length,
            activas: all.filter(c => c.status === 'ACTIVE').length,
            pausadas: all.filter(c => c.status === 'PAUSED').length,
            presupuesto: all.reduce((sum, c) => sum + c.presupuesto_total, 0),
        };
    }
}
