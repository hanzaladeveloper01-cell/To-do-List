export type Priority = 'low' | 'medium' | 'high';
export type UserRole = 'admin' | 'user';

export interface AppUser {
  uid: string;
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
  userId: string;
}

export type FilterType = 'all' | 'active' | 'completed' | 'important';
export type SortType = 'date' | 'priority' | 'alphabetical';
