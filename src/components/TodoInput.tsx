import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Loader2 } from 'lucide-react';

interface TodoInputProps {
  onAdd: (text: string) => void;
}

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsAdding(true);
    // Simulate loading for effect
    setTimeout(() => {
      onAdd(text.trim());
      setText('');
      setIsAdding(false);
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} className="relative mb-12">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200" />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="relative w-full px-8 py-6 pr-20 rounded-[1.75rem] glass-card focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none text-white placeholder:text-slate-600 transition-all text-xl font-medium"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <motion.button
            type="submit"
            disabled={!text.trim() || isAdding}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="p-4 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl glow-indigo disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center min-w-[56px] min-h-[56px] border border-white/20"
          >
            <AnimatePresence mode="wait">
              {isAdding ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                >
                  <Loader2 className="w-7 h-7 animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <Plus className="w-7 h-7" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </form>
  );
}
