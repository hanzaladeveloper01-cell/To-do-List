import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trash2, 
  Edit3, 
  Check, 
  Calendar, 
  Star
} from 'lucide-react';
import { Todo } from '../types';
import { cn } from '../lib/utils';

interface TaskCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Todo>) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim() && editText !== todo.text) {
      onEdit(todo.id, { text: editText.trim() });
    }
    setIsEditing(false);
  };

  const priorityColors = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group bg-white rounded-2xl p-5 border border-slate-100 transition-all duration-300 card-shadow mb-4",
        todo.completed && "bg-slate-50/50 border-transparent"
      )}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(todo.id)}
          className={cn(
            "mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
            todo.completed 
              ? "bg-indigo-600 border-indigo-600" 
              : "border-slate-200 hover:border-indigo-400"
          )}
        >
          <motion.div
            initial={false}
            animate={todo.completed ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          >
            <Check className="w-4 h-4 text-white stroke-[3px]" />
          </motion.div>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {todo.completed ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600/70 border border-emerald-100">
                  Completed
                </span>
              ) : (
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                  priorityColors[todo.priority]
                )}>
                  {todo.priority}
                </span>
              )}
              {todo.dueDate && (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onEdit(todo.id, { priority: todo.priority === 'high' ? 'low' : todo.priority === 'medium' ? 'high' : 'medium' })}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <Star className={cn("w-4 h-4", todo.priority === 'high' && "fill-indigo-600 text-indigo-600")} />
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(todo.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full bg-transparent border-b-2 border-indigo-600 outline-none text-slate-950 font-semibold py-1"
            />
          ) : (
            <h3 className={cn(
              "text-base font-semibold text-slate-950 transition-all duration-500",
              todo.completed && "text-slate-400 line-through decoration-slate-300"
            )}>
              {todo.text}
            </h3>
          )}

          {todo.description && !todo.completed && (
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">
              {todo.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
