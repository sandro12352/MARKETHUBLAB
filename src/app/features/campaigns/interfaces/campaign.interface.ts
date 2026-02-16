export interface Campaign {
    id_campana?: number;
    id_proyecto?: number;
    name: string;
    objective: string;
    plataforma: string;
    status: 'PAUSED' | 'ACTIVE' | 'DELETED' | 'FINALIZED';
    special_ad_categories: string[];
    presupuesto_total: number;
    fecha_inicio: string;
    fecha_fin: string;
    fecha_creacion?: string;
    conjuntos_anuncios?: AdSet[];
}

export interface AdSet {
    id_conjunto?: number;
    id_campana?: number;
    nombre: string;
    segmentacion: string;
    presupuesto_diario: number;
    estado: 'borrador' | 'activo' | 'pausado' | 'finalizado';
    ubicacion?: string;
    edad_min?: number;
    edad_max?: number;
    genero?: string;
    fecha_creacion?: string;
    anuncios?: Ad[];
}

export interface Ad {
    id_anuncio?: number;
    id_conjunto?: number;
    nombre: string;
    tipo: 'imagen' | 'video' | 'carrusel' | 'historia';
    titulo: string;
    descripcion?: string;
    url_destino?: string;
    url_media?: string;
    texto_principal?: string;
    call_to_action?: string;
    estado: 'borrador' | 'activo' | 'pausado' | 'rechazado';
    fecha_creacion?: string;
}
