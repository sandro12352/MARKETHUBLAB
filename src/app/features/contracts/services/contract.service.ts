import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Contrato } from '../interfaces/contract.interface';

@Injectable({
    providedIn: 'root',
})
export class ContractService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/contracts`;

    /**
     * Obtiene todos los contratos registrados.
     */
    getContratos(token: string): Observable<Contrato[]> {
        return this.http.get<Contrato[]>(this.apiUrl, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    /**
     * Sube el contrato y el plan de marketing de forma simultánea para un cliente.
     */
    subirContratoYPlan(
        idCliente: number,
        contratoFile: File,
        planFile: File,
        token: string
    ): Observable<Contrato> {
        const formData = new FormData();
        formData.append('id_cliente', idCliente.toString());
        formData.append('contrato_url', contratoFile);
        formData.append('plan_marketing_url', planFile);

        return this.http.post<Contrato>(`${this.apiUrl}`, formData, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    /**
     * Obtiene el detalle de un contrato específico.
     */
    getContratoById(id: number, token: string): Observable<Contrato> {
        return this.http.get<Contrato>(`${this.apiUrl}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }
}
