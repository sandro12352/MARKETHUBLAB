import { Client } from "../../clients/interface/client.interface";

export interface Contrato {
    id_contrato: number;
    id_cliente: number;
    id_trabajador: number;
    contrato_url: string;
    plan_marketing_url: string;
    firma_url?: string;
    observacion: string;
    fecha_creacion?: string;
    nombre_cliente?: string;
    cliente?: Client
}

export interface ContractUploadPayload {
    id_cliente: number;
    contratoFile: File;
    planMarketingFile: File;
}
