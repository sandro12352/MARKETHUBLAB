import { Component, inject, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan/ui/select';
import { ContractService } from '../../services/contract.service';
import { ClientsService } from '../../../clients/services/clients.service';
import { AuthService } from '../../../auth/services/auth-service';
import { Contrato } from '../../interfaces/contract.interface';
import { Client } from '../../../clients/interface/client.interface';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';
import { HlmToasterImports } from '@spartan/ui/sonner';

@Component({
  selector: 'app-contracts-component',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmToasterImports, BrnSelectImports, HlmSelectImports],
  templateUrl: './contracts-component.html',
  styleUrl: './contracts-component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ContractsComponent implements OnInit {
  private contractService = inject(ContractService);
  private clientsService = inject(ClientsService);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  // States
  contratos = signal<Contrato[]>([]);
  clientes = signal<Client[]>([]);
  loading = signal<boolean>(false);
  isUploading = signal<boolean>(false);

  // Computeds
  contratosFirmadosCount = computed(() => this.contratos().filter(c => !!c.firma_url).length);
  contratosPendientesCount = computed(() => this.contratos().filter(c => !c.firma_url).length);

  // Form State
  selectedClientId = signal<number | null>(null);
  contratoFile: File | null = null;
  planFile: File | null = null;

  // Upload Panel
  showUploadPanel = signal<boolean>(false);

  // Observation Modal State
  selectedObservation = signal<string | null>(null);

  // Inline PDF Viewer State
  selectedPdfUrl = signal<string | null>(null);
  selectedPdfType = signal<'contrato' | 'plan' | 'firma'>('contrato');
  selectedPdfContrato = signal<Contrato | null>(null);

  // Sanitized URL for iframe
  sanitizedPdfUrl = computed<SafeResourceUrl>(() => {
    const url = this.selectedPdfUrl();
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const token = this.authService.getToken();
    if (!token) return;

    this.loading.set(true);

    // Load Clients
    this.clientsService.getClients().subscribe({
      next: (data) => {
        console.log(data)
        this.clientes.set(data)

      },
      error: (err) => console.error('Error loading clients', err)
    });

    // Load Contracts
    this.contractService.getContratos(token)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          console.log(data)
          this.contratos.set(data)

        },
        error: (err) => console.error('Error loading contracts', err)
      });
  }

  onFileSelected(event: any, type: 'contrato' | 'plan') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'contrato') {
        this.contratoFile = file;
      } else {
        this.planFile = file;
      }
    }
  }

  uploadFiles() {
    const token = this.authService.getToken();
    const idCliente = this.selectedClientId();

    if (!idCliente || !this.contratoFile || !this.planFile || !token) {
      toast.error('Por favor, completa todos los campos y selecciona ambos archivos.');
      return;
    }

    this.isUploading.set(true);
    this.contractService.subirContratoYPlan(idCliente, this.contratoFile, this.planFile, token)
      .pipe(finalize(() => this.isUploading.set(false)))
      .subscribe({
        next: (newContract) => {
          toast.success('Documentos subidos con éxito.');
          this.loadData();
          this.resetForm();
          this.showUploadPanel.set(false);
        },
        error: (err) => {
          console.error('Upload error', err);
          toast.error('Error al subir los documentos.');
        }
      });
  }

  onClientSelect(value: any) {
    this.selectedClientId.set(Number(value));
  }

  resetForm() {
    this.selectedClientId.set(null);
    this.contratoFile = null;
    this.planFile = null;
  }

  // ── Observation Modal ──
  openObservationModal(observation: string) {
    this.selectedObservation.set(observation);
  }

  closeObservationModal() {
    this.selectedObservation.set(null);
  }

  // ── Inline PDF Viewer ──
  openPdfInline(url: string, type: 'contrato' | 'plan' | 'firma', contrato: Contrato) {
    this.selectedPdfUrl.set(url);
    this.selectedPdfType.set(type);
    this.selectedPdfContrato.set(contrato);
  }

  closePdfViewer() {
    this.selectedPdfUrl.set(null);
    this.selectedPdfType.set('contrato');
    this.selectedPdfContrato.set(null);
  }
}
