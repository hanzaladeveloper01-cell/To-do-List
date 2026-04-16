import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  BarChart3, 
  Shield, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { db } from '../lib/db';
import { AppUser } from '../types';

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
      className="max-w-6xl mx-auto px-8 py-12"
    >
      <motion.div variants={item} className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          Performance Overview
        </h1>
        <p className="text-slate-500 font-medium">System-wide analytics and user management.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          label="Total Users" 
          value={stats.totalUsers} 
          icon={<Users className="w-6 h-6" />} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Total Tasks" 
          value={stats.totalTasks} 
          icon={<BarChart3 className="w-6 h-6" />} 
          color="bg-indigo-500" 
        />
        <StatCard 
          label="Completed" 
          value={stats.completedTasks} 
          icon={<CheckCircle2 className="w-6 h-6" />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          label="Active Today" 
          value={stats.activeUsers} 
          icon={<Activity className="w-6 h-6" />} 
          color="bg-orange-500" 
        />
      </motion.div>

      {/* Users Table */}
      <motion.div variants={item} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-bottom border-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            User Management
          </h2>
          <span className="px-4 py-1 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full uppercase tracking-wider">
            {users.length} Registered
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                        {user.displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.displayName}</div>
                        <div className="text-xs text-slate-400 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active
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

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/50 group hover:scale-[1.02] transition-all">
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-current/20`}>
          {icon}
        </div>
        <TrendingUp className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 transition-colors" />
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}
