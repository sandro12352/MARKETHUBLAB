import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCircle,
  lucideClock,
  lucidePauseCircle,
  lucideAlertCircle,
  lucideCalendar,
  lucideUsers,
  lucideTrendingUp,
  lucideDollarSign,
  lucideLoader
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan/ui/button';
import { Project } from '../../interfaces/project.interface';
import { ProjectsService } from '../../services/projects.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-projects-component',
  standalone: true,
  imports: [CommonModule, NgIcon, HlmButton, RouterLink],
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
    }),
  ],
  templateUrl: './projects-component.html',
  styleUrl: './projects-component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProjectsComponent implements OnInit {
  private projectsService = inject(ProjectsService);

  projects = signal<Project[]>([]);
  filteredProjects = signal<Project[]>([]);
  searchTerm = signal('');
  statusFilter = signal('all');
  statusOptions = ['all', 'active', 'completed', 'on-hold', 'planning'];

  ngOnInit() {
    this.projectsService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        // Calcula el progreso para cada proyecto
        const projectsWithProgress = projects.map(project => ({
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

  filterProjects() {
    const projects = this.projects();
    const searchTerm = this.searchTerm();
    const statusFilter = this.statusFilter();

    this.filteredProjects.set(
      projects.filter((project) => {
        const matchesSearch =
          project.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.cliente.nombres?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' || project.estado === statusFilter;

        return matchesSearch && matchesStatus;
      })
    );
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

  getStatusIcon(status: Project['estado']): string {
  const icons: Record<Project['estado'], string> = {
    activo: 'lucidePlay',           // En ejecución
    completado: 'lucideCheckCircle', // Completado
    en_progreso: 'lucideLoader',     // Cargando/En progreso
    planificacion: 'lucideCalendar', // Calendario/Planificación
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
