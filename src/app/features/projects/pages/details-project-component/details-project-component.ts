import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsService } from '../../services/projects.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Project } from '../../interfaces/project.interface';
import { HlmButtonImports } from '@spartan/ui/button';
import { HlmDropdownMenuImports } from '@spartan/ui/dropdown-menu';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmAlertDialogImports } from '@spartan/ui/alert-dialog';
import { HlmInputImports } from '@spartan/ui/input';
import { HlmLabelImports } from '@spartan/ui/label';
import { HlmTextareaImports } from '@spartan/ui/textarea';
import { toast } from 'ngx-sonner';
import { HlmToasterImports } from '@spartan/ui/sonner';
import { Folder } from '../../interfaces/folder.interface';
import { PlanGrabacion, Escena } from '../../interfaces/plan-grabacion.interface';

interface ProjectFolder {
  id: number;
  nombre: string;
  descripcion: string;
  archivos: number;
  fecha_creacion: Date;
  icono: string;
}

@Component({
  selector: 'app-details-project-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmButtonImports,
    HlmDropdownMenuImports,
    ReactiveFormsModule,
    BrnAlertDialogImports,
    HlmAlertDialogImports,
    HlmInputImports,
    HlmLabelImports,
    HlmTextareaImports,
    HlmToasterImports
  ],
  templateUrl: './details-project-component.html',
  styleUrl: './details-project-component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DetailsProjectComponent implements OnInit {
  protected projectService = inject(ProjectsService);
  private fb = inject(FormBuilder);
  route: ActivatedRoute = inject(ActivatedRoute);
  proyect = signal<Project | null>(null);

  folderForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    icono: ['lucide:folder']
  });

  projectFolders = signal<Folder[]>([]);

  // ── Plan de Grabación ──
  planGrabacion = signal<PlanGrabacion | null>(null);
  loadingPlan = signal<boolean>(false);
  savingPlan = signal<boolean>(false);
  showPlanModal = signal<boolean>(false);

  planForm = this.fb.group({
    observacion_cliente: [''],
    escenas: this.fb.array([])
  });

  get escenasFormArray(): FormArray {
    return this.planForm.get('escenas') as FormArray;
  }

  ngOnInit(): void {
    const id_proyecto = this.route.snapshot.params['id_proyecto'];
    this.projectService.geProjectByIdProject(id_proyecto).subscribe(proyect => {
      this.proyect.set(proyect);
    });
    this.getProjectFolders(Number(id_proyecto));
    this.loadPlanGrabacion(Number(id_proyecto));
  }

  selectedFolder = signal<Folder | null>(null);

  onSubmitFolder(ctx: any) {
    if (this.folderForm.invalid) {
      this.folderForm.markAllAsTouched();
      return;
    }

    const folderData: Partial<Folder> = {
      id_proyecto: this.proyect()?.id_proyecto!,
      nombre: this.folderForm.value.nombre!,
      descripcion: this.folderForm.value.descripcion!,
      icono: this.folderForm.value.icono || 'lucide:folder'
    };

    if (this.selectedFolder()) {
      // Update
      this.projectService.updateFolder(this.selectedFolder()?.id_carpeta_material!, folderData as Folder).subscribe(updatedFolder => {
        this.projectFolders.update(folders =>
          folders.map(f => f.id_carpeta_material === updatedFolder.id_carpeta_material ? updatedFolder : f)
        );
        toast.success('¡Carpeta actualizada con éxito!');
        this.resetFolderForm();
        ctx.close();
      });
    } else {
      // Create
      this.projectService.createFolder(folderData as Folder).subscribe(folder => {
        this.projectFolders.update(folders => [...folders, folder]);
        toast.success('¡Carpeta creada con éxito!');
        this.resetFolderForm();
        ctx.close();
      });
    }
  }

  editFolder(folder: Folder) {
    this.selectedFolder.set(folder);
    this.folderForm.patchValue({
      nombre: folder.nombre,
      icono: folder.icono
    });
  }

  deleteFolder(id_carpeta: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta carpeta?')) {
      this.projectService.deleteFolder(id_carpeta).subscribe({
        next: () => {
          this.projectFolders.update(folders => folders.filter(f => f.id_carpeta_material !== id_carpeta));
          toast.success('Carpeta eliminada con éxito');
        },
        error: () => toast.error('Error al eliminar la carpeta')
      });
    }
  }

  resetFolderForm() {
    this.selectedFolder.set(null);
    this.folderForm.reset({ icono: 'lucide:folder' });
  }

  getProgressColor(): string {
    if (!this.proyect) return 'bg-indigo-500';
    const progress = this.proyect()!.progress;
    if (progress! < 33) return 'bg-red-500';
    if (progress! < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getStatusColor(): string {
    if (!this.proyect) return 'bg-gray-500';
    switch (this.proyect()?.estado.toLowerCase()) {
      case 'activo':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'planificacion':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'en_progreso':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completado':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  getPriorityColor(): string {
    if (!this.proyect) return 'bg-gray-500';
    switch (this.proyect()?.prioridad.toLowerCase()) {
      case 'alta':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'media':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'baja':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }


  getProjectFolders(id_proyecto: number) {
    this.projectService.getFoldersByProject(id_proyecto).subscribe(folders => {
      this.projectFolders.set(folders);
    });
  }

  calculateDuration(): number {
    if (!this.proyect() || !this.proyect()!.fecha_registro || !this.proyect()!.fecha_termino) return 0;
    const start = new Date(this.proyect()!.fecha_registro!);
    const end = new Date(this.proyect()!.fecha_termino!);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // ══════════════════════════════════════════════════════════════
  // PLAN DE GRABACIÓN
  // ══════════════════════════════════════════════════════════════

  loadPlanGrabacion(id_proyecto: number) {
    this.loadingPlan.set(true);
    this.projectService.getPlanByProject(id_proyecto).subscribe({
      next: (plan) => {
        this.planGrabacion.set(plan);
        this.loadingPlan.set(false);
      },
      error: () => {
        this.planGrabacion.set(null);
        this.loadingPlan.set(false);
      }
    });
  }

  openPlanModal() {
    this.showPlanModal.set(true);
    this.planForm.reset();
    this.escenasFormArray.clear();

    const existingPlan = this.planGrabacion();
    if (existingPlan) {
      this.planForm.patchValue({
        observacion_cliente: existingPlan.observacion_cliente || ''
      });
      existingPlan.escenas?.forEach(escena => {
        this.addEscenaForm(escena);
      });
    } else {
      // Start with one empty scene
      this.addEscenaForm();
    }
  }

  closePlanModal() {
    this.showPlanModal.set(false);
  }

  createEscenaGroup(escena?: Partial<Escena>): FormGroup {
    return this.fb.group({
      id_escena: [escena?.id_escena || null],
      tema: [escena?.tema || '', Validators.required],
      valor_plano: [escena?.valor_plano || '', Validators.required],
      movimiento_camara: [escena?.movimiento_camara || '', Validators.required],
      requerimientos: [escena?.requerimientos || ''],
      speech: [escena?.speech || '', Validators.required],
      nota: [escena?.nota || ''],
      referencia: [escena?.referencia || '']
    });
  }

  addEscenaForm(escena?: Partial<Escena>) {
    this.escenasFormArray.push(this.createEscenaGroup(escena));
  }

  removeEscenaForm(index: number) {
    if (this.escenasFormArray.length > 1) {
      this.escenasFormArray.removeAt(index);
    }
  }

  onSubmitPlan() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      toast.error('Completa todos los campos requeridos de las escenas.');
      return;
    }

    this.savingPlan.set(true);

    const escenasData: Partial<Escena>[] = this.escenasFormArray.value.map((e: any) => ({
      ...(e.id_escena ? { id_escena: e.id_escena } : {}),
      tema: e.tema,
      valor_plano: e.valor_plano,
      movimiento_camara: e.movimiento_camara,
      requerimientos: e.requerimientos || undefined,
      speech: e.speech,
      nota: e.nota || undefined,
      referencia: e.referencia || undefined
    }));

    const existingPlan = this.planGrabacion();

    if (existingPlan) {
      // Update
      this.projectService.updatePlan(existingPlan.id_plan_grabacion!, {
        observacion_cliente: this.planForm.value.observacion_cliente || undefined,
        escenas: escenasData as Escena[]
      }).subscribe({
        next: (updated) => {
          this.planGrabacion.set(updated.planGrabacion);
          this.savingPlan.set(false);
          this.closePlanModal();
          toast.success(updated.message);
        },
        error: () => {
          this.savingPlan.set(false);
          toast.error('Error al actualizar el plan.');
        }
      });
    } else {
      // Create
      this.projectService.createPlan({
        id_proyecto: this.proyect()!.id_proyecto!,
        estado: 'pendiente',
        observacion_cliente: this.planForm.value.observacion_cliente || undefined,
        escenas: escenasData as Escena[]
      }).subscribe({
        next: (created) => {
          this.planGrabacion.set(created.planGrabacion);
          this.savingPlan.set(false);
          this.closePlanModal();
          toast.success(created.message);
        },
        error: () => {
          this.savingPlan.set(false);
          toast.error('Error al crear el plan.');
        }
      });
    }
  }

  getPlanStatusColor(): string {
    switch (this.planGrabacion()?.estado) {
      case 'pendiente':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'en_progreso':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'aprobado':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rechazado':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
    }
  }

  getPlanStatusLabel(): string {
    switch (this.planGrabacion()?.estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_progreso': return 'En Progreso';
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      default: return 'Sin Estado';
    }
  }

  // Track expanded scene in existing plan view
  expandedEscena = signal<number | null>(null);

  toggleEscenaExpand(index: number) {
    this.expandedEscena.update(v => v === index ? null : index);
  }
}
