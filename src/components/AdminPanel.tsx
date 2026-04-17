import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  BarChart3, 
  Shield, 
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { db } from '../lib/db';
import { AppUser } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AdminPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    activeUsers: 0
  });

  useEffect(() => {
    const data = db.get();
    setUsers(data.users);
    setStats(db.getStats());
  }, []);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-10 py-16"
    >
      {/* Header Section */}
      <motion.div variants={item} className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-xs font-black uppercase tracking-widest mb-6">
            <Shield className="w-4 h-4" />
            Control Center
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
            Force Management<br />Overview.
          </h1>
          <p className="text-xl text-slate-500 font-bold max-w-xl leading-relaxed">
            Monitor system-wide initiative velocity and oversee participant enrollment in the TaskMaster ecosystem.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex items-center gap-6">
          <div className="text-right">
            <div className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">{stats.totalTasks}</div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Sync Events</div>
          </div>
          <div className="w-px h-12 bg-slate-100" />
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      </motion.div>

      {/* Grid Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <KPIBox 
          label="Total Enrollment" 
          value={stats.totalUsers} 
          icon={<Users className="w-6 h-6" />} 
          trend="+12%"
          color="bg-indigo-600"
        />
        <KPIBox 
          label="Task Velocity" 
          value={stats.totalTasks} 
          icon={<Layers className="w-6 h-6" />} 
          trend="+5.4k"
          color="bg-slate-900"
        />
        <KPIBox 
          label="Success Rate" 
          value={`${Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%`} 
          icon={<CheckCircle2 className="w-6 h-6" />} 
          trend="Optimal"
          color="bg-emerald-500"
        />
        <KPIBox 
          label="Peak Concurrency" 
          value={stats.activeUsers} 
          icon={<UserCheck className="w-6 h-6" />} 
          trend="Live"
          color="bg-orange-500"
        />
      </motion.div>

      {/* User Central Registry */}
      <motion.div variants={item} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
        {/* Abstract background flourish */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 blur-[80px] rounded-full -mr-20 -mt-20" />
        
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Registry</h2>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">Verifying Global Identities</p>
            </div>
          </div>

          <div className="flex bg-slate-50 p-2 rounded-2xl">
            <button className="px-6 py-2 bg-white text-slate-900 text-xs font-black rounded-xl shadow-sm border border-slate-100 uppercase tracking-widest">
              Live Feed
            </button>
            <button className="px-6 py-2 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600">
              Audit Logs
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">Identity Segment</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">Auth Privilege</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">Inscription Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-indigo-50/20 transition-all duration-300 group">
                  <td className="px-10 py-8 border-r border-slate-50">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-xl shadow-indigo-600/10 group-hover:scale-110 transition-transform">
                        {user.displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-lg font-black text-slate-900 mb-0.5 tracking-tight group-hover:text-indigo-600 transition-colors">{user.displayName}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 border-r border-slate-50">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border-2",
                      user.role === 'ADMIN' 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-500 border-slate-100'
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-sm text-slate-500 font-bold tabular-nums border-r border-slate-50">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Synced</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

function KPIBox({ label, value, icon, trend, color }: any) {
  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className={cn("w-14 h-14 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl transition-all duration-500 group-hover:rotate-[360deg]", color)}>
            {icon}
          </div>
          <div className="px-3 py-1 bg-slate-50 rounded-lg text-slate-400 text-[10px] font-black flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            {trend}
          </div>
        </div>
        <div className="text-5xl font-black text-slate-900 mb-2 tracking-tighter tabular-nums">{value}</div>
        <div className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">{label}</div>
      </div>
      
      {/* Decorative flair */}
      <ArrowUpRight className="absolute -top-4 -right-4 w-24 h-24 text-slate-50 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all duration-700 pointer-events-none" />
    </div>
  );
}
