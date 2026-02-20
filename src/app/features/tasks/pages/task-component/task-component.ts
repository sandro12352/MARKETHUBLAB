import { Component, inject, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan/ui/select';
import { HlmInputImports } from '@spartan/ui/input';
import { HlmLabelImports } from '@spartan/ui/label';
import { HlmTextareaImports } from '@spartan/ui/textarea';
import { HlmToasterImports } from '@spartan/ui/sonner';
import { TaskService } from '../../services/task-service';
import { AuthService, User } from '../../../auth/services/auth-service';
import { Task, Worker, CreateTaskDto } from '../../interface/task.interface';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-task-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmToasterImports,
    BrnSelectImports,
    HlmSelectImports,
    HlmInputImports,
    HlmLabelImports,
    HlmTextareaImports,
  ],
  templateUrl: './task-component.html',
  styleUrl: './task-component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TaskComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);

  // User State
  currentUser = signal<User | null>(null);
  isAdmin = computed(() => this.currentUser()?.id_rol === 3);

  // Data State
  tasks = signal<Task[]>([]);
  workers = signal<Worker[]>([]);
  loading = signal<boolean>(true);

  // Filter State
  activeFilter = signal<string>('todas');
  searchTerm = signal<string>('');

  // Create Task Modal
  showCreateModal = signal<boolean>(false);
  isCreating = signal<boolean>(false);
  newTask = signal<CreateTaskDto>({
    nombre: '',
    descripcion: '',
    prioridad: 'media',
    fecha_limite: '',
    id_trabajador: 0
  });

  // Reject Modal
  showRejectModal = signal<boolean>(false);
  rejectingTaskId = signal<number | null>(null);
  rejectObservation = signal<string>('');

  // Detail Modal
  showDetailModal = signal<boolean>(false);
  selectedTask = signal<Task | null>(null);

  // Computed Stats
  totalTasks = computed(() => this.filteredTasks().length);
  pendingCount = computed(() => this.tasks().filter(t => t.estado === 'pendiente').length);
  inProgressCount = computed(() => this.tasks().filter(t => t.estado === 'en_progreso').length);
  uploadedCount = computed(() => this.tasks().filter(t => t.estado === 'subido').length);
  approvedCount = computed(() => this.tasks().filter(t => t.estado === 'aprobado').length);
  rejectedCount = computed(() => this.tasks().filter(t => t.estado === 'rechazado').length);

  // Filtered Tasks
  filteredTasks = computed(() => {
    let filtered = this.tasks();
    const filter = this.activeFilter();
    const search = this.searchTerm().toLowerCase();

    if (filter !== 'todas') {
      filtered = filtered.filter(t => t.estado === filter);
    }

    if (search) {
      filtered = filtered.filter(t =>
        t.nombre.toLowerCase().includes(search) ||
        t.descripcion.toLowerCase().includes(search) ||
        `${t.trabajador?.nombres} ${t.trabajador?.apellidos}`.toLowerCase().includes(search)
      );
    }

    return filtered;
  });

  ngOnInit(): void {
    this.currentUser.set(this.authService.getUser());
    console.log(this.currentUser());
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    const user = this.currentUser();

    if (this.isAdmin()) {
      // Admin: carga todas las tareas y los trabajadores
      this.taskService.getTasks()
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (data) => this.tasks.set(data),
          error: (err) => {
            console.error('Error loading tasks', err);
            toast.error('Error al cargar las tareas.');
          }
        });

      this.taskService.getWorkers().subscribe({
        next: (data) => this.workers.set(data),
        error: (err) => console.error('Error loading workers', err)
      });
    } else {
      // Worker: solo sus tareas
      const workerId = (user as any)?.id_trabajador || (user as any)?.id;
      if (workerId) {
        this.taskService.getTasksByWorker(workerId)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (data) => this.tasks.set(data),
            error: (err) => {
              console.error('Error loading tasks', err);
              toast.error('Error al cargar tus tareas.');
            }
          });
      } else {
        this.loading.set(false);
      }
    }
  }

  // Filter methods
  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  // Create Task
  openCreateModal(): void {
    this.newTask.set({ nombre: '', descripcion: '', prioridad: 'media', fecha_limite: '', id_trabajador: 0 });
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onWorkerSelect(value: any): void {
    this.newTask.update(t => ({ ...t, id_trabajador: Number(value) }));
  }

  onPrioritySelect(value: any): void {
    this.newTask.update(t => ({ ...t, prioridad: value }));
  }

  updateTaskNombre(value: string): void {
    this.newTask.update(t => ({ ...t, nombre: value }));
  }

  updateTaskDescripcion(value: string): void {
    this.newTask.update(t => ({ ...t, descripcion: value }));
  }

  updateTaskFechaLimite(value: string): void {
    this.newTask.update(t => ({ ...t, fecha_limite: value }));
  }

  submitTask(): void {
    const token = this.authService.getToken();
    const task = this.newTask();

    if (!task.nombre || !task.descripcion || !task.id_trabajador || !token) {
      toast.error('Por favor, completa todos los campos obligatorios.');
      return;
    }

    this.isCreating.set(true);
    this.taskService.createTask(task, token)
      .pipe(finalize(() => this.isCreating.set(false)))
      .subscribe({
        next: () => {
          toast.success('Tarea creada y asignada exitosamente.');
          this.closeCreateModal();
          this.loadData();
        },
        error: (err) => {
          console.error('Error creating task', err);
          toast.error('Error al crear la tarea.');
        }
      });
  }

  // Approve Task
  approveTask(taskId: number): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.taskService.approveTask(taskId, token).subscribe({
      next: () => {
        toast.success('Tarea aprobada exitosamente.');
        this.loadData();
      },
      error: (err) => {
        console.error('Error approving task', err);
        toast.error('Error al aprobar la tarea.');
      }
    });
  }

  // Reject Task
  openRejectModal(taskId: number): void {
    this.rejectingTaskId.set(taskId);
    this.rejectObservation.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.rejectingTaskId.set(null);
    this.rejectObservation.set('');
  }

  submitReject(): void {
    const token = this.authService.getToken();
    const taskId = this.rejectingTaskId();
    const obs = this.rejectObservation();

    if (!taskId || !token) return;

    this.taskService.rejectTask(taskId, obs, token).subscribe({
      next: () => {
        toast.success('Tarea rechazada.');
        this.closeRejectModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Error rejecting task', err);
        toast.error('Error al rechazar la tarea.');
      }
    });
  }

  // Delete Task
  deleteTask(taskId: number): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.taskService.deleteTask(taskId, token).subscribe({
      next: () => {
        toast.success('Tarea eliminada.');
        this.loadData();
      },
      error: (err) => {
        console.error('Error deleting task', err);
        toast.error('Error al eliminar la tarea.');
      }
    });
  }

  // Task Detail
  openDetailModal(task: Task): void {
    this.selectedTask.set(task);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedTask.set(null);
  }

  // Upload task (worker marks as done)
  markAsUploaded(taskId: number): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.taskService.updateTaskStatus(taskId, 'subido', token).subscribe({
      next: () => {
        toast.success('Tarea marcada como subida.');
        this.loadData();
      },
      error: (err) => {
        console.error('Error updating task', err);
        toast.error('Error al actualizar la tarea.');
      }
    });
  }

  // Helpers
  getStatusLabel(estado: string): string {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      en_progreso: 'En Progreso',
      subido: 'Subido',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado'
    };
    return labels[estado] || estado;
  }

  getStatusColor(estado: string): string {
    const colors: Record<string, string> = {
      pendiente: 'amber',
      en_progreso: 'blue',
      subido: 'purple',
      aprobado: 'green',
      rechazado: 'red'
    };
    return colors[estado] || 'neutral';
  }

  getPriorityLabel(prioridad: string): string {
    const labels: Record<string, string> = {
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja'
    };
    return labels[prioridad] || prioridad;
  }

  getPriorityIcon(prioridad: string): string {
    const icons: Record<string, string> = {
      alta: 'lucide:arrow-up',
      media: 'lucide:minus',
      baja: 'lucide:arrow-down'
    };
    return icons[prioridad] || 'lucide:minus';
  }
}
