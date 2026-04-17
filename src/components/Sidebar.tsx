import React from 'react';
import { 
  ListTodo, 
  LayoutDashboard, 
  LogOut,
  ShieldAlert,
  BarChart2,
  ListTodo as ListIcon,
  Zap,
  History
} from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ViewType } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useUser();

  const currentView = searchParams.get('view') || 'today';

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems: { id: ViewType; label: string; icon: any; path: string; role: 'ADMIN' | 'USER' }[] = [
    { id: 'today', label: 'Focus View: Today', icon: Zap, path: '/dashboard?view=today', role: 'USER' },
    { id: 'all', label: 'Master Task List', icon: ListIcon, path: '/dashboard?view=all', role: 'USER' },
    { id: 'important', label: 'Critical Actions', icon: ShieldAlert, path: '/dashboard?view=important', role: 'USER' },
    { id: 'completed', label: 'Archived Tasks', icon: History, path: '/dashboard?view=completed', role: 'USER' },
    { id: 'stats', label: 'Productivity Stats', icon: BarChart2, path: '/dashboard?view=stats', role: 'USER' },
    { id: 'admin', label: 'Admin Panel', icon: ShieldAlert, path: '/admin', role: 'ADMIN' },
  ];

  const filteredNav = navItems.filter(item => item.role === user?.role);

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === 'admin') {
      navigate('/admin');
    } else {
      setSearchParams({ view: item.id });
    }
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.id === 'admin') return location.pathname === '/admin';
    return currentView === item.id;
  };

  return (
    <aside className="w-80 bg-[#F9FBFC] border-r border-slate-200/60 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="p-10 flex flex-col h-full">
        <div className="flex items-center gap-3.5 mb-14 px-2">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl shadow-blue-100/50">
            <ListTodo className="text-white w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight block leading-none">TaskMaster</span>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1 block">Elite</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold transition-all duration-300 group relative",
                isActive(item)
                  ? "bg-blue-50/50 border border-blue-600/20 text-blue-700 shadow-sm shadow-blue-50/50"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-transparent"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-all duration-300",
                isActive(item) ? "text-blue-600 stroke-[2.5]" : "text-slate-400 group-hover:text-slate-600"
              )} />
              <span className={cn(
                "text-[15px] transition-colors",
                isActive(item) ? "font-black" : "font-bold"
              )}>
                {item.label}
              </span>
              
              {isActive(item) && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm shadow-blue-400" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-10">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/40">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg border border-blue-100/50">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-black text-slate-900 truncate">{user?.displayName}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-900 hover:text-white transition-all duration-300 border border-slate-100 group"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
