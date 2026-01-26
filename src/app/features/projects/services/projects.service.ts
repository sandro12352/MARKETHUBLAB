import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Project } from '../interfaces/project.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {


  private http = inject(HttpClient);

  private projects: Project[] = [];

  projectsSignal = signal<Project[]>(this.projects);

  constructor() {}

  getAllProjects():Observable<Project[]> {
    return this.http.get<Project[]>(`${environment.apiUrl}/projects`);
  }

  getProjectsByClient(clientName: string) {
    
  }

  getProjectsCount() {
    return this.projectsSignal().length;
  }

  getStatusColor(status: Project['estado']): string {
    const colors: Record<Project['estado'], string> = {
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'on-hold': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      planning: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    };
    return colors[status];
  }

  getPriorityIcon(priority: Project['prioridad']): string {
    const icons: Record<Project['prioridad'], string> = {
      high: 'alertCircle',
      medium: 'minus',
      low: 'chevronDown',
    };
    return icons[priority];
  }
}
