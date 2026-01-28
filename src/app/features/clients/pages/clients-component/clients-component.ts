import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButtonImports } from '@spartan/ui/button';
import { HlmDropdownMenuImports } from '@spartan/ui/dropdown-menu';
import { HlmIconImports } from '@spartan/ui/icon';
import { HlmInputImports } from '@spartan/ui/input';
import { HlmSelectImports } from '@spartan/ui/select';
import { HlmTableImports } from '@spartan/ui/table';
import { ClientsService } from '../../services/clients.service';
import { Client } from '../../interface/client.interface';


export type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected';
  completedDate?: string;
  reviewer?: string;
};



@Component({
  selector: 'app-clients-component',
  imports: [
    CommonModule,
    FormsModule,
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmIconImports,
    HlmInputImports,
    BrnSelectImports,
    HlmSelectImports,
    HlmTableImports,
  ],
  providers: [provideIcons({ lucideChevronDown })],
  host: { class: 'w-full' },
  templateUrl: './clients-component.html',
  styleUrl: './clients-component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientsComponent implements OnInit {
  private clientService = inject(ClientsService);

  activeTab = 'tasks';
  activeTab$ = signal('tasks');

  protected clients = signal<Client[]>([]);
  protected clientWithTasks = signal<any>([]);


  ngOnInit(): void {
    this.clientService.getClients().subscribe({
      next: (clients: Client[]) => {
        this.clients.set(clients);
      }
    })

    this.clientService.getClientWithTasks().subscribe({
      next: (resp: any[]) => {
        this.clientWithTasks.set(resp);
        console.log(this.clientWithTasks());
      }
    })
  }
  protected expandedRows: Set<number> = new Set();

  toggleRowExpand(cliente_id: number): void {
    if (this.expandedRows.has(cliente_id)) {
      this.expandedRows.delete(cliente_id);
    } else {
      this.expandedRows.add(cliente_id);
    }
  }

  isRowExpanded(cliente_id: number): boolean {
    return this.expandedRows.has(cliente_id);
  }

  approveTask(taskId: string): void {
    console.log('Tarea aprobada:', taskId);
    // Aquí irá la lógica para aprobar la tarea
  }

  rejectTask(taskId: string): void {
    console.log('Tarea rechazada:', taskId);
    // Aquí irá la lógica para rechazar la tarea
  }

  getTaskStats(client: Client): { pending: number; approved: number; rejected: number } {
    const tasks = client.tasks || [];
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      approved: tasks.filter(t => t.status === 'approved').length,
      rejected: tasks.filter(t => t.status === 'rejected').length,
    };
  }


}