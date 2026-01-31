import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Project } from '../interfaces/project.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {


  private http = inject(HttpClient);
  constructor() { }

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${environment.apiUrl}/api/projects`);
  }

  getProjectsByClient(clientName: string) {

  }

  getStatusColor(status: Project['estado']): string {
    const colors: Record<Project['estado'], string> = {
      activo: 'bg-green-500/20 text-green-300 border-green-500/30',
      completado: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      en_progreso: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      planificacion: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    };
    return colors[status];
  }

}
