import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../interface/task.interface';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);

  /**
   * Get all tasks
   * @returns Observable<Task[]>
   */
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.apiUrl}/api/tasks/`);
  }


  updateTaskStatus(id_cliente_tarea: number, estado: string,token:string): Observable<Task> {
    return this.http.put<Task>(`${environment.apiUrl}/api/task/${id_cliente_tarea}`, { estado },
      {headers:{
        Authorization:`Bearer ${token}`
      }}
    );
  }


}
