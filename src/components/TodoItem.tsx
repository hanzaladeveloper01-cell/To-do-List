import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Edit2, Check, X, GripVertical } from 'lucide-react';
import { Todo } from '../types';
import { cn } from '../lib/utils';

interface TodoItemProps {
  key?: string;
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim() && editText !== todo.text) {
      onEdit(todo.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
      whileHover={{ y: -4, scale: 1.01, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.4)" }}
      className={cn(
        "group flex items-center gap-5 p-6 rounded-[2rem] glass-card mb-5 border-white/5",
        todo.completed && "opacity-50 grayscale-[0.8]",
        isDragging && "z-50 shadow-2xl ring-2 ring-indigo-500/50 cursor-grabbing bg-white/10 scale-105"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 text-slate-600 hover:text-indigo-400 transition-colors"
      >
        <GripVertical className="w-6 h-6" />
      </button>

      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="peer appearance-none w-8 h-8 rounded-[0.9rem] border-2 border-slate-800 checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer hover:border-indigo-400/50"
        />
        <motion.div
          initial={false}
          animate={todo.completed ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0, opacity: 0, rotate: -45 }}
          className="absolute pointer-events-none"
        >
          <Check className="w-5 h-5 text-white font-bold" />
        </motion.div>
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-b-2 border-indigo-500 outline-none text-white py-1 text-xl font-medium"
          />
        ) : (
          <p className={cn(
            "text-white text-xl font-medium transition-all duration-700",
            todo.completed && "line-through text-slate-600 decoration-slate-600/50"
          )}>
            {todo.text}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="p-2.5 rounded-xl hover:bg-green-500/20 text-green-400 transition-colors"
            >
              <Check className="w-6 h-6" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2.5 rounded-xl hover:bg-red-500/20 text-red-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2.5 rounded-xl hover:bg-indigo-500/20 text-indigo-400 transition-colors"
            >
              <Edit2 className="w-6 h-6" />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-2.5 rounded-xl hover:bg-red-500/20 text-red-400 transition-colors"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
