export interface Cliente {
    id_cliente:        number;
    id_usuario:        number;
    dni?:               string;
    ruc?:               string;
    nombres:           string;
    apellidos:         string;
    nombre_empresa?:    string;
    instagram?:         string;
    tiktok?:            string;
    telefono:          string;
    fecha_nacimiento:  Date;
    fecha_aniversario?: Date;
    fecha_registro:    Date;
}