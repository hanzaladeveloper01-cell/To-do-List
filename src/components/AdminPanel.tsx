import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  Shield, 
  Activity,
  Layers,
  ArrowUpRight,
  UserCheck,
  Search,
  Filter,
  MoreVertical,
  Calendar
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
  hidden: { opacity: 0, y: 15 },
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
    <div className="min-h-screen bg-[#F9FBFC] selection:bg-blue-100">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 md:px-12 py-12"
      >
        {/* Superior Header */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Command Center</h1>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Instance Monitoring</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Engine Status: Optimal</span>
            </div>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all">
              Security Audit
            </button>
          </div>
        </motion.div>

        {/* Global Velocity Stats */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            label="Force Enrollment" 
            value={stats.totalUsers} 
            icon={<Users className="w-5 h-5" />} 
            color="text-blue-600 bg-blue-50"
            percentage="+12.5%"
          />
          <StatCard 
            label="Total Initiatives" 
            value={stats.totalTasks} 
            icon={<Layers className="w-5 h-5" />} 
            color="text-slate-600 bg-slate-100"
            percentage="+4.2%"
          />
          <StatCard 
            label="Success Rate" 
            value={`${Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%`} 
            icon={<CheckCircle2 className="w-5 h-5" />} 
            color="text-emerald-600 bg-emerald-50"
            percentage="Stable"
          />
          <StatCard 
            label="Active Nodes" 
            value={stats.activeUsers} 
            icon={<UserCheck className="w-5 h-5" />} 
            color="text-orange-600 bg-orange-50"
            percentage="Live"
          />
        </motion.div>

        {/* User Registry Registry */}
        <motion.div variants={item} className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Identity Registry</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Managing Participant Permissions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search participants..." 
                  className="pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 ring-blue-600/5 focus:bg-white focus:border-blue-600/20 transition-all text-sm font-bold placeholder:text-slate-300"
                />
              </div>
              <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 border border-slate-100 transition-all">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Participant Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Auth Layer</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date Bound</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100">
                          {user.displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 leading-none mb-1.5">{user.displayName}</div>
                          <div className="text-xs text-slate-400 font-bold tracking-tight">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                        user.role === 'ADMIN' 
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                          : 'bg-blue-50 text-blue-600'
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tight">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, icon, color, percentage }: any) {
  return (
    <div className="bg-white p-8 rounded-[1.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", color)}>
          {icon}
        </div>
        <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">
          {percentage}
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-black text-slate-900 mb-1 tracking-tighter tabular-nums">{value}</div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</div>
      </div>
      
      {/* Dynamic line element */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
    </div>
  );
}
