export type Priority = 'low' | 'medium' | 'high';
export type UserRole = 'ADMIN' | 'USER';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: number;
}

export interface Todo {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  createdAt: number;
  createdBy: string; // User ID
}

export interface TaskMasterDB {
  users: AppUser[];
  tasks: Todo[];
}

export type FilterType = 'all' | 'active' | 'completed' | 'important';
export type SortType = 'date' | 'priority' | 'alphabetical';
