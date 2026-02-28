export interface Escena {
    id_escena?: number;
    id_plan_grabacion?: number;
    tema: string;
    valor_plano: string;
    movimiento_camara: string;
    requerimientos?: string;
    speech: string;
    nota?: string;
    referencia?: string;
}

export interface PlanGrabacion {
    id_plan_grabacion?: number;
    id_proyecto: number;
    estado: 'pendiente' | 'en_progreso' | 'aprobado' | 'rechazado';
    fecha_envio?: Date;
    fecha_respuesta?: Date;
    observacion_cliente?: string;
    escenas: Escena[];
}
