import React, { useState, useEffect } from 'react';
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
  Tag
} from 'lucide-react';
import { Todo, Priority, FilterType, SortType } from '../types';
import { db } from '../lib/db';
import { useUser } from '../context/UserContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const { user } = useUser();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');

  useEffect(() => {
    if (user) {
      setTodos(db.getTasks(user.id, false));
    }
  }, [user]);

  const refreshTasks = () => {
    if (user) {
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

  const filteredTodos = todos
    .filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      if (filter === 'active') return matchesSearch && !todo.completed;
      if (filter === 'completed') return matchesSearch && todo.completed;
      if (filter === 'important') return matchesSearch && todo.priority === 'high';
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const weights = { high: 3, medium: 2, low: 1 };
        return weights[b.priority] - weights[a.priority];
      }
      if (sortBy === 'alphabetical') return a.text.localeCompare(b.text);
      return b.createdAt - a.createdAt;
    });

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Daily Priorities
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <button 
          onClick={clearCompleted}
          className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          Clear Completed
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        <div className="md:col-span-6 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600/20 shadow-sm transition-all font-medium"
          />
        </div>
        
        <div className="md:col-span-3 relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600/20 shadow-sm transition-all font-medium appearance-none"
          >
            <option value="all">All Tasks</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="important">Important</option>
          </select>
        </div>

        <div className="md:col-span-3 relative">
          <SortAsc className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600/20 shadow-sm transition-all font-medium appearance-none"
          >
            <option value="date">Newest First</option>
            <option value="priority">Priority</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>
      </div>

      {/* Add Task */}
      <form onSubmit={addTodo} className="mb-12 relative group">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="w-full pl-6 pr-16 py-5 bg-indigo-600 text-white placeholder:text-indigo-200 rounded-[2rem] outline-none shadow-xl shadow-indigo-200 focus:ring-4 ring-indigo-600/10 transition-all text-lg font-bold"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </button>
      </form>

      {/* Task List */}
      <div className="grid gap-4 grid-cols-1">
        <AnimatePresence mode="popLayout">
          {filteredTodos.map((todo) => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all",
                todo.completed && "opacity-60"
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={cn(
                    "mt-1 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all",
                    todo.completed 
                      ? "bg-indigo-600 border-indigo-600 text-white" 
                      : "border-slate-200 hover:border-indigo-600"
                  )}
                >
                  {todo.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "text-lg font-bold text-slate-900 truncate transition-all",
                      todo.completed && "line-through text-slate-400"
                    )}>
                      {todo.text}
                    </h3>
                    {todo.priority === 'high' && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider rounded-md">
                        Critical
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(todo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <select
                        value={todo.priority}
                        onChange={(e) => updatePriority(todo.id, e.target.value as Priority)}
                        className="bg-transparent outline-none cursor-pointer hover:text-indigo-600 transition-colors"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200"
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <AlertCircle className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">No tasks found</h3>
            <p className="text-slate-400 font-medium">Try adding a new priority.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
