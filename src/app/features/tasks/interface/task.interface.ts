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
  estado: 'pendiente' | 'subido' | 'aprobado' | 'rechazado'; // Uso de literales para mayor control
  archivos: ArchivoTarea[];
  formulario_url?: string;
  trabajador: Worker; // El campo que discutimos, opcional o nulo
}



export interface ArchivoTarea {
  id_archivo_cliente: number;
  ruta: string;
  fecha_subida: string | Date;
}