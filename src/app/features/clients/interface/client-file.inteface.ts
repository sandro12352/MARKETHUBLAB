import { Task } from "../../tasks/interface/task.interface";
import { Client } from "./client.interface";

export interface ClientFile {
    cliente: Client;
    tareas:  Task[];
}


