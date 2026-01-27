import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
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
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan/ui/button';
import { Project } from '../../interfaces/project.interface';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-projects-component',
  standalone: true,
  imports: [CommonModule, NgIcon, HlmButton],
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
    }),
  ],
  templateUrl: './projects-component.html',
  styleUrl: './projects-component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProjectsComponent implements OnInit {
  private projectsService = inject(ProjectsService);

  projects: Project[] = [];
  filteredProjects: Project[] = [];
  searchTerm = '';
  statusFilter = 'all';

  statusOptions = ['all', 'active', 'completed', 'on-hold', 'planning'];

  ngOnInit() {
    this.projectsService.getAllProjects().subscribe((projects) => {
      this.projects = projects;
      this.filteredProjects = this.projects;
    });
  }

  filterProjects() {
    this.filteredProjects = this.projects.filter((project) => {
      const matchesSearch =
        project.nombre?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.descripcion?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.cliente.nombres?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        this.statusFilter === 'all' || project.estado === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.filterProjects();
  }

  onStatusChange(event: any) {
    this.statusFilter = event.target.value;
    this.filterProjects();
  }

  getStatusIcon(status: Project['estado']): string {
    const icons: Record<Project['estado'], string> = {
      activop: 'lucideTrendingUp',
      completado: 'lucideCheckCircle',
      en_progreso: 'lucidePauseCircle',
      planificacion: 'lucideClock',
    };
    return icons[status];
  }

  getStatusLabel(status: Project['estado']): string {
    const labels: Record<Project['estado'], string> = {
      active: 'Activo',
      completed: 'Completado',
      'on-hold': 'En pausa',
      planning: 'Planificación',
    };
    return labels[status];
  }

  getStatusColor(status: Project['estado']): string {
    return this.projectsService.getStatusColor(status);
  }

  getPriorityColor(priority: Project['prioridad']): string {
    const colors: Record<Project['prioridad'], string> = {
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-300 border-green-500/30',
    };
    return colors[priority];
  }

  getPriorityLabel(priority: Project['prioridad']): string {
    const labels: Record<Project['prioridad'], string> = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
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
