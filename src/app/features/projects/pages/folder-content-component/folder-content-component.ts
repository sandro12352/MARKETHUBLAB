import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

@Component({
    selector: 'app-folder-content',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        HlmButtonImports,
        HlmDropdownMenuImports,
        ReactiveFormsModule,
        BrnAlertDialogImports,
        HlmAlertDialogImports,
        HlmInputImports,
        HlmLabelImports,
        HlmTextareaImports,
        HlmToasterImports
    ],
    templateUrl: './folder-content-component.html',
    styleUrl: './folder-content-component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FolderContentComponent implements OnInit {
    private projectService = inject(ProjectsService);
    private route = inject(ActivatedRoute);
    private fb = inject(FormBuilder);

    folder = signal<Folder | null>(null);
    folderContents = signal<FolderContent[]>([]);
    isLoading = signal(true);
    isDragging = signal(false);
    selectedFile = signal<File | null>(null);
    previewUrl = signal<string | null>(null);
    isUploading = signal(false);
    viewMode = signal<'grid' | 'list'>('grid');

    imageCount = computed(() => this.folderContents().filter(c => c.tipo === 'image').length);
    videoCount = computed(() => this.folderContents().filter(c => c.tipo === 'video').length);
    docCount = computed(() => this.folderContents().filter(c => c.tipo === 'application' || c.tipo === 'other').length);

    previewContent = signal<FolderContent | null>(null);
    isPreviewOpen = signal(false);

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
        this.loadFolderData();
        this.loadFolderContents();
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

        this.projectService.uploadContent(
            this.id_carpeta,
            3,
            this.selectedFile()!,
            this.contentForm.value.nombre!,
            this.contentForm.value.descripcion || ''
        ).subscribe({
            next: (content) => {
                this.folderContents.update(contents => [...contents, content]);
                toast.success('¡Contenido subido exitosamente!');
                this.resetContentForm();
                this.isUploading.set(false);
                ctx.close();
            },
            error: () => {
                toast.error('Error al subir el contenido');
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

    formatFileSize(bytes?: number): string {
        if (!bytes) return '—';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
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
