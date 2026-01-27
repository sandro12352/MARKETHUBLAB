import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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

export type Client = {
  invoice: string;
  paymentStatus: 'Paid' | 'Pending' | 'Unpaid';
  totalAmount: string;
  paymentMethod: string;
  tasks?: Task[];
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
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientsComponent {
  protected _invoices: Client[] = [
    {
      invoice: 'Cliente1',
      paymentStatus: 'Paid',
      totalAmount: '$250.00',
      paymentMethod: 'Credit Card',
      tasks: [
        {
          id: 'T001',
          title: 'Diseño de Banner',
          description: 'Banner promocional para campaña navideña',
          dueDate: '2025-01-20',
          status: 'pending',
          completedDate: '2025-01-19',
        },
        {
          id: 'T002',
          title: 'Copywriting para Email',
          description: 'Redacción de email marketing',
          dueDate: '2025-01-22',
          status: 'approved',
          completedDate: '2025-01-18',
          reviewer: 'Carlos López',
        },
      ],
    },
    {
      invoice: 'Cliente2',
      paymentStatus: 'Pending',
      totalAmount: '$150.00',
      paymentMethod: 'PayPal',
      tasks: [
        {
          id: 'T003',
          title: 'Análisis de Competencia',
          description: 'Análisis competitivo del mercado',
          dueDate: '2025-01-25',
          status: 'rejected',
          completedDate: '2025-01-19',
          reviewer: 'María García',
        },
      ],
    },
    {
      invoice: 'INV003',
      paymentStatus: 'Unpaid',
      totalAmount: '$350.00',
      paymentMethod: 'Bank Transfer',
      tasks: [
        {
          id: 'T004',
          title: 'Estrategia Social Media',
          description: 'Plan de contenido para redes sociales',
          dueDate: '2025-01-28',
          status: 'pending',
        },
      ],
    },
    {
      invoice: 'INV004',
      paymentStatus: 'Paid',
      totalAmount: '$450.00',
      paymentMethod: 'Credit Card',
      tasks: [],
    },
    {
      invoice: 'INV005',
      paymentStatus: 'Paid',
      totalAmount: '$550.00',
      paymentMethod: 'PayPal',
      tasks: [
        {
          id: 'T005',
          title: 'Desarrollo Landing Page',
          description: 'Página de destino responsive',
          dueDate: '2025-01-30',
          status: 'approved',
          completedDate: '2025-01-15',
          reviewer: 'Roberto Díaz',
        },
      ],
    },
    {
      invoice: 'INV006',
      paymentStatus: 'Pending',
      totalAmount: '$200.00',
      paymentMethod: 'Bank Transfer',
      tasks: [],
    },
    {
      invoice: 'INV007',
      paymentStatus: 'Unpaid',
      totalAmount: '$300.00',
      paymentMethod: 'Credit Card',
      tasks: [
        {
          id: 'T006',
          title: 'Creación de Infografía',
          description: 'Infografía de estadísticas del negocio',
          dueDate: '2025-02-01',
          status: 'pending',
        },
      ],
    },
  ];

  protected expandedRows: Set<string> = new Set();

  toggleRowExpand(invoiceId: string): void {
    if (this.expandedRows.has(invoiceId)) {
      this.expandedRows.delete(invoiceId);
    } else {
      this.expandedRows.add(invoiceId);
    }
  }

  isRowExpanded(invoiceId: string): boolean {
    return this.expandedRows.has(invoiceId);
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