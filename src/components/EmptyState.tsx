import React from 'react';
import { motion } from 'motion/react';
import { ClipboardList } from 'lucide-react';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mb-8 text-indigo-400 border border-indigo-500/20 glow-indigo">
        <ClipboardList className="w-12 h-12" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 text-glow">
        No tasks found
      </h3>
      <p className="text-slate-400 max-w-[280px] font-medium leading-relaxed">
        Your list is currently empty. Add a task to start your productive journey.
      </p>
    </motion.div>
  );
}
