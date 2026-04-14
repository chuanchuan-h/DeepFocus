import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../store';
import { cn } from '../lib/utils';

export const Timer: React.FC = () => {
  const { settings, addSession } = useStore();
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroTime * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = mode === 'pomodoro' 
    ? settings.pomodoroTime * 60 
    : mode === 'shortBreak' 
      ? settings.shortBreakTime * 60 
      : settings.longBreakTime * 60;

  useEffect(() => {
    setTimeLeft(totalTime);
  }, [mode, settings]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF8C42', '#0F2B3D', '#FFFFFF']
    });

    if (mode === 'pomodoro') {
      addSession({
        id: crypto.randomUUID(),
        duration: settings.pomodoroTime,
        timestamp: Date.now(),
      });
    }

    // Play sound (simulated)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {});

    if ('vibrate' in navigator) navigator.vibrate(500);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / totalTime) * 100;
  const strokeDashoffset = 440 - (440 * progress) / 100;

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      <div className="flex space-x-4 p-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
        {(['pomodoro', 'shortBreak', 'longBreak'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setIsActive(false); }}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
              mode === m ? "bg-orange text-white shadow-lg" : "text-white/60 hover:text-white"
            )}
          >
            {m === 'pomodoro' ? '专注' : m === 'shortBreak' ? '短休' : '长休'}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center w-72 h-72">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="130"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          <motion.circle
            cx="144"
            cy="144"
            r="130"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray="816"
            initial={{ strokeDashoffset: 816 }}
            animate={{ strokeDashoffset: 816 - (816 * progress) / 100 }}
            transition={{ duration: 1, ease: "linear" }}
            className="text-orange"
            strokeLinecap="round"
          />
        </svg>
        
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span 
            key={timeLeft}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-mono font-bold text-white tracking-tighter"
          >
            {formatTime(timeLeft)}
          </motion.span>
          <span className="text-white/40 text-sm mt-2 uppercase tracking-widest">
            {mode === 'pomodoro' ? 'Deep Focus' : 'Resting'}
          </span>
        </div>

        {/* Breathing Ring Effect */}
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 border-4 border-orange/30 rounded-full"
          />
        )}
      </div>

      <div className="flex space-x-6">
        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95 border border-white/10"
        >
          <RotateCcw size={24} />
        </button>
        <button
          onClick={toggleTimer}
          className="p-6 rounded-full bg-orange text-white shadow-xl shadow-orange/20 hover:scale-105 transition-all active:scale-95"
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
        <button
          className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95 border border-white/10"
        >
          {mode === 'pomodoro' ? <Brain size={24} /> : <Coffee size={24} />}
        </button>
      </div>
    </div>
  );
};
