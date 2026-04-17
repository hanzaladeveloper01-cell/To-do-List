import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListTodo, Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { db } from '../lib/db';
import { AppUser } from '../types';
import bcrypt from 'bcryptjs';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useUser();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const user = db.getUserByEmail(email);
        if (!user) throw new Error('User not found');
        
        if (user.password) {
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) throw new Error('Invalid password');
        }
        
        login(user);
        navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
      } else {
        const existing = db.getUserByEmail(email);
        if (existing) throw new Error('Email already registered');

        const role = name.trim().toLowerCase() === 'hanzala ahmed' ? 'ADMIN' : 'USER';
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser: AppUser = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          displayName: name,
          password: hashedPassword,
          role,
          createdAt: Date.now()
        };

        db.addUser(newUser);
        login(newUser);
        navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBFC] flex font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Visual Side (Left) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-20">
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-24">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <ListTodo className="text-blue-600 w-7 h-7" />
            </div>
            <div className="text-white">
              <span className="text-2xl font-black tracking-tight block leading-none">TaskMaster</span>
              <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1 block">Elite</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-6xl font-black text-white leading-tight mb-8 tracking-tighter">
              Performance<br />
              <span className="text-blue-500">starts here.</span>
            </h2>
            <p className="text-slate-400 text-lg font-bold max-w-md mb-12 leading-relaxed">
              The high-fidelity workspace for creators, developers, and elite managers who demand surgical precision in task execution.
            </p>

            <div className="flex flex-wrap gap-10">
              <div className="flex flex-col gap-2">
                <div className="text-4xl font-black text-white tabular-nums tracking-tighter">25k+</div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Initiators</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-4xl font-black text-white tabular-nums tracking-tighter">99.9%</div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Sync Uptime</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
          <div className="w-8 h-px bg-slate-700" />
          TaskMaster Elite Ecosystem © 2026
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full -mr-96 -mt-96" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -ml-40 -mb-40" />
      </div>

      {/* Form Side (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="max-w-[480px] w-full">
          <div className="mb-12">
            <h1 className="text-[40px] font-black text-slate-900 tracking-tighter leading-tight mb-4">
              {isLogin ? 'Access your workspace.' : 'Join the elite ranks.'}
            </h1>
            <p className="text-slate-400 font-bold mb-10 text-lg">
              {isLogin 
                ? 'Resume your surgical workflow today.' 
                : 'Configure your credentials to initialize synchronization.'}
            </p>
            
            <div className="flex bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100/50">
              <button 
                onClick={() => setIsLogin(true)}
                className={cn(
                  "flex-1 px-8 py-3 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-widest",
                  isLogin ? "bg-white text-blue-700 shadow-md shadow-blue-100 border border-blue-600/10" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={cn(
                  "flex-1 px-8 py-3 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-widest",
                  !isLogin ? "bg-white text-blue-700 shadow-md shadow-blue-100 border border-blue-600/10" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Register
              </button>
            </div>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-5 mb-10">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="relative group col-span-full"
                >
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <User className="w-full h-full" />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200/50 rounded-[1.5rem] outline-none focus:border-blue-600/20 focus:bg-white focus:ring-8 ring-blue-600/5 transition-all font-bold placeholder:text-slate-300"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Mail className="w-full h-full" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200/50 rounded-[1.5rem] outline-none focus:border-blue-600/20 focus:bg-white focus:ring-8 ring-blue-600/5 transition-all font-bold placeholder:text-slate-300"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock className="w-full h-full" />
              </div>
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200/50 rounded-[1.5rem] outline-none focus:border-blue-600/20 focus:bg-white focus:ring-8 ring-blue-600/5 transition-all font-bold placeholder:text-slate-300"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 text-red-600 text-[13px] font-black bg-red-50/50 p-5 rounded-2xl border border-red-100"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : isLogin ? 'Sign In to Workspace' : 'Initialize Account'}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />}
            </button>
          </form>

          <div className="flex items-center justify-center gap-6">
            <div className="h-px flex-1 bg-slate-200/50" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Elite Engine v1.0</span>
            <div className="h-px flex-1 bg-slate-200/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
