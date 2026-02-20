import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTaskDto, Task, Worker } from '../interface/task.interface';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);

  /**
   * Get all tasks (admin)
   */
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.apiUrl}/api/tasks/`);
  }

  /**
   * Get tasks assigned to a specific worker
   */
  getTasksByWorker(idTrabajador: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.apiUrl}/api/tasks/worker/${idTrabajador}`);
  }

  /**
   * Create a new task (admin only)
   */
  createTask(task: CreateTaskDto, token: string): Observable<Task> {
    return this.http.post<Task>(`${environment.apiUrl}/api/tasks/`, task, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Update task status
   */
  updateTaskStatus(id_cliente_tarea: number, estado: string, token: string): Observable<Task> {
    return this.http.put<Task>(`${environment.apiUrl}/api/task/${id_cliente_tarea}`, { estado }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Approve a task (admin only)
   */
  approveTask(id_cliente_tarea: number, token: string): Observable<Task> {
    return this.updateTaskStatus(id_cliente_tarea, 'aprobado', token);
  }

  /**
   * Reject a task (admin only)
   */
  rejectTask(id_cliente_tarea: number, observacion: string, token: string): Observable<Task> {
    return this.http.put<Task>(`${environment.apiUrl}/api/task/${id_cliente_tarea}`, {
      estado: 'rechazado',
      observacion
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Delete a task (admin only)
   */
  deleteTask(id_cliente_tarea: number, token: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/task/${id_cliente_tarea}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Get all workers for assignment
   */
  getWorkers(): Observable<Worker[]> {
    return this.http.get<Worker[]>(`${environment.apiUrl}/api/workers/`);
  }
}
