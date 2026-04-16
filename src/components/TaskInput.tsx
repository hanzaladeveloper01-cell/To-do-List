import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar, Flag, ChevronDown } from 'lucide-react';
import { Priority } from '../types';
import { cn } from '../lib/utils';

interface TaskInputProps {
  onAdd: (task: { text: string; description: string; priority: Priority; dueDate: string }) => void;
}

export default function TaskInput({ onAdd }: TaskInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAdd({ text: text.trim(), description, priority, dueDate });
    setText('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setIsExpanded(false);
  };

  return (
    <div className="mb-8">
      <form 
        onSubmit={handleSubmit}
        className={cn(
          "bg-white rounded-2xl border border-slate-200 transition-all duration-300 card-shadow",
          isExpanded ? "p-6" : "p-2"
        )}
      >
        <div className="flex items-center gap-3">
          {!isExpanded && (
            <div className="p-2 text-indigo-600">
              <Plus className="w-6 h-6" />
            </div>
          )}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Add a new task..."
            className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 py-2 text-base font-medium"
          />
          {!isExpanded && text.trim() && (
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
                className="w-full mt-4 bg-slate-50 rounded-xl p-4 text-sm text-slate-600 outline-none border-none resize-none h-24"
              />

              <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <button 
                      type="button"
                      className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Flag className={cn(
                        "w-4 h-4",
                        priority === 'high' ? "text-red-500" : 
                        priority === 'medium' ? "text-yellow-500" : "text-green-500"
                      )} />
                      Priority: {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 p-1">
                      {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium hover:bg-slate-50 text-slate-600"
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-xs font-semibold text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <input 
                      type="date" 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-transparent border-none outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!text.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
