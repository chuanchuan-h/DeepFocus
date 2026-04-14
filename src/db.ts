import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, FocusSession, Settings } from './types';

interface DeepFocusDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-status': string };
  };
  sessions: {
    key: string;
    value: FocusSession;
    indexes: { 'by-timestamp': number };
  };
  settings: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<DeepFocusDB>>;

export const initDB = () => {
  dbPromise = openDB<DeepFocusDB>('deepfocus-db', 1, {
    upgrade(db) {
      const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
      taskStore.createIndex('by-status', 'status');

      const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
      sessionStore.createIndex('by-timestamp', 'timestamp');

      db.createObjectStore('settings');
    },
  });
  return dbPromise;
};

export const tasksDB = {
  async getAll() {
    const db = await dbPromise;
    return db.getAll('tasks');
  },
  async put(task: Task) {
    const db = await dbPromise;
    return db.put('tasks', task);
  },
  async delete(id: string) {
    const db = await dbPromise;
    return db.delete('tasks', id);
  },
};

export const sessionsDB = {
  async getAll() {
    const db = await dbPromise;
    return db.getAll('sessions');
  },
  async add(session: FocusSession) {
    const db = await dbPromise;
    return db.put('sessions', session);
  },
};

export const settingsDB = {
  async get(key: string) {
    const db = await dbPromise;
    return db.get('settings', key);
  },
  async set(key: string, value: any) {
    const db = await dbPromise;
    return db.put('settings', value, key);
  },
};
