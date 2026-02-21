import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal, computed } from '@angular/core';
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
import { HlmAlertDialogImports } from '@spartan/ui/alert-dialog';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
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
  protected isLoadingTask = signal<number | null>(null);
  protected taskUpdated = signal(false);
  protected searchTerm = signal('');

  // Computed filtered clients based on search
  protected filteredClients = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const clients = this.clientWithTasks();

    if (!term) return clients;

    return clients.filter(item => {
      const fullName = `${item.cliente.nombres} ${item.cliente.apellidos}`.toLowerCase();
      const empresa = (item.cliente.nombre_empresa || '').toLowerCase();
      const telefono = (item.cliente.telefono || '').toLowerCase();
      const dni = (item.cliente.dni || '').toLowerCase();
      return fullName.includes(term) || empresa.includes(term) || telefono.includes(term) || dni.includes(term);
    });
  });

  get token() {
    return this.authService.getToken();
  }

  ngOnInit(): void {
    this.getClientsWithTasks();
  }

  getClientsWithTasks() {
    this.clientService.getClientWithTasks().subscribe({
      next: (resp) => {
        this.clientWithTasks.set(resp);
        console.log(this.clientWithTasks());
      }
    })
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  filterClients(): void {
    // Triggered by clearing search — the computed signal handles actual filtering
    this.searchTerm.set('');
  }

  approveTask(id_cliente_tarea: number): void {
    if (!this.token) return;

    this.isLoadingTask.set(id_cliente_tarea);

    this.taskService.updateTaskStatus(id_cliente_tarea, 'aprobado', this.token!).subscribe({
      next: (resp) => {
        console.log('Tarea aprobada:', resp);
        this.isLoadingTask.set(null);
        this.taskUpdated.set(!this.taskUpdated());
        this.getClientsWithTasks();
      },
      error: (err) => {
        console.error('Error al aprobar tarea:', err);
        this.isLoadingTask.set(null);
      }
    })
  }

  rejectTask(id_cliente_tarea: number): void {
    if (!this.token) return;

    this.isLoadingTask.set(id_cliente_tarea);

    this.taskService.updateTaskStatus(id_cliente_tarea, 'rechazado', this.token!).subscribe({
      next: (resp) => {
        console.log('Tarea rechazada:', resp);
        this.isLoadingTask.set(null);
        this.taskUpdated.set(!this.taskUpdated());
        this.getClientsWithTasks();
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

  getTotalTasks(): number {
    return this.clientWithTasks().reduce((acc, item) => acc + item.tareas.length, 0);
  }

  getTotalApproved(): number {
    return this.clientWithTasks().reduce((acc, item) => acc + item.tareas.filter(t => t.estado === 'aprobado').length, 0);
  }

  getTotalPending(): number {
    return this.clientWithTasks().reduce((acc, item) => acc + item.tareas.filter(t => t.estado === 'pendiente').length, 0);
  }
}