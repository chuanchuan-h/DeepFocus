import { create } from 'zustand';
import { Task, FocusSession, Settings } from './types';
import { tasksDB, sessionsDB, settingsDB } from './db';

interface DeepFocusStore {
  tasks: Task[];
  sessions: FocusSession[];
  settings: Settings;
  
  fetchTasks: () => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  fetchSessions: () => Promise<void>;
  addSession: (session: FocusSession) => Promise<void>;
  
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  pomodoroTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  theme: 'dark',
};

export const useStore = create<DeepFocusStore>((set, get) => ({
  tasks: [],
  sessions: [],
  settings: defaultSettings,

  fetchTasks: async () => {
    const tasks = await tasksDB.getAll();
    set({ tasks });
  },
  addTask: async (task) => {
    await tasksDB.put(task);
    set((state) => ({ tasks: [...state.tasks, task] }));
  },
  updateTask: async (task) => {
    await tasksDB.put(task);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    }));
  },
  deleteTask: async (id) => {
    await tasksDB.delete(id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  fetchSessions: async () => {
    const sessions = await sessionsDB.getAll();
    set({ sessions });
  },
  addSession: async (session) => {
    await sessionsDB.add(session);
    set((state) => ({ sessions: [...state.sessions, session] }));
  },

  loadSettings: async () => {
    const saved = await settingsDB.get('app-settings');
    if (saved) {
      set({ settings: { ...defaultSettings, ...saved } });
    }
  },
  updateSettings: async (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    await settingsDB.set('app-settings', updated);
    set({ settings: updated });
  },
}));
