import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer as TimerIcon, LayoutGrid, BarChart3, Settings as SettingsIcon, Brain } from 'lucide-react';
import { Timer } from './components/Timer';
import { Kanban } from './components/Kanban';
import { Statistics } from './components/Statistics';
import { Settings } from './components/Settings';
import { useStore } from './store';
import { initDB } from './db';
import { cn } from './lib/utils';

type Tab = 'timer' | 'kanban' | 'stats' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const { fetchTasks, fetchSessions, loadSettings } = useStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      await initDB();
      await Promise.all([
        fetchTasks(),
        fetchSessions(),
        loadSettings(),
      ]);
      setIsReady(true);
    };
    setup();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0F2B3D] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-orange"
        >
          <Brain size={64} />
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'timer', icon: TimerIcon, label: '专注' },
    { id: 'kanban', icon: LayoutGrid, label: '任务' },
    { id: 'stats', icon: BarChart3, label: '统计' },
    { id: 'settings', icon: SettingsIcon, label: '设置' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0F2B3D] text-white selection:bg-orange/30 selection:text-orange overflow-x-hidden">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange rounded-xl flex items-center justify-center shadow-lg shadow-orange/20">
              <Brain size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">DeepFocus</h1>
          </div>
          <nav className="hidden md:flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                  activeTab === tab.id 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {activeTab === 'timer' && <Timer />}
              {activeTab === 'kanban' && <Kanban />}
              {activeTab === 'stats' && <Statistics />}
              {activeTab === 'settings' && <Settings />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-2 flex justify-around shadow-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all",
                activeTab === tab.id ? "bg-orange text-white" : "text-white/40"
              )}
            >
              <tab.icon size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
