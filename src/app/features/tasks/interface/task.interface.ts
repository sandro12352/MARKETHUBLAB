export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected';
  completedDate?: string;
  reviewer?: string;
}
