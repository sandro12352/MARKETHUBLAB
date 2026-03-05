export interface Campaign {
    id?: string;
    id_proyecto?: number;
    metaCampaignId?: string;
    name: string;
    objective: string;
    createdAt?: Date,
    updatedAt?: Date,
    daily_budget?: number,
    bid_strategy?: string,
    status: 'PAUSED' | 'ACTIVE' | 'DELETED' | 'FINALIZED';
    special_ad_categories: string[];
    fecha_creacion?: string;
    conjuntos_anuncios?: AdSet[];
}

export interface AdSet {
    id?: string;
    id_conjunto?: number;
    id_campaign?: string;
    name: string;
    daily_budget?: number;
    status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
    optimization_goal: 'REACH' | 'IMPRESSIONS' | 'LINK_CLICKS' | 'CONVERSIONS' | 'POST_ENGAGEMENT';
    billing_event: 'IMPRESSIONS' | 'LINK_CLICKS';
    // El objeto de segmentación (Targeting)
    // Aquí es donde se mete la edad, género y ubicación
    targeting: {
        geo_locations?: {
            countries?: string[]; // Ej: ["PE"]
            regions?: Array<{ key: string }>;
            cities?: Array<{ key: string, radius: number, distance_unit: 'millas' | 'kilómetros' }>;
        };
        age_min?: number;
        age_max?: number;
        genders?: number[]; // [1] hombres, [2] mujeres, omitir para ambos
        publisher_platforms?: string[]; // ["facebook", "instagram", "messenger", "audience_network"]
    };

    // Objeto promocionado (Obligatorio si el objetivo es Conversión/Ventas)
    promoted_object?: {
        pixel_id?: string;
        custom_event_type?: 'PURCHASE' | 'LEAD' | 'COMPLETE_REGISTRATION';
        page_id?: string; // Obligatorio para campañas de interacción con página
    };

    // Metadatos de lectura
    created_time?: string;
    updated_time?: string;
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
