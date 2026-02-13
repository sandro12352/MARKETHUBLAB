import { Project } from "./project.interface";

export interface ProjectResponse {
    projects: Project[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

