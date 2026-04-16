import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Todo } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  todos: Todo[];
}

export default function Dashboard({ todos }: DashboardProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      highPriority: todos.filter(t => t.priority === 'high' && !t.completed).length,
      today: todos.filter(t => t.createdAt >= today).length,
      completionRate: todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0
    };
  }, [todos]);

  const nextTasks = useMemo(() => {
    return todos
      .filter(t => !t.completed && t.priority === 'high')
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, 3);
  }, [todos]);

  const cards = [
    { title: 'Total Tasks', value: stats.total, icon: LayoutDashboard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Tasks Today', value: stats.today, icon: Clock, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { title: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'High Priority', value: stats.highPriority, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Performance Overview</h2>
        <p className="text-slate-400 font-medium">Track your productivity and upcoming critical actions.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", card.bg)}>
              <card.icon className={cn("w-6 h-6", card.color)} />
            </div>
            <h3 className="text-slate-500 text-sm font-bold mb-1 uppercase tracking-wider">{card.title}</h3>
            <p className="text-3xl font-black text-slate-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900">Critical Action Items</h3>
            <span className="px-4 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-full">Next 3 Tasks</span>
          </div>

          <div className="space-y-4">
            {nextTasks.length > 0 ? nextTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-rose-500 rounded-full" />
                  <div>
                    <h4 className="font-bold text-slate-900">{task.text}</h4>
                    <p className="text-xs text-slate-400 font-medium">Created {new Date(task.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </div>
            )) : (
              <div className="py-10 text-center">
                <p className="text-slate-400 font-medium">No high priority tasks pending. Great job!</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white flex flex-col items-center justify-center text-center"
        >
          <div className="relative w-40 h-40 mb-6">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" 
              />
              <motion.circle 
                cx="50" cy="50" r="45" 
                fill="none" stroke="white" strokeWidth="10" 
                strokeDasharray="283"
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * stats.completionRate) / 100 }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black">{stats.completionRate}%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Done</span>
            </div>
          </div>
          <h3 className="text-xl font-black mb-2">Daily Progress</h3>
          <p className="text-indigo-100 text-sm font-medium">
            You've completed {stats.completed} out of {stats.total} tasks in your master list.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
