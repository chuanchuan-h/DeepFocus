export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  name: string;
  minutes: number;
  status: TaskStatus;
  createdAt: number;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  duration: number; // in minutes
  timestamp: number;
}

export interface Settings {
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  theme: 'light' | 'dark';
}
