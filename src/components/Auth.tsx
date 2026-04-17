import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListTodo, Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { db } from '../lib/db';
import { AppUser } from '../types';

import bcrypt from 'bcryptjs';

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
        
        // Security: Check password hash
        if (user.password) {
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) throw new Error('Invalid password');
        }
        
        login(user);
        navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
      } else {
        const existing = db.getUserByEmail(email);
        if (existing) throw new Error('Email already registered');

        // Logic: Hanzala Ahmed is ADMIN, others are USER
        const role = name.trim().toLowerCase() === 'hanzala ahmed' ? 'ADMIN' : 'USER';
        
        // Security: Hash password
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
            <ListTodo className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">TaskMaster Elite</h1>
          <p className="text-slate-500 font-medium">
            {isLogin ? 'Welcome back to your workspace.' : 'Start your journey to peak productivity.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 mb-8">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-600/20 focus:bg-white transition-all font-medium"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-600/20 focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-600/20 focus:bg-white transition-all font-medium"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-50 p-4 rounded-2xl"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-slate-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
