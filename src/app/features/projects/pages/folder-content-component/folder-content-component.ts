import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { Folder } from '../../interfaces/folder.interface';
import { FolderContent } from '../../interfaces/folder-content.interface';
import { HlmButtonImports } from '@spartan/ui/button';
import { HlmDropdownMenuImports } from '@spartan/ui/dropdown-menu';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmAlertDialogImports } from '@spartan/ui/alert-dialog';
import { HlmInputImports } from '@spartan/ui/input';
import { HlmLabelImports } from '@spartan/ui/label';
import { HlmTextareaImports } from '@spartan/ui/textarea';
import { toast } from 'ngx-sonner';
import { HlmToasterImports } from '@spartan/ui/sonner';
import { AuthService } from '../../../auth/services/auth-service';
import { TaskService } from '../../../tasks/services/task-service';
import { CreateTaskDto, Worker, WorkerTask } from '../../../tasks/interface/task.interface';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan/ui/select';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-folder-content',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        HlmButtonImports,
        HlmDropdownMenuImports,
        ReactiveFormsModule,
        BrnAlertDialogImports,
        HlmAlertDialogImports,
        HlmInputImports,
        HlmLabelImports,
        HlmTextareaImports,
        HlmToasterImports,
        BrnSelectImports,
        HlmSelectImports
    ],
    templateUrl: './folder-content-component.html',
    styleUrl: './folder-content-component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FolderContentComponent implements OnInit {
    private projectService = inject(ProjectsService);
    private taskService = inject(TaskService);
    private route = inject(ActivatedRoute);
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);

    folder = signal<Folder | null>(null);
    folderContents = signal<FolderContent[]>([]);
    isLoading = signal(true);
    isDragging = signal(false);
    selectedFile = signal<File | null>(null);
    previewUrl = signal<string | null>(null);
    isUploading = signal(false);
    showUploadModal = signal(false);
    uploadForTaskId = signal<number | null>(null);
    viewMode = signal<'grid' | 'list'>('grid');

    // Unified view — no tabs needed

    imageCount = computed(() => this.folderContents().filter(c => c.tipo === 'image').length);
    videoCount = computed(() => this.folderContents().filter(c => c.tipo === 'video').length);
    docCount = computed(() => this.folderContents().filter(c => c.tipo === 'application' || c.tipo === 'other').length);

    previewContent = signal<FolderContent | null>(null);
    isPreviewOpen = signal(false);

    // ── Task Management ──
    folderTasks = signal<WorkerTask[]>([]);
    isLoadingTasks = signal(false);
    workers = signal<Worker[]>([]);
    showCreateTaskModal = signal(false);
    isCreatingTask = signal(false);
    currentUser = signal<any>(null);
    isAdmin = computed(() => this.currentUser()?.id_rol === 3);

    newTask = signal<CreateTaskDto>({
        titulo: '',
        descripcion: '',
        prioridad: 'media',
        fecha_limite: '',
        id_trabajador: 0,
        id_carpeta_material: 0,
        id_proyecto: 0
    });

    // Task stats
    taskPendingCount = computed(() => this.folderTasks().filter(t => t.estado === 'pendiente').length);
    taskInProgressCount = computed(() => this.folderTasks().filter(t => t.estado === 'en_progreso').length);
    taskUploadedCount = computed(() => this.folderTasks().filter(t => t.estado === 'subido').length);
    taskApprovedCount = computed(() => this.folderTasks().filter(t => t.estado === 'aprobado').length);
    taskRejectedCount = computed(() => this.folderTasks().filter(t => t.estado === 'rechazado').length);

    // Task detail modal
    showTaskDetailModal = signal(false);
    selectedTask = signal<WorkerTask | null>(null);

    // Reject modal
    showRejectModal = signal(false);
    rejectingTaskId = signal<number | null>(null);
    rejectObservation = signal('');

    openPreview(content: FolderContent) {
        this.previewContent.set(content);
        this.isPreviewOpen.set(true);
    }

    closePreview() {
        this.isPreviewOpen.set(false);
        this.previewContent.set(null);
    }

    @HostListener('document:keydown.escape')
    onEscapeKey() {
        if (this.isPreviewOpen()) {
            this.closePreview();
        }
        if (this.showCreateTaskModal()) {
            this.closeCreateTaskModal();
        }
        if (this.showTaskDetailModal()) {
            this.closeTaskDetailModal();
        }
        if (this.showRejectModal()) {
            this.closeRejectModal();
        }
    }

    contentForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        descripcion: ['']
    });

    id_proyecto!: number;
    id_carpeta!: number;

    ngOnInit(): void {
        this.id_proyecto = Number(this.route.snapshot.params['id_proyecto']);
        this.id_carpeta = Number(this.route.snapshot.params['id_carpeta']);
        this.currentUser.set(this.authService.getUser());
        this.loadFolderData();
        this.loadFolderContents();
        this.loadFolderTasks();

        // Load workers if admin
        if (this.isAdmin()) {
            this.taskService.getWorkers().subscribe({
                next: (data) => this.workers.set(data),
                error: (err) => console.error('Error loading workers', err)
            });
        }
    }

    loadFolderData() {
        // We load the folder info from the project folders list
        this.projectService.getFoldersByProject(this.id_proyecto).subscribe(folders => {
            const found = folders.find(f => f.id_carpeta_material === this.id_carpeta);
            if (found) {
                this.folder.set(found);
            }
        });
    }

    loadFolderContents() {
        this.isLoading.set(true);
        this.projectService.getContentByFolder(this.id_carpeta).subscribe({
            next: (contents) => {
                this.folderContents.set(contents);
                this.isLoading.set(false);
            },
            error: () => {
                this.folderContents.set([]);
                this.isLoading.set(false);
            }
        });
    }

    // ── Task Methods ──

    loadFolderTasks() {
        this.isLoadingTasks.set(true);
        this.taskService.getTasksByFolder(this.id_carpeta)
            .pipe(finalize(() => this.isLoadingTasks.set(false)))
            .subscribe({
                next: (tasks) => this.folderTasks.set(tasks),
                error: () => this.folderTasks.set([])
            });
    }

    openCreateTaskModal() {
        this.newTask.set({
            titulo: '',
            descripcion: '',
            prioridad: 'media',
            fecha_limite: '',
            id_trabajador: 0,
            id_carpeta_material: this.id_carpeta,
            id_proyecto: this.id_proyecto
        });
        this.showCreateTaskModal.set(true);
    }

    closeCreateTaskModal() {
        this.showCreateTaskModal.set(false);
    }

    updateTaskTitulo(value: string) {
        this.newTask.update(t => ({ ...t, titulo: value }));
    }
    updateTaskDescripcion(value: string) {
        this.newTask.update(t => ({ ...t, descripcion: value }));
    }
    updateTaskFechaLimite(value: string) {
        this.newTask.update(t => ({ ...t, fecha_limite: value }));
    }
    onWorkerSelect(value: any) {
        this.newTask.update(t => ({ ...t, id_trabajador: Number(value) }));
    }
    onPrioritySelect(value: any) {
        this.newTask.update(t => ({ ...t, prioridad: value }));
    }

    submitTask() {
        const token = this.authService.getToken();
        const task = this.newTask();

        if (!task.titulo || !task.descripcion || !task.id_trabajador || !token) {
            toast.error('Por favor, completa todos los campos obligatorios.');
            return;
        }

        this.isCreatingTask.set(true);
        this.taskService.createTask(task, token)
            .pipe(finalize(() => this.isCreatingTask.set(false)))
            .subscribe({
                next: () => {
                    toast.success('¡Tarea creada y asignada exitosamente!');
                    this.closeCreateTaskModal();
                    this.loadFolderTasks();
                },
                error: (err) => {
                    console.error('Error creating task', err);
                    toast.error('Error al crear la tarea.');
                }
            });
    }

    // Task Detail
    openTaskDetailModal(task: WorkerTask) {
        this.selectedTask.set(task);
        this.showTaskDetailModal.set(true);
    }

    closeTaskDetailModal() {
        this.showTaskDetailModal.set(false);
        this.selectedTask.set(null);
    }

    // Approve Task
    approveTask(taskId: number) {
        const token = this.authService.getToken();
        if (!token) return;

        this.taskService.approveTask(taskId, token).subscribe({
            next: () => {
                toast.success('Tarea aprobada exitosamente.');
                this.loadFolderTasks();
            },
            error: () => toast.error('Error al aprobar la tarea.')
        });
    }

    // Reject Task
    openRejectModal(taskId: number) {
        this.rejectingTaskId.set(taskId);
        this.rejectObservation.set('');
        this.showRejectModal.set(true);
    }

    closeRejectModal() {
        this.showRejectModal.set(false);
        this.rejectingTaskId.set(null);
        this.rejectObservation.set('');
    }

    submitReject() {
        const token = this.authService.getToken();
        const taskId = this.rejectingTaskId();
        const obs = this.rejectObservation();

        if (!taskId || !token) return;

        this.taskService.rejectTask(taskId, obs, token).subscribe({
            next: () => {
                toast.success('Tarea rechazada.');
                this.closeRejectModal();
                this.loadFolderTasks();
            },
            error: () => toast.error('Error al rechazar la tarea.')
        });
    }

    // Delete Task
    deleteTask(taskId: number) {
        const token = this.authService.getToken();
        if (!token) return;

        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            const taskToDelete = this.folderTasks().find(t => t.id_trabajador_tarea === taskId);

            this.taskService.deleteTask(taskId, token).subscribe({
                next: () => {
                    // Si la tarea tenía un material asociado, eliminarlo también
                    if (taskToDelete?.proyecto_material?.id_proyecto_material) {
                        this.projectService.deleteContent(taskToDelete.proyecto_material.id_proyecto_material).subscribe({
                            next: () => {
                                // Actualizar lista de contenidos para que desaparezca el archivo
                                this.loadFolderContents();
                            }
                        });
                    }

                    toast.success('Tarea eliminada.');
                    this.loadFolderTasks();
                },
                error: () => toast.error('Error al eliminar la tarea.')
            });
        }
    }

    // Worker marks task as uploaded
    markAsUploaded(taskId: number, materialId?: number) {
        const token = this.authService.getToken();
        if (!token) return;

        const data: any = { estado: 'subido' };
        if (materialId) {
            data.id_proyecto_material = materialId;
        }

        this.taskService.updateTask(taskId, data, token).subscribe({
            next: () => {
                toast.success('Tarea marcada como subida.');
                this.loadFolderTasks();
            },
            error: () => toast.error('Error al actualizar la tarea.')
        });
    }

    // Task Helpers
    getTaskStatusLabel(estado: string): string {
        const labels: Record<string, string> = {
            pendiente: 'Pendiente',
            en_progreso: 'En Progreso',
            subido: 'Subido',
            aprobado: 'Aprobado',
            rechazado: 'Rechazado'
        };
        return labels[estado] || estado;
    }

    getTaskStatusColor(estado: string): string {
        const colors: Record<string, string> = {
            pendiente: 'amber',
            en_progreso: 'blue',
            subido: 'purple',
            aprobado: 'emerald',
            rechazado: 'red'
        };
        return colors[estado] || 'neutral';
    }

    getTaskStatusClasses(estado: string): string {
        switch (estado) {
            case 'pendiente':
                return 'bg-amber-500/8 text-amber-400 border border-amber-500/15';
            case 'en_progreso':
                return 'bg-blue-500/8 text-blue-400 border border-blue-500/15';
            case 'subido':
                return 'bg-purple-500/8 text-purple-400 border border-purple-500/15';
            case 'aprobado':
                return 'bg-emerald-500/8 text-emerald-400 border border-emerald-500/15';
            case 'rechazado':
                return 'bg-red-500/8 text-red-400 border border-red-500/15';
            default:
                return 'bg-neutral-500/8 text-neutral-400 border border-neutral-500/15';
        }
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

    // ── File Methods ──

    openUploadModal(taskId?: number) {
        this.resetContentForm();
        this.uploadForTaskId.set(taskId || null);

        if (taskId) {
            const task = this.folderTasks().find(t => t.id_trabajador_tarea === taskId);
            if (task?.proyecto_material) {
                this.contentForm.patchValue({
                    nombre: task.proyecto_material.nombre,
                    descripcion: task.proyecto_material.descripcion
                });
            }
        }

        this.showUploadModal.set(true);
    }

    closeUploadModal() {
        this.showUploadModal.set(false);
        this.uploadForTaskId.set(null);
        this.resetContentForm();
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.processFile(input.files[0]);
        }
    }

    processFile(file: File) {
        this.selectedFile.set(file);

        // Auto-fill name if empty
        if (!this.contentForm.get('nombre')?.value) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            this.contentForm.patchValue({ nombre: nameWithoutExt });
        }

        // Generate preview
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onload = () => this.previewUrl.set(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            this.previewUrl.set(null);
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging.set(true);
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging.set(false);
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging.set(false);

        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
            this.processFile(event.dataTransfer.files[0]);
        }
    }

    onSubmitContent(ctx: any) {
        if (this.contentForm.invalid) {
            this.contentForm.markAllAsTouched();
            return;
        }

        this.isUploading.set(true);

        const taskId = this.uploadForTaskId();
        const task = taskId ? this.folderTasks().find(t => t.id_trabajador_tarea === taskId) : null;
        const existingMaterialId = task?.proyecto_material?.id_proyecto_material;

        const request = existingMaterialId
            ? this.projectService.updateContent(
                existingMaterialId,
                this.selectedFile()!,
                this.contentForm.value.nombre!,
                this.contentForm.value.descripcion || ''
            )
            : this.projectService.uploadContent(
                this.id_carpeta,
                this.authService.getUser()?.id_trabajador || 0,
                this.selectedFile()!,
                this.contentForm.value.nombre!,
                this.contentForm.value.descripcion || ''
            );

        request.subscribe({
            next: (content) => {
                if (existingMaterialId) {
                    // Actualizar en la lista local
                    this.folderContents.update(contents =>
                        contents.map(c => c.id_proyecto_material === existingMaterialId ? content : c)
                    );
                } else {
                    this.folderContents.update(contents => [...contents, content]);
                }

                // Si estamos subiendo para una tarea, marcar como subida y vincular material
                if (taskId) {
                    this.markAsUploaded(taskId, content.id_proyecto_material);
                }

                toast.success(existingMaterialId ? '¡Material actualizado!' : '¡Contenido subido exitosamente!');
                this.closeUploadModal();
                this.isUploading.set(false);
            },
            error: () => {
                toast.error('Error al procesar el contenido');
                this.isUploading.set(false);
            }
        });
    }

    deleteContent(id_material: number) {
        if (confirm('¿Estás seguro de que deseas eliminar este contenido?')) {
            this.projectService.deleteContent(id_material).subscribe({
                next: () => {
                    this.folderContents.update(contents => contents.filter(c => c.id_proyecto_material !== id_material));
                    toast.success('Contenido eliminado con éxito');
                },
                error: () => toast.error('Error al eliminar el contenido')
            });
        }
    }

    resetContentForm() {
        this.contentForm.reset();
        this.selectedFile.set(null);
        this.previewUrl.set(null);
    }

    getFileIcon(tipo: string): string {
        switch (tipo) {
            case 'imagen': return 'lucide:image';
            case 'video': return 'lucide:video';
            case 'documento': return 'lucide:file-text';
            default: return 'lucide:file';
        }
    }

    getFileIconColor(tipo: string): string {
        switch (tipo) {
            case 'imagen': return 'text-emerald-400';
            case 'video': return 'text-purple-400';
            case 'documento': return 'text-blue-400';
            default: return 'text-neutral-400';
        }
    }

    getFileBgColor(tipo: string): string {
        switch (tipo) {
            case 'imagen': return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30';
            case 'video': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
            case 'documento': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
            default: return 'from-neutral-500/20 to-neutral-500/20 border-neutral-500/30';
        }
    }

    isImage(content: FolderContent): boolean {
        return content.tipo === 'image';
    }

    isVideo(content: FolderContent): boolean {
        return content.tipo === 'video';
    }


    toggleViewMode() {
        this.viewMode.update(mode => mode === 'grid' ? 'list' : 'grid');
    }

    downloadFile(content: FolderContent) {
        fetch(content.ruta)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = content.nombre;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            })
            .catch(() => {
                toast.error('Error al descargar el archivo');
            });
    }

    getSelectedFileType(): string {
        const file = this.selectedFile();
        if (!file) return '';
        if (file.type.startsWith('image/')) return 'imagen';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'documento';
        return 'otro';
    }

    getTypeLabel(tipo: string): string {
        const labels: Record<string, string> = {
            'image': 'Imagen',
            'video': 'Video',
            'application': 'Documento',
            'other': 'Otro'
        };
        return labels[tipo] || tipo;
    }

    getStatusLabel(estado?: string): string {
        const labels: Record<string, string> = {
            'pendiente': 'Pendiente',
            'aprobado': 'Aprobado',
            'rechazado': 'Rechazado'
        };
        return labels[estado || 'pendiente'] || estado || 'Pendiente';
    }

    getStatusClasses(estado?: string): string {
        switch (estado) {
            case 'aprobado':
                return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
            case 'rechazado':
                return 'bg-red-500/15 text-red-400 border-red-500/25';
            default:
                return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
        }
    }

    approveContent(content: FolderContent) {
        if (!content.id_proyecto_material) return;
        this.projectService.approveContent(content.id_proyecto_material).subscribe({
            next: (updated) => {
                this.folderContents.update(contents =>
                    contents.map(c => c.id_proyecto_material === content.id_proyecto_material
                        ? { ...c, estado: 'aprobado' }
                        : c
                    )
                );
                toast.success('¡Contenido aprobado exitosamente!');
            },
            error: () => {
                toast.error('Error al aprobar el contenido');
            }
        });
    }
}
