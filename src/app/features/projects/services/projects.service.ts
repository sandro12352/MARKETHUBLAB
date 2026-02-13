import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Project } from '../interfaces/project.interface';
import { from, Observable } from 'rxjs';
import { ProjectResponse } from '../interfaces/projects-response.interface';
import { Folder } from '../interfaces/folder.interface';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {


  private http = inject(HttpClient);
  constructor() { }

  getAllProjects(): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${environment.apiUrl}/api/projects`);
  }

  getProjectsByClient(clientName: string) {

  }

  geProjectByIdProject(id_proyecto: number): Observable<Project> {
    return this.http.get<Project>(`${environment.apiUrl}/api/projects/${id_proyecto}`);
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


  createProject(project: Project, plan_grabacion: File): Observable<Project> {
    const formData = new FormData();

    Object.keys(project).forEach(key => {
      const value = project[key as keyof Project];

      // Importante: FormData solo acepta strings o Blobs
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    formData.append('plan_grabacion', plan_grabacion);

    return this.http.post<Project>(`${environment.apiUrl}/api/projects`, formData);
  }


  getFoldersByProject(id_proyecto: number): Observable<Folder[]> {
    return this.http.get<Folder[]>(`${environment.apiUrl}/api/projects/${id_proyecto}/folders`);
  }

  createFolder(folder: Folder): Observable<Folder> {
    return this.http.post<Folder>(`${environment.apiUrl}/api/folder-material`, folder);
  }

  updateFolder(id_carpeta_material: number, folder: Partial<Folder>): Observable<Folder> {
    return this.http.put<Folder>(`${environment.apiUrl}/api/folder-material/${id_carpeta_material}`, folder);
  }

  deleteFolder(id_carpeta_material: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/folder-material/${id_carpeta_material}`);
  }

}
