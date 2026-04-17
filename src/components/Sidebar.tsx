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
    return location.pathname === '/dashboard' && currentView === item.id;
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <ListTodo className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">TaskMaster</span>
        </div>

        <nav className="space-y-2">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all group",
                isActive(item)
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive(item) ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-6">
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 font-black shadow-sm">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{user?.displayName}</p>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-600 rounded-xl text-xs font-black hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
