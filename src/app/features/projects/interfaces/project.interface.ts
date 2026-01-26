import { Cliente } from "../../clients/interface/client.interface";

export interface Project {
    id_proyecto:    number;
    nombre:         string;
    id_cliente:     number;
    estado:         string;
    prioridad:      string;
    descripcion?:   string;
    presupuesto:    string;
    progress:       number;
    fecha_registro: Date;
    fecha_termino:  Date;
    cliente:        Cliente;
}


