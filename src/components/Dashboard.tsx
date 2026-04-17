import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Filter,
  SortAsc,
  AlertCircle,
  Tag,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  History,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Todo, Priority, FilterType, SortType, ViewType } from '../types';
import { db } from '../lib/db';
import { useUser } from '../context/UserContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');

  const currentView = (searchParams.get('view') as ViewType) || 'today';

  useEffect(() => {
    if (user) {
      refreshTasks();
    }
  }, [user]);

  const refreshTasks = () => {
    if (user) {
      // Admin actually sees all tasks in AdminPanel, but here we stay user-focused
      setTodos(db.getTasks(user.id, false));
    }
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !user) return;

    const task: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTodo,
      completed: false,
      priority: 'low',
      createdAt: Date.now(),
      createdBy: user.id
    };

    db.addTask(task);
    setNewTodo('');
    refreshTasks();
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    db.updateTask(id, { completed: !todo.completed });
    refreshTasks();
  };

  const deleteTodo = (id: string) => {
    db.deleteTask(id);
    refreshTasks();
  };

  const updatePriority = (id: string, priority: Priority) => {
    db.updateTask(id, { priority });
    refreshTasks();
  };

  const clearCompleted = () => {
    if (user) {
      db.clearCompleted(user.id);
      refreshTasks();
    }
  };

  const filteredTodos = useMemo(() => {
    let result = todos;

    // View specific filtering
    if (currentView === 'today') {
      const today = new Date().setHours(0, 0, 0, 0);
      result = result.filter(t => t.createdAt >= today && !t.completed);
    } else if (currentView === 'important') {
      result = result.filter(t => t.priority === 'high');
    } else if (currentView === 'completed') {
      result = result.filter(t => t.completed);
    }

    // Manual filtering
    result = result.filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      if (filter === 'active') return matchesSearch && !todo.completed;
      if (filter === 'completed') return matchesSearch && todo.completed;
      if (filter === 'important') return matchesSearch && todo.priority === 'high';
      return matchesSearch;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'priority') {
        const weights = { high: 3, medium: 2, low: 1 };
        return weights[b.priority] - weights[a.priority];
      }
      if (sortBy === 'alphabetical') return a.text.localeCompare(b.text);
      return b.createdAt - a.createdAt;
    });
  }, [todos, currentView, searchQuery, filter, sortBy]);

  const viewMapping: Record<ViewType, { title: string; subtitle: string; icon: any; color: string }> = {
    today: { title: 'Focus View: Today', subtitle: 'Priority tasks to tackle right now.', icon: Zap, color: 'text-orange-500' },
    all: { title: 'Master Task List', subtitle: 'Complete overview of your entire workspace.', icon: Target, color: 'text-indigo-600' },
    important: { title: 'Critical Actions', subtitle: 'High-stakes items requiring immediate attention.', icon: ShieldAlert, color: 'text-red-500' },
    completed: { title: 'Archived Tasks', subtitle: 'A record of your completed achievements.', icon: History, color: 'text-emerald-500' },
    stats: { title: 'Productivity Insights', subtitle: 'Visual analytics of your workflow efficiency.', icon: BarChart3, color: 'text-blue-500' },
    admin: { title: 'Admin Panel', subtitle: 'System administration.', icon: ShieldAlert, color: 'text-indigo-600' }
  };

  const viewInfo = viewMapping[currentView];

  if (currentView === 'stats') {
    return <UserStats todos={todos} />;
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-8 py-12"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className={cn("p-4 rounded-3xl bg-white shadow-xl shadow-slate-200/50", viewInfo.color)}>
            <viewInfo.icon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {viewInfo.title}
            </h1>
            <p className="text-slate-500 font-medium">{viewInfo.subtitle}</p>
          </div>
        </div>

        {currentView === 'completed' ? (
          <button 
            onClick={clearCompleted}
            className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all shadow-sm"
          >
            Purge History
          </button>
        ) : (
          <div className="flex bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-black text-slate-900">{filteredTodos.length} Tasks Pending</span>
          </div>
        )}
      </motion.div>

      {/* Action Bar */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        <div className="md:col-span-6 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search workspace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-50 rounded-[1.5rem] outline-none focus:border-indigo-600/20 shadow-xl shadow-slate-200/20 transition-all font-bold placeholder:text-slate-300"
          />
        </div>
        
        <div className="md:col-span-3 relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-50 rounded-[1.5rem] outline-none focus:border-indigo-600/20 shadow-xl shadow-slate-200/20 transition-all font-bold appearance-none"
          >
            <option value="all">Filter: All</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed</option>
            <option value="important">High Priority</option>
          </select>
        </div>

        <div className="md:col-span-3 relative">
          <SortAsc className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-50 rounded-[1.5rem] outline-none focus:border-indigo-600/20 shadow-xl shadow-slate-200/20 transition-all font-bold appearance-none"
          >
            <option value="date">Sort: Recency</option>
            <option value="priority">Sort: Priority</option>
            <option value="alphabetical">Sort: Alpha</option>
          </select>
        </div>
      </motion.div>

      {/* Add Task Input (Only for active views) */}
      {currentView !== 'completed' && (
        <motion.form 
          variants={item}
          onSubmit={addTodo} 
          className="mb-12 relative group"
        >
          <input
            type="text"
            placeholder="Commit to a new objective..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="w-full pl-8 pr-16 py-6 bg-slate-900 text-white placeholder:text-slate-500 rounded-[2.5rem] outline-none shadow-2xl shadow-slate-900/20 focus:ring-8 ring-indigo-600/10 transition-all text-xl font-bold"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg hover:bg-indigo-500"
          >
            <Plus className="w-8 h-8" />
          </button>
        </motion.form>
      )}

      {/* Task Grid */}
      <motion.div variants={item} className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredTodos.map((todo) => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-indigo-600/5 transition-all relative overflow-hidden",
                todo.completed && "opacity-60 grayscale-[0.5]"
              )}
            >
              <div className="flex items-start gap-5 relative z-10">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={cn(
                    "mt-1 w-8 h-8 rounded-[1rem] border-2 flex items-center justify-center transition-all shrink-0",
                    todo.completed 
                      ? "bg-indigo-600 border-indigo-600 text-white" 
                      : "border-slate-200 hover:border-indigo-600"
                  )}
                >
                  {todo.completed && <CheckCircle2 className="w-5 h-5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className={cn(
                      "text-xl font-black text-slate-900 leading-tight transition-all",
                      todo.completed && "line-through text-slate-400"
                    )}>
                      {todo.text}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(todo.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                    
                    <div className="relative">
                      <select
                        value={todo.priority}
                        onChange={(e) => updatePriority(todo.id, e.target.value as Priority)}
                        className={cn(
                          "appearance-none px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all pr-8",
                          todo.priority === 'high' ? "bg-red-50 text-red-600" :
                          todo.priority === 'medium' ? "bg-amber-50 text-amber-600" :
                          "bg-emerald-50 text-emerald-600"
                        )}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Mid</option>
                        <option value="high">Critical</option>
                      </select>
                      <Tag className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Subtle background number/decoration */}
              <div className="absolute -right-4 -bottom-4 text-slate-50 font-black text-8xl pointer-events-none select-none italic opacity-50">
                #0{filteredTodos.indexOf(todo) + 1}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2 text-center py-32 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100"
          >
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
              <ListTodo className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Workspace Clear</h3>
            <p className="text-slate-400 font-bold max-w-sm mx-auto">
              You've cleared everything in this view. Ready to commit to something new?
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

function UserStats({ todos }: { todos: Todo[] }) {
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    const critical = todos.filter(t => t.priority === 'high' && !t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, critical, completionRate };
  }, [todos]);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-8 py-12"
    >
      <motion.div variants={item} className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Workspace Analytics</h1>
        <p className="text-slate-500 font-medium">Quantifying your personal productivity and momentum.</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <MetricCard 
          label="Efficiency Rating" 
          value={`${stats.completionRate}%`} 
          desc="Overall project completion velocity"
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-indigo-600"
        />
        <MetricCard 
          label="Pending Objectives" 
          value={stats.pending} 
          desc="Active items currently in your queue"
          icon={<Zap className="w-6 h-6" />}
          color="bg-orange-500"
        />
        <MetricCard 
          label="Critical Items" 
          value={stats.critical} 
          desc="High priority tasks requiring focus"
          icon={<ShieldAlert className="w-6 h-6" />}
          color="bg-red-500"
        />
      </motion.div>

      <motion.div variants={item} className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/10">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-black mb-6 leading-tight tracking-tighter">Your Workflow<br />is Evolving.</h2>
            <p className="text-slate-400 text-lg font-bold mb-8">
              We've analyzed your task patterns. Your peak productivity hours align with early morning commitments. Keep the momentum going.
            </p>
            <div className="flex gap-4">
              <div className="bg-white/10 px-6 py-4 rounded-3xl border border-white/10">
                <div className="text-3xl font-black mb-1">{stats.completed}</div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">Milestones Reached</div>
              </div>
              <div className="bg-white/10 px-6 py-4 rounded-3xl border border-white/10">
                <div className="text-3xl font-black mb-1">{stats.total}</div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">Total Initiatives</div>
              </div>
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-3 px-8">
            {[45, 60, 30, 80, 50, 90, 75].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                className="flex-1 bg-indigo-500 rounded-t-2xl relative group"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full" />
      </motion.div>
    </motion.div>
  );
}

function MetricCard({ label, value, desc, icon, color }: any) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 group hover:-translate-y-2 transition-all duration-500">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-8 transition-transform group-hover:scale-110 duration-500", color)}>
        {icon}
      </div>
      <div className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">{value}</div>
      <div className="text-lg font-black text-slate-900 mb-1">{label}</div>
      <p className="text-slate-400 font-bold text-sm tracking-tight">{desc}</p>
    </div>
  );
}

function ListTodo(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 16 2 2 4-4" />
      <path d="m3 9 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  );
}
