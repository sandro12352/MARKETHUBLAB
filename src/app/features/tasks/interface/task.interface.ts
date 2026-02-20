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
  nombre: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  fecha_limite?: string;
  id_trabajador: number;
}