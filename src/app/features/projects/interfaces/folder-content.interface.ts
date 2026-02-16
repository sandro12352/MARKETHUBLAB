export interface FolderContent {
    id_proyecto_material?: number;
    id_carpeta_material: number;
    nombre: string;
    descripcion?: string;
    tipo: 'imagen' | 'video' | 'documento' | 'otro';
    ruta: string;
    tamano?: number;
    fecha_subida?: Date;
}



// export interface FolderContent {
//     id_proyecto_material: number;
//     id_trabajador: number;
//     id_carpeta_material: number;
//     nombre: string;
//     descripcion: string;
//     estado: string;
//     ruta: string;
//     version: number;
//     fecha_subida: Date;
//     observacion: null;
//     trabajador: Trabajador;
//     carpeta_material: CarpetaMaterial;
// }

// export interface CarpetaMaterial {
//     id_carpeta_material: number;
//     nombre: string;
//     descripcion: null;
//     id_proyecto: number;
// }

// export interface Trabajador {
//     id_trabajador: number;
//     id_usuario: number;
//     nombres: string;
//     apellidos: string;
//     fecha_registro: Date;
// }
