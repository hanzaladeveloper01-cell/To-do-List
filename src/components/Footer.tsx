import React from 'react';
import { motion } from 'motion/react';
import { FilterType } from '../types';
import { cn } from '../lib/utils';

interface FooterProps {
  activeCount: number;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  onClearCompleted: () => void;
  hasCompleted: boolean;
}

export default function Footer({ activeCount, filter, setFilter, onClearCompleted, hasCompleted }: FooterProps) {
  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8"
    >
      <div className="flex flex-col items-center sm:items-start gap-1">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          Remaining
        </span>
        <span className="text-lg font-black text-white text-glow">
          {activeCount} {activeCount === 1 ? 'TASK' : 'TASKS'}
        </span>
      </div>

      <div className="flex items-center p-2 bg-white/5 rounded-[1.25rem] border border-white/5 shadow-inner">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-500 uppercase tracking-widest",
              filter === f.value
                ? "bg-indigo-500 text-white shadow-2xl glow-indigo scale-105"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button
        onClick={onClearCompleted}
        disabled={!hasCompleted}
        className={cn(
          "text-[10px] font-black text-slate-500 hover:text-red-400 transition-all uppercase tracking-[0.2em] disabled:opacity-0 py-2 px-4 rounded-lg hover:bg-red-500/10",
          hasCompleted && "opacity-100"
        )}
      >
        Clear Completed
      </button>
    </motion.footer>
  );
}
