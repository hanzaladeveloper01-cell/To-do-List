import { TaskMasterDB, AppUser, Todo } from '../types';

const DB_KEY = 'taskmaster_db';

const getInitialDB = (): TaskMasterDB => ({
  users: [],
  tasks: []
});

export const db = {
  get(): TaskMasterDB {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : getInitialDB();
  },

  save(data: TaskMasterDB) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  },

  // User operations
  addUser(user: AppUser) {
    const data = this.get();
    data.users.push(user);
    this.save(data);
  },

  getUserByEmail(email: string): AppUser | undefined {
    return this.get().users.find(u => u.email === email);
  },

  // Task operations
  getTasks(userId: string, isAdmin: boolean): Todo[] {
    const data = this.get();
    if (isAdmin) return data.tasks;
    return data.tasks.filter(t => t.createdBy === userId);
  },

  addTask(task: Todo) {
    const data = this.get();
    data.tasks.push(task);
    this.save(data);
  },

  updateTask(id: string, updates: Partial<Todo>) {
    const data = this.get();
    const index = data.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      data.tasks[index] = { ...data.tasks[index], ...updates };
      this.save(data);
      return data.tasks[index];
    }
    return null;
  },

  deleteTask(id: string) {
    const data = this.get();
    data.tasks = data.tasks.filter(t => t.id !== id);
    this.save(data);
  },

  clearCompleted(userId: string) {
    const data = this.get();
    data.tasks = data.tasks.filter(t => !(t.createdBy === userId && t.completed));
    this.save(data);
  },

  // Admin stats
  getStats() {
    const data = this.get();
    return {
      totalUsers: data.users.length,
      totalTasks: data.tasks.length,
      completedTasks: data.tasks.filter(t => t.completed).length,
      activeUsers: new Set(data.tasks.map(t => t.createdBy)).size
    };
  }
};
