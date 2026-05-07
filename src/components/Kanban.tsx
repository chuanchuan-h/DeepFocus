import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Trash2, CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { Task, TaskStatus } from '../types';
import { cn } from '../lib/utils';

export const Kanban: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useStore();
  const [newTaskName, setNewTaskName] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAddTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskName.trim()) return;
    
    const task: Task = {
      id: crypto.randomUUID(),
      name: newTaskName,
      minutes: 25,
      status: 'todo',
      createdAt: Date.now(),
    };
    addTask(task);
    setNewTaskName('');
  };

  const handleAiSplit = async () => {
    if (!newTaskName.trim()) return;
    setIsAiLoading(true);
    
    try {
      const prompt = `你是一位考研规划专家。请将以下学习目标拆分为3-5个具体的子任务，每个子任务给出预估的专注分钟数。输出格式必须为纯JSON数组，例如：[{"name":"观看视频课","minutes":45},{"name":"做课后习题","minutes":60}]。学习目标：${newTaskName}`;
      
      const response = await fetch('/api/deepseek/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = typeof data.error === 'object' ? (data.error.message || JSON.stringify(data.error)) : (data.error || 'AI 拆分失败');
        throw new Error(errorMsg);
      }

      const content = data.choices[0].message.content;
      // Extract JSON if it's wrapped in markdown
      const jsonStr = content.match(/\[.*\]/s)?.[0] || content;
      const subtasks = JSON.parse(jsonStr);
      
      for (const sub of subtasks) {
        addTask({
          id: crypto.randomUUID(),
          name: sub.name,
          minutes: sub.minutes,
          status: 'todo',
          createdAt: Date.now(),
        });
      }
      setNewTaskName('');
    } catch (error: any) {
      console.error('AI Split Error:', error);
      alert(error.message || 'AI 拆分失败，请重试');
    } finally {
      setIsAiLoading(false);
    }
  };

  const columns: { title: string; status: TaskStatus }[] = [
    { title: '待开始', status: 'todo' },
    { title: '进行中', status: 'doing' },
    { title: '已完成', status: 'done' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-orange" /> 任务看板
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="输入学习目标..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange/50 transition-all"
          />
          <button
            onClick={() => handleAddTask()}
            className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl transition-all active:scale-95"
          >
            <Plus />
          </button>
          <button
            onClick={handleAiSplit}
            disabled={isAiLoading}
            className="bg-orange hover:bg-orange/80 text-white px-6 rounded-xl font-medium flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isAiLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
            AI 拆分
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.status} className="flex flex-col space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-white/60 font-medium uppercase tracking-wider text-sm">
                {col.title}
              </h3>
              <span className="bg-white/10 text-white/40 text-xs px-2 py-1 rounded-full">
                {tasks.filter(t => t.status === col.status).length}
              </span>
            </div>
            
            <div className="flex-1 min-h-[400px] bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {tasks
                    .filter((t) => t.status === col.status)
                    .map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group bg-white/10 border border-white/10 p-4 rounded-xl hover:bg-white/15 transition-all cursor-pointer"
                        onClick={() => {
                          const nextStatus: Record<TaskStatus, TaskStatus> = {
                            todo: 'doing',
                            doing: 'done',
                            done: 'todo',
                          };
                          updateTask({ ...task, status: nextStatus[task.status] });
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              {task.status === 'done' ? (
                                <CheckCircle2 className="text-green-400 shrink-0" size={18} />
                              ) : (
                                <Circle className="text-white/20 shrink-0" size={18} />
                              )}
                              <span className={cn(
                                "text-white font-medium",
                                task.status === 'done' && "line-through text-white/40"
                              )}>
                                {task.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-white/40 ml-7">
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> {task.minutes}m
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
