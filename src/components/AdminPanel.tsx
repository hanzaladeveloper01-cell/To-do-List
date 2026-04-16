import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2
} from 'lucide-react';
import { AppUser } from '../types';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export default function AdminPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [systemStats, setSystemStats] = useState({ totalTasks: 0, completedTasks: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, statsData] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats')
        ]);
        setUsers(usersData);
        setSystemStats(statsData);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleRole = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.patch(`/admin/users/${uid}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole as any } : u));
    } catch (error) {
      console.error("Failed to update role", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">System Administration</h2>
          <p className="text-slate-400 font-medium">Manage user roles and monitor application-wide metrics.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Users</p>
            <p className="text-2xl font-black text-slate-900">{systemStats.totalUsers}</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tasks</p>
            <p className="text-2xl font-black text-slate-900">{systemStats.totalTasks}</p>
          </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-600" />
            User Directory
          </h3>
          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                        {user.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.displayName}</p>
                        <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      user.role === 'admin' 
                        ? "bg-indigo-100 text-indigo-600" 
                        : "bg-slate-100 text-slate-500"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => toggleRole(user.uid, user.role)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                    >
                      {user.role === 'admin' ? (
                        <>
                          <ArrowDownCircle className="w-4 h-4" />
                          Demote
                        </>
                      ) : (
                        <>
                          <ArrowUpCircle className="w-4 h-4" />
                          Promote
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
