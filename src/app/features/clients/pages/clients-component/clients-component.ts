import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButtonImports } from '@spartan/ui/button';
import { HlmDropdownMenuImports } from '@spartan/ui/dropdown-menu';
import { HlmIconImports } from '@spartan/ui/icon';
import { HlmInputImports } from '@spartan/ui/input';
import { HlmSelectImports } from '@spartan/ui/select';
import { HlmTableImports } from '@spartan/ui/table';
import {HlmAlertDialogImports} from '@spartan/ui/alert-dialog';
import {BrnAlertDialogImports} from '@spartan-ng/brain/alert-dialog';
import { ClientsService } from '../../services/clients.service';
import { Task } from '../../../tasks/interface/task.interface';
import { ClientFile } from '../../interface/client-file.inteface';
import { TaskService } from '../../../tasks/services/task-service';
import { AuthService } from '../../../auth/services/auth-service';

@Component({
  selector: 'app-clients-component',
  imports: [
    CommonModule,
    FormsModule,
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmIconImports,
    HlmInputImports,
    BrnSelectImports,
    HlmSelectImports,
    HlmTableImports,
    BrnAlertDialogImports, 
    HlmAlertDialogImports, 
  ],
  providers: [provideIcons({ lucideChevronDown })],
  host: { class: 'w-full' },
  templateUrl: './clients-component.html',
  styleUrl: './clients-component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientsComponent implements OnInit {
  private clientService = inject(ClientsService);
  protected taskService = inject(TaskService);
  protected authService = inject(AuthService);

  protected clientWithTasks = signal<ClientFile[]>([]);
  protected isLoadingTask = signal<number | null>(null); // ID de tarea en procesamiento
  protected taskUpdated = signal(false); // Signal para trigger actualizaciones

  get token(){
    return this.authService.getToken();
  }

  ngOnInit(): void {
    this.getClientsWithTasks();
  }
  protected expandedRows: Set<number> = new Set();
  
  
  getClientsWithTasks(){
    this.clientService.getClientWithTasks().subscribe({
      next: (resp) => {
        this.clientWithTasks.set(resp);
        console.log(this.clientWithTasks());
      }
    })
    
  }

  toggleRowExpand(cliente_id: number): void {
    if (this.expandedRows.has(cliente_id)) {
      this.expandedRows.delete(cliente_id);
    } else {
      this.expandedRows.add(cliente_id);
    }
  }

  isRowExpanded(cliente_id: number): boolean {
    return this.expandedRows.has(cliente_id);
  }

  approveTask(id_cliente_tarea: number): void {
    if(!this.token) return;
    
    this.isLoadingTask.set(id_cliente_tarea);
    
    this.taskService.updateTaskStatus(id_cliente_tarea, 'aprobado', this.token!).subscribe({
      next: (resp) => {
        console.log('Tarea aprobada:', resp);
        this.isLoadingTask.set(null);
        this.taskUpdated.set(!this.taskUpdated()); // Toggle para trigger actualización
        this.getClientsWithTasks(); // Refrescar datos
      },
      error: (err) => {
        console.error('Error al aprobar tarea:', err);
        this.isLoadingTask.set(null);
      }
    })
  }

  rejectTask(id_cliente_tarea: number): void {
    if(!this.token) return;
    
    this.isLoadingTask.set(id_cliente_tarea);
    
    this.taskService.updateTaskStatus(id_cliente_tarea, 'rechazado', this.token!).subscribe({
      next: (resp) => {
        console.log('Tarea rechazada:', resp);
        this.isLoadingTask.set(null);
        this.taskUpdated.set(!this.taskUpdated()); // Toggle para trigger actualización
        this.getClientsWithTasks(); // Refrescar datos
      },
      error: (err) => {
        console.error('Error al rechazar tarea:', err);
        this.isLoadingTask.set(null);
      }
    })
  }

  getTaskStats(tasks: Task[]): { pendiente: number; aprobado: number; rechazado: number } {
    return {
      pendiente: tasks.filter(t => t.estado === 'pendiente').length,
      aprobado: tasks.filter(t => t.estado === 'aprobado').length,
      rechazado: tasks.filter(t => t.estado === 'rechazado').length,
    };
  }


}