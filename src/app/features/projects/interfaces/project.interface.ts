import { Client } from "../../clients/interface/client.interface";

export interface Project {
    id_cliente?:     number;
    id_proyecto?:    number;
    nombre:         string;
    estado:         string;
    prioridad:      string;
    descripcion?:   string | null;
    cantidad_material:    number;
    progress?:       number;
    fecha_registro?: Date;
    fecha_termino:  Date;
    cliente?:        Client;
    plan_grabacion_url?:string
}


