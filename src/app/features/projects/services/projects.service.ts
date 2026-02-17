import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Project } from '../interfaces/project.interface';
import { from, Observable } from 'rxjs';
import { ProjectResponse } from '../interfaces/projects-response.interface';
import { Folder } from '../interfaces/folder.interface';
import { FolderContent } from '../interfaces/folder-content.interface';
import { AuthService } from '../../auth/services/auth-service';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {


  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private autToken = this.authService.getToken();
  constructor() { }

  getAllProjects(): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${environment.apiUrl}/api/projects`, {
      headers: {
        Authorization: `Bearer ${this.autToken}`
      }
    });
  }

  getProjectsByClient(clientName: string) {

  }

  geProjectByIdProject(id_proyecto: number): Observable<Project> {
    return this.http.get<Project>(`${environment.apiUrl}/api/projects/${id_proyecto}`, {
      headers: {
        Authorization: `Bearer ${this.autToken}`
      }
    });
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
    return this.http.get<Folder[]>(`${environment.apiUrl}/api/projects/${id_proyecto}/folders`,
      {
        headers: {
          Authorization: `Bearer ${this.autToken}`
        }
      }
    );
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

  // ── Folder Content (Material) ──────────────────────────────────

  getContentByFolder(id_carpeta_material: number): Observable<FolderContent[]> {
    return this.http.get<FolderContent[]>(`${environment.apiUrl}/api/project-material/folder-material/${id_carpeta_material}/content`,
      {
        headers: {
          Authorization: `Bearer ${this.autToken}`
        }
      }
    );
  }

  uploadContent(id_carpeta_material: number, id_trabajador: number, file: File, nombre: string, descripcion: string): Observable<FolderContent> {
    const formData = new FormData();
    formData.append('id_carpeta_material', id_carpeta_material.toString());
    formData.append('id_trabajador', id_trabajador.toString());
    formData.append('ruta', file);
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    return this.http.post<FolderContent>(`${environment.apiUrl}/api/project-material/`, formData,
      {
        headers: {
          Authorization: `Bearer ${this.autToken}`
        }
      }
    );
  }

  deleteContent(id_proyecto_material: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/project-material/${id_proyecto_material}`,
      {
        headers: {
          Authorization: `Bearer ${this.autToken}`
        }
      }
    );
  }

  approveContent(id_proyecto_material: number): Observable<FolderContent> {
    return this.http.patch<FolderContent>(`${environment.apiUrl}/api/project-material/${id_proyecto_material}`,
      { estado: 'aprobado' },
      {
        headers: {
          Authorization: `Bearer ${this.autToken}`
        }
      }
    );
  }

}
