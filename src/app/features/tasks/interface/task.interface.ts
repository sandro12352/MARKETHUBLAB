import { FolderContent } from "../../projects/interfaces/folder-content.interface";
import { Escena } from "../../projects/interfaces/plan-grabacion.interface";

export interface Worker {
  nombres: string;
  apellidos: string;
  id_trabajador: number;
  id_usuario: number;
}

export interface Task {
  id_cliente_tarea: number;
  id_tarea: number;
  nombre: string;
  descripcion: string;
  estado: 'pendiente' | 'en_progreso' | 'subido' | 'aprobado' | 'rechazado';
  prioridad: 'alta' | 'media' | 'baja';
  fecha_limite?: string | Date;
  fecha_creacion?: string | Date;
  archivos: ArchivoTarea[];
  formulario_url?: string;
  trabajador: Worker;
  observacion?: string;
}

export interface ArchivoTarea {
  id_archivo_cliente: number;
  ruta: string;
  fecha_subida: string | Date;
}



export interface CreateTaskDto {
  titulo: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  fecha_limite?: string;
  id_trabajador: number;
  id_carpeta_material?: number;
  id_proyecto?: number;
  id_escena?: number;
}

export interface WorkerTask {
  id_trabajador_tarea: number;
  titulo: null | string;
  descripcion: null | string;
  id_trabajador: number;
  id_proyecto_material: null;
  id_carpeta_material?: number | null;
  id_proyecto?: number | null;
  escenaId_escena?: number | null;
  estado: string;
  prioridad: string;
  fecha_creacion: Date;
  fecha_limite: Date;
  fecha_finalizacion: null;
  observacion: null;
  trabajador: Trabajador;
  proyecto_material: FolderContent; // This will be FolderContent or null
  escena?: Escena | null;
  carpeta_material?: {
    id_carpeta_material: number;
    nombre: string;
    id_proyecto: number;
  } | null;
}

export interface Trabajador {
  id_trabajador: number;
  id_usuario: number;
  nombres: string;
  apellidos: string;
  fecha_registro: Date;
}
