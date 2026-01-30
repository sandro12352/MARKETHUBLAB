import { User } from "../services/auth-service";

export interface AuthResponse {
    token:string,
    user:User,
    nombre_completo:string,
}