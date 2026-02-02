import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsService } from '../../services/projects.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Project } from '../../interfaces/project.interface';
import { HlmButtonImports } from '@spartan/ui/button';
import { HlmDropdownMenuImports } from '@spartan/ui/dropdown-menu';

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
  imports: [
    CommonModule, 
    RouterModule, 
    HlmButtonImports,
    HlmDropdownMenuImports,
  ],
  templateUrl: './details-project-component.html',
  styleUrl: './details-project-component.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class DetailsProjectComponent {
  protected projectService = inject(ProjectsService);
  route: ActivatedRoute = inject(ActivatedRoute);
  proyect = signal<Project | null>(null);
  
  ngOnInit(): void {
    const id_proyecto = this.route.snapshot.params['id_proyecto'];
    this.projectService.geProjectByIdProject(id_proyecto).subscribe(proyect => {
       this.proyect.set(proyect)
       console.log(proyect)
    });
  }

  projectFolders: ProjectFolder[] = [
    {
      id: 1,
      nombre: 'Documentación',
      descripcion: 'Documentos del proyecto',
      archivos: 12,
      fecha_creacion: new Date('2024-01-15'),
      icono: 'lucide:file-text'
    },
    {
      id: 2,
      nombre: 'Diseños',
      descripcion: 'Diseños y mockups',
      archivos: 8,
      fecha_creacion: new Date('2024-01-16'),
      icono: 'lucide:palette'
    },
    {
      id: 3,
      nombre: 'Código',
      descripcion: 'Código fuente del proyecto',
      archivos: 45,
      fecha_creacion: new Date('2024-01-17'),
      icono: 'lucide:code'
    },
    {
      id: 4,
      nombre: 'Recursos',
      descripcion: 'Imágenes y recursos multimedia',
      archivos: 23,
      fecha_creacion: new Date('2024-01-18'),
      icono: 'lucide:image'
    },
    {
      id: 5,
      nombre: 'Pruebas',
      descripcion: 'Reportes de pruebas y QA',
      archivos: 15,
      fecha_creacion: new Date('2024-01-19'),
      icono: 'lucide:check-circle'
    },
    {
      id: 6,
      nombre: 'Entregas',
      descripcion: 'Archivos de entrega final',
      archivos: 5,
      fecha_creacion: new Date('2024-01-20'),
      icono: 'lucide:package'
    }
  ];

  getProgressColor(): string {
    if (!this.proyect) return 'bg-indigo-500';
    const progress = this.proyect()!.progress;
    if (progress < 33) return 'bg-red-500';
    if (progress < 66) return 'bg-yellow-500';
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

}
