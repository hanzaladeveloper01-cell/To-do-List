import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-12">
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-5"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-40 animate-pulse" />
          <div className="relative p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.25rem] shadow-2xl glow-indigo border border-white/20">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white text-glow">
            ZenTask
          </h1>
          <div className="flex items-center gap-2">
            <span className="h-px w-4 bg-indigo-500/50" />
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">
              Ultra
            </p>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.1, rotate: 8, boxShadow: "0 0 25px rgba(255,255,255,0.1)" }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleDarkMode}
        className="p-4 rounded-[1.25rem] glass-card hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </motion.button>
    </header>
  );
}
