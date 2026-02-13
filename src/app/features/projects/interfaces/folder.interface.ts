import { Project } from "./project.interface";

export interface Folder {
    id_carpeta_material?: number;
    id_proyecto: number;
    nombre: string;
    proyecto: Project;
    descripcion?: string;
    proyecto_material?: string[];
    icono: string;
}


