import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@spartan/ui/icon';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmAlertDialogImports } from '@spartan/ui/alert-dialog';
import { HlmTextareaImports } from '@spartan/ui/textarea';
import { HlmLabelImports } from '@spartan/ui/label';
import { HlmInputImports } from '@spartan/ui/input';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan/ui/select';
import { HlmCalendarImports } from '@spartan/ui/calendar';
import { toast } from 'ngx-sonner';
import { HlmToasterImports } from '@spartan/ui/sonner';




import {
  lucideCheckCircle,
  lucideClock,
  lucidePauseCircle,
  lucideAlertCircle,
  lucideCalendar,
  lucideUsers,
  lucideTrendingUp,
  lucideDollarSign,
  lucideLoader,
  lucideFileTerminal
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan/ui/button';
import { Project } from '../../interfaces/project.interface';
import { ProjectsService } from '../../services/projects.service';
import { RouterLink } from "@angular/router";
import { Client } from '../../../clients/interface/client.interface';
import { ClientsService } from '../../../clients/services/clients.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-projects-component',
  standalone: true,
  imports: [CommonModule, NgIcon, HlmButton, RouterLink, HlmIcon, BrnAlertDialogImports, HlmAlertDialogImports, HlmTextareaImports, HlmLabelImports, HlmInputImports, BrnSelectImports, HlmSelectImports, HlmCalendarImports, ReactiveFormsModule, HlmToasterImports],
  providers: [
    provideIcons({
      lucideCheckCircle,
      lucideClock,
      lucidePauseCircle,
      lucideAlertCircle,
      lucideCalendar,
      lucideUsers,
      lucideTrendingUp,
      lucideDollarSign,
      lucideLoader,
      lucideFileTerminal
    }),
  ],
  templateUrl: './projects-component.html',
  styleUrl: './projects-component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProjectsComponent implements OnInit {

  private fromBuilder = inject(FormBuilder);
  private projectsService = inject(ProjectsService);
  private clientService = inject(ClientsService);

  projects = signal<Project[]>([]);
  clients = signal<Client[]>([]);
  filteredProjects = signal<Project[]>([]);
  searchTerm = signal('');
  statusFilter = signal('all');
  statusOptions = ['all', 'active', 'completed', 'on-hold', 'planning'];
  isDragging = false;
  fileName: string = '';
  fileToUpload: File | null = null;


  projectForm = this.fromBuilder.group({
    // Nota: El valor inicial va primero, luego el objeto de configuración
    nombre: ['', [Validators.required]],
    id_cliente: ['', { nonNullable: true, validators: [Validators.required] }], // Corregido 'validatos'
    cantidad_contenido: ['', { nonNullable: true, validators: [Validators.required] }],
    estado: ['', { nonNullable: true, validators: [Validators.required] }],
    prioridad: ['', { nonNullable: true, validators: [Validators.required] }],
    fecha_inicio: ['', { nonNullable: true, validators: [Validators.required] }],
    fecha_termino: ['', { nonNullable: true, validators: [Validators.required] }],
    descripcion: [''], // Este puede ser nullable si no le pones nonNullable
  });

  ngOnInit() {
    this.getClients();

    this.getProjects();

  }


  get nombre() { return this.projectForm.get('nombre'); }
  get id_cliente() { return this.projectForm.get('id_cliente'); }
  get cantidad_contenido() { return this.projectForm.get('cantidad_contenido'); }
  get estado() { return this.projectForm.get('estado'); }
  get prioridad() { return this.projectForm.get('prioridad'); }
  get fecha_inicio() { return this.projectForm.get('fecha_inicio'); }
  get fecha_termino() { return this.projectForm.get('fecha_termino'); }
  get plan_grabacion() { return this.projectForm.get('plan_grabacion'); }
  get descripcion() { return this.projectForm.get('descripcion'); }




  filterProjects() {
    const projects = this.projects();
    const searchTerm = this.searchTerm();
    const statusFilter = this.statusFilter();

    this.filteredProjects.set(
      projects.filter((project) => {
        const matchesSearch =
          project.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.cliente?.nombres?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' || project.estado === statusFilter;

        return matchesSearch && matchesStatus;
      })
    );
  }

  getClients() {
    this.clientService.getClients().subscribe({
      next: (clients: Client[]) => {
        this.clients.set(clients);
      }
    })
  }

  getProjects() {
    this.projectsService.getAllProjects().subscribe({
      next: (data) => {
        this.projects.set(data.projects);
        // Calcula el progreso para cada proyecto
        const projectsWithProgress = data.projects.map(project => ({
          ...project,
          progress: this.calculateProgress(project)
        }));
        this.projects.set(projectsWithProgress);
        this.filterProjects();
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
      }
    });
  }


  onSubmmit(ctx: any) {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return
    }

    const formValue = this.projectForm.getRawValue();
    console.log(formValue)
    const projectData: Project = {
      ...formValue,
      id_cliente: Number(this.id_cliente?.value),
      nombre: this.nombre?.value!,
      cantidad_material: Number(this.cantidad_contenido?.value),
      estado: this.estado?.value!,
      prioridad: this.prioridad?.value!,
      fecha_registro: new Date(this.fecha_inicio?.value!),
      fecha_termino: new Date(this.fecha_termino?.value!),
    };
    console.log(projectData);


    this.projectsService.createProject(projectData, this.fileToUpload!).subscribe({
      next: (project) => {
        toast.success('¡Proyecto creado con éxito!');
        this.getProjects();
        this.projectForm.reset();
        this.fileName = '';
        this.fileToUpload = null;
        ctx.close();
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Hubo un error al registrar el proyecto';
        toast.error(errorMsg);
      }
    })



  }


  deleteProject(id_proyecto: number) {

  }

  // 1. Cuando seleccionan el archivo mediante el explorador (clic)
  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.handleFile(file);
  }

  // 2. Cuando sueltan el archivo encima (drag & drop)
  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  // 3. Función común para procesar el archivo
  private handleFile(file: File) {
    this.fileName = file.name;
    this.fileToUpload = file;
    console.log('Archivo listo para subir:', file);
    // Aquí puedes asignar el archivo a tu formulario
  }


  // Calcula el progreso basado en el estado
  calculateProgress(project: Project): number {
    const progressMap: Record<Project['estado'], number> = {
      planificacion: 0,
      en_progreso: 50,
      activo: 75,
      completado: 100,
    };
    return progressMap[project.estado] || 0;
  }

  onSearchChange(event: any) {
    this.searchTerm.set(event.target.value);
    this.filterProjects();
  }

  onStatusChange(event: any) {
    this.statusFilter.set(event.target.value);
    this.filterProjects();
  }

  onStatusFilterChange(value: string) {
    this.statusFilter.set(value);
    this.filterProjects();
  }

  getStatusIcon(status: Project['estado']): string {
    const icons: Record<Project['estado'], string> = {
      activo: 'lucide:play',           // En ejecución
      completado: 'lucide:check-circle', // Completado
      en_progreso: 'lucide:loader',     // Cargando/En progreso
      planificacion: 'lucide:calendar', // Calendario/Planificación
    };
    return icons[status];
  }

  getStatusLabel(status: Project['estado']): string {
    const labels: Record<Project['estado'], string> = {
      activo: 'Activo',
      completado: 'Completado',
      en_progreso: 'En Progreso',
      planificacion: 'Planificación',
    };
    return labels[status];
  }

  getStatusColor(status: Project['estado']): string {
    return this.projectsService.getStatusColor(status);
  }

  getPriorityColor(priority: Project['prioridad']): string {
    const colors: Record<Project['prioridad'], string> = {
      alta: 'bg-red-500/20 text-red-300 border-red-500/30',
      media: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      baja: 'bg-green-500/20 text-green-300 border-green-500/30',
    };
    return colors[priority];
  }

  getPriorityLabel(priority: Project['prioridad']): string {
    const labels: Record<Project['prioridad'], string> = {
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja',
    };
    return labels[priority];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  daysRemaining(endDate?: Date): string {
    if (!endDate) return '';
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Finalizado';
    return `${diff} días`;
  }
}
