export interface FolderContent {
    id_proyecto_material?: number;
    id_trabajador?: number;
    id_carpeta_material: number;
    nombre: string;
    descripcion?: string;
    tipo: 'image' | 'video' | 'application' | 'other';
    ruta: string;
    tamanio?: number;
    estado?: string;
    fecha_subida?: Date;
    trabajador?: Trabajador;
    referencia?: string;
    observacion?: string;
    copy?: string;
    fecha_publicacion?: string | Date;
    visible?: boolean;
}

export interface Trabajador {
    id_trabajador: number;
    id_usuario: number;
    nombres: string;
    apellidos: string;
    fecha_registro: Date;
}
