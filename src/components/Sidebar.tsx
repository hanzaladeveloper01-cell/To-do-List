import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Sun, 
  Star, 
  CheckCircle2, 
  ListTodo, 
  Settings,
  LogOut,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { FilterType, AppUser } from '../types';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  currentFilter: FilterType | 'dashboard' | 'admin';
  setFilter: (filter: any) => void;
  stats: {
    total: number;
    completed: number;
  };
}

export default function Sidebar({ currentFilter, setFilter, stats }: SidebarProps) {
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/auth/me');
        setUserProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'all', label: 'Master Task List', icon: LayoutDashboard },
    { id: 'active', label: 'Daily Priorities', icon: Sun },
    { id: 'important', label: 'High Priority Tasks', icon: Star },
    { id: 'completed', label: 'Task History', icon: CheckCircle2 },
  ];

  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const handleLogout = () => {
    localStorage.removeItem('taskmaster-token');
    navigate('/auth');
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen sidebar-shadow z-20">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <ListTodo className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">TaskMaster Elite</h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                currentFilter === item.id
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", currentFilter === item.id ? "text-indigo-600" : "text-slate-400")} />
              {item.label}
            </button>
          ))}

          {userProfile?.role === 'admin' && (
            <button
              onClick={() => setFilter('admin')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mt-4",
                currentFilter === 'admin'
                  ? "bg-rose-50 text-rose-600"
                  : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
              )}
            >
              <ShieldCheck className={cn("w-5 h-5", currentFilter === 'admin' ? "text-rose-600" : "text-slate-400")} />
              Admin Panel
            </button>
          )}
        </nav>
      </div>

      <div className="mt-auto p-8">
        {/* User Profile Info */}
        <div className="mb-8 px-4 py-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              {userProfile?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{userProfile?.displayName || 'User'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userProfile?.role || 'Member'}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Daily Progress</span>
            <span className="text-xs font-bold text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium">
            {stats.completed} of {stats.total} tasks completed
          </p>
        </div>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
