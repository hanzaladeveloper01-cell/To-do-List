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
      setTodos(db.getTasks(user.id, false));
    }
  };

  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
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

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    return { 
      total, 
      completed, 
      pending, 
      percent: total > 0 ? Math.round((completed / total) * 100) : 0 
    };
  }, [todos]);

  if (currentView === 'stats') {
    return <UserStats todos={todos} />;
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-10 py-16"
    >
      {/* Header - Unified Horizontal */}
      <motion.div variants={item} className="mb-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className={cn("w-16 h-16 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center border border-slate-50", viewInfo.color)}>
            <viewInfo.icon className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
              {viewInfo.title}
            </h1>
            <p className="text-slate-400 font-bold text-sm tracking-wide">{viewInfo.subtitle}</p>
          </div>
        </div>

        <div className="flex bg-blue-50/50 px-6 py-3 rounded-2xl border border-blue-600/10 items-center gap-3">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-black text-blue-800 tracking-tight">{filteredTodos.length} Tasks Pending</span>
        </div>
      </motion.div>

      {/* Action Bar & Smart Input Bar */}
      <motion.div variants={item} className="space-y-4 mb-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-12">
            <motion.div 
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative group col-span-full"
            >
              <input
                type="text"
                placeholder="Commit to a new objective..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-8 pr-20 py-6 bg-white border border-slate-200/60 rounded-[2rem] outline-none shadow-xl shadow-slate-100/50 focus:border-blue-600/20 focus:ring-8 ring-blue-600/5 transition-all text-lg font-bold placeholder:text-slate-300"
              />
              <button
                onClick={() => addTodo()}
                title="Add Task"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-blue-600 text-white rounded-[1.25rem] flex items-center justify-center hover:scale-105 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 group/btn overflow-hidden"
              >
                <Plus className="w-7 h-7 stroke-[3]" />
                <span className="sr-only">Add Task</span>
              </button>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search workspace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200/40 rounded-2xl outline-none focus:border-blue-600/20 focus:bg-white transition-all font-bold text-sm placeholder:text-slate-300"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200/40 rounded-2xl outline-none focus:border-blue-600/20 focus:bg-white transition-all font-bold text-sm appearance-none cursor-pointer"
            >
              <option value="all">Filter: All</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed</option>
              <option value="important">High Priority</option>
            </select>
          </div>

          <div className="relative">
            <SortAsc className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200/40 rounded-2xl outline-none focus:border-blue-600/20 focus:bg-white transition-all font-bold text-sm appearance-none cursor-pointer"
            >
              <option value="date">Sort: Recency</option>
              <option value="priority">Sort: Priority</option>
              <option value="alphabetical">Sort: Alpha</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Task List */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredTodos.map((todo) => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, x: -20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "group bg-white pl-7 pr-6 py-4 rounded-[2rem] border border-slate-200/50 shadow-sm hover:shadow-xl hover:shadow-blue-600/[0.04] hover:border-blue-600/20 transition-all duration-500 relative flex items-center gap-6 overflow-hidden",
                todo.completed && "opacity-60 bg-slate-50/50 grayscale-[0.2]"
              )}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(todo.id)}
                className={cn(
                  "w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-500 shrink-0",
                  todo.completed 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "border-slate-200 hover:border-blue-600 hover:scale-110 active:scale-90"
                )}
              >
                {todo.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
              </button>

              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "text-[17px] font-black text-slate-900 tracking-tight transition-all duration-500",
                  todo.completed && "line-through text-slate-400 decoration-slate-300 font-bold"
                )}>
                  {todo.text}
                </h3>
              </div>

              <div className="flex items-center gap-8 shrink-0">
                {/* Priority Dot */}
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    todo.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                    todo.priority === 'medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                    'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  )} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{todo.priority}</span>
                </div>

                <div className="flex items-center gap-2 group-hover:scale-110 transition-transform">
                  <Clock className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-xs font-bold text-slate-400 tabular-nums">
                    {new Date(todo.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-40 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-200/60"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-200/50 border border-slate-50"
            >
              <ListTodo className="w-10 h-10 text-slate-300 stroke-[1.5]" />
            </motion.div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Workspace Clear</h3>
            <p className="text-slate-400 font-bold max-w-sm mx-auto tracking-tight">
              You've cleared everything in this view. Ready to commit to something new?
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Progress Bar Footer */}
      <motion.div variants={item} className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 group">
          <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              className="h-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]" 
            />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <span className="text-slate-900">{stats.completed}</span> of <span className="text-slate-900">{stats.total}</span> initiatives finalized
          </span>
        </div>

        <div className="flex items-center gap-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            TaskMaster Elite Engine v1.0
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-blue-600" />
            Global Sync Active
          </div>
        </div>
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
