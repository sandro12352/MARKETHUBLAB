import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTaskDto, Task, Worker, WorkerTask } from '../interface/task.interface';
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
  getTasks(): Observable<WorkerTask[]> {
    return this.http.get<WorkerTask[]>(`${environment.apiUrl}/api/worker-tasks/`);
  }

  /**
   * Get tasks assigned to a specific worker
   */
  getTasksByWorker(idTrabajador: number): Observable<WorkerTask[]> {
    return this.http.get<WorkerTask[]>(`${environment.apiUrl}/api/worker-tasks/trabajador/${idTrabajador}`);
  }

  /**
   * Create a new task (admin only)
   */
  createTask(task: CreateTaskDto, token: string): Observable<WorkerTask> {
    return this.http.post<WorkerTask>(`${environment.apiUrl}/api/worker-tasks/`, task, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Update task status
   */
  updateTaskStatus(id_cliente_tarea: number, estado: string, token: string): Observable<WorkerTask> {
    return this.http.put<WorkerTask>(`${environment.apiUrl}/api/worker-tasks/${id_cliente_tarea}`, { estado }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Approve a task (admin only)
   */
  approveTask(id_cliente_tarea: number, token: string): Observable<WorkerTask> {
    return this.updateTaskStatus(id_cliente_tarea, 'aprobado', token);
  }

  /**
   * Reject a task (admin only)
   */
  rejectTask(id_cliente_tarea: number, observacion: string, token: string): Observable<WorkerTask> {
    return this.http.put<WorkerTask>(`${environment.apiUrl}/api/worker-tasks/${id_cliente_tarea}`, {
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
    return this.http.delete<void>(`${environment.apiUrl}/api/worker-tasks/${id_cliente_tarea}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Get all workers for assignment
   */
  getWorkers(): Observable<Worker[]> {
    return this.http.get<Worker[]>(`${environment.apiUrl}/api/worker`);
  }
}
