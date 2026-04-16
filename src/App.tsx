import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  LayoutDashboard, 
  Trash2, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Flag,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api } from './lib/api';
import Sidebar from './components/Sidebar';
import TaskInput from './components/TaskInput';
import TaskCard from './components/TaskCard';
import ToastContainer, { Toast } from './components/Toast';
import DeleteModal from './components/DeleteModal';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import { Todo, FilterType, SortType, Priority, AppUser } from './types';
import { cn } from './lib/utils';

// --- Protected Route Component ---
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('taskmaster-token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await api.get('/auth/me');
        setUser(userData);
      } catch (err) {
        localStorage.removeItem('taskmaster-token');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
};

function MainApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType | 'dashboard' | 'admin'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; todoId: string; title: string }>({
    isOpen: false,
    todoId: '',
    title: ''
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Sync navigation state with filter
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') setFilter('dashboard');
    else if (path === '/admin') setFilter('admin');
    else if (path === '/') setFilter('all');
    else if (path === '/active') setFilter('active');
    else if (path === '/completed') setFilter('completed');
    else if (path === '/important') setFilter('important');
  }, [location]);

  const handleSetFilter = (newFilter: any) => {
    if (newFilter === 'dashboard') navigate('/dashboard');
    else if (newFilter === 'admin') navigate('/admin');
    else if (newFilter === 'all') navigate('/');
    else navigate(`/${newFilter}`);
  };

  // --- Toast Logic ---
  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Data Sync ---
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await api.get('/tasks');
        setTodos(tasks);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        addToast('Failed to load tasks', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // --- Handlers ---
  const handleAddTask = async (taskData: { text: string; description: string; priority: Priority; dueDate: string }) => {
    try {
      const newTask = await api.post('/tasks', taskData);
      setTodos(prev => [newTask, ...prev]);
      addToast('Task created successfully');
    } catch (error) {
      console.error('Failed to add task:', error);
      addToast('Failed to create task', 'error');
    }
  };

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      const updatedTask = await api.patch(`/tasks/${id}`, { completed: !todo.completed });
      setTodos(prev => prev.map(t => t.id === id ? updatedTask : t));
      if (!todo.completed) addToast('Task marked as completed');
    } catch (error) {
      console.error('Failed to toggle task:', error);
      addToast('Failed to update task', 'error');
    }
  };

  const handleDeleteRequest = (id: string, title: string) => {
    setDeleteModal({ isOpen: true, todoId: id, title });
  };

  const confirmDelete = async () => {
    const id = deleteModal.todoId;
    try {
      await api.delete(`/tasks/${id}`);
      setTodos(prev => prev.filter(t => t.id !== id));
      setDeleteModal({ isOpen: false, todoId: '', title: '' });
      addToast('Task deleted', 'info');
    } catch (error) {
      console.error('Failed to delete task:', error);
      addToast('Failed to delete task', 'error');
    }
  };

  const handleEditTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTask = await api.patch(`/tasks/${id}`, updates);
      setTodos(prev => prev.map(t => t.id === id ? updatedTask : t));
      if (updates.text) addToast('Task updated');
    } catch (error) {
      console.error('Failed to edit task:', error);
      addToast('Failed to update task', 'error');
    }
  };

  const clearCompleted = async () => {
    const completedTasks = todos.filter(t => t.completed);
    if (completedTasks.length === 0) return;
    
    try {
      await api.delete('/tasks/completed/clear');
      setTodos(prev => prev.filter(t => !t.completed));
      addToast(`${completedTasks.length} tasks removed from history`, 'info');
    } catch (error) {
      console.error('Failed to clear completed tasks:', error);
      addToast('Failed to clear history', 'error');
    }
  };

  // --- Filtering & Sorting ---
  const filteredAndSortedTodos = useMemo(() => {
    let result = [...todos];

    if (searchQuery) {
      result = result.filter(t => 
        t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter === 'active') result = result.filter(t => !t.completed);
    if (filter === 'completed') result = result.filter(t => t.completed);
    if (filter === 'important') result = result.filter(t => t.priority === 'high');

    result.sort((a, b) => {
      if (sortBy === 'date') return b.createdAt - a.createdAt;
      if (sortBy === 'priority') {
        const pMap = { high: 3, medium: 2, low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      if (sortBy === 'alphabetical') return a.text.localeCompare(b.text);
      return 0;
    });

    return result;
  }, [todos, filter, searchQuery, sortBy]);

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length
  };

  const renderContent = () => {
    if (filter === 'dashboard') return <Dashboard todos={todos} />;
    if (filter === 'admin') return <AdminPanel />;

    return (
      <div className="p-10 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-end justify-between"
        >
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {filter === 'all' ? 'Master Task List' : 
               filter === 'active' ? 'Daily Priorities' : 
               filter === 'important' ? 'High Priority Tasks' : 'Complete Tasks History'}
            </h2>
            <p className="text-slate-400 font-medium">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {filter === 'completed' && stats.completed > 0 && (
            <button
              onClick={clearCompleted}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          )}
        </motion.div>

        <TaskInput onAdd={handleAddTask} />

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredAndSortedTodos.map((todo) => (
                <TaskCard 
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onDelete={() => handleDeleteRequest(todo.id, todo.text)}
                  onEdit={handleEditTodo}
                />
              ))}
            </AnimatePresence>
          )}

          {!loading && filteredAndSortedTodos.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                {filter === 'completed' ? (
                  <CheckCircle2 className="w-10 h-10 text-slate-300" />
                ) : filter === 'important' ? (
                  <Flag className="w-10 h-10 text-slate-300" />
                ) : (
                  <LayoutDashboard className="w-10 h-10 text-slate-300" />
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">
                {filter === 'completed' ? 'Task archive is currently up to date.' : 
                 filter === 'important' ? 'No high priority tasks' : 'No tasks found'}
              </h3>
              <p className="text-slate-400 max-w-xs">
                {filter === 'completed' 
                  ? 'All your finished objectives have been processed and archived.' 
                  : filter === 'important'
                  ? 'Focus on your current goals or mark a task as high priority.'
                  : 'Try adjusting your filters or search query to find what you\'re looking for.'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar currentFilter={filter} setFilter={handleSetFilter} stats={stats} />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
        <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              {(['date', 'priority', 'alphabetical'] as SortType[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    sortBy === s 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        taskTitle={deleteModal.title}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><MainApp /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="/active" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="/completed" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="/important" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}
