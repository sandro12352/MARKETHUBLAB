import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../interface/client.interface';
import { environment } from '../../../../environments/environment';
import { ClientFile } from '../interface/client-file.inteface';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private readonly http = inject(HttpClient);

  /**
   * Get all clients
   * @returns Observable<Client[]>
   */
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${environment.apiUrl}/api/clients/all`,);
  }


  getClientWithTasks(): Observable<ClientFile[]> {
    return this.http.get<ClientFile[]>(`${environment.apiUrl}/api/client-file`);
  }

  /**
   * Get a single client by ID
   * @param clientId - The client ID
   * @returns Observable<Client>
   */
  getClientById(clientId: string): Observable<Client> {
    return this.http.get<Client>(`${environment.apiUrl}/api/clients/${clientId}`);
  }


  getClienteFile(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/clients/file`);
  }

  /**
   * Create a new client
   * @param client - The client data
   * @returns Observable<Client>
   */
  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>('/api/clients', client);
  }

  /**
   * Update a client
   * @param clientId - The client ID
   * @param client - The updated client data
   * @returns Observable<Client>
   */
  updateClient(clientId: string, client: Client): Observable<Client> {
    return this.http.put<Client>(`/api/clients/${clientId}`, client);
  }

  /**
   * Delete a client
   * @param clientId - The client ID
   * @returns Observable<void>
   */
  deleteClient(clientId: string): Observable<void> {
    return this.http.delete<void>(`/api/clients/${clientId}`);
  }


}
