import React from 'react';
import { useStore } from '../store';
import { Settings as SettingsType } from '../types';
import { Save, RefreshCw, Moon, Sun } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useStore();

  const handleChange = (key: keyof SettingsType, value: any) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md space-y-8">
        <h2 className="text-2xl font-bold text-white">偏好设置</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-white/40 uppercase tracking-widest">专注时长</label>
            <input
              type="number"
              value={settings.pomodoroTime}
              onChange={(e) => handleChange('pomodoroTime', parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/40 uppercase tracking-widest">短休时长</label>
            <input
              type="number"
              value={settings.shortBreakTime}
              onChange={(e) => handleChange('shortBreakTime', parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/40 uppercase tracking-widest">长休时长</label>
            <input
              type="number"
              value={settings.longBreakTime}
              onChange={(e) => handleChange('longBreakTime', parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="space-y-1">
              <p className="text-white font-medium">自动开始休息</p>
              <p className="text-xs text-white/40">专注结束后自动进入休息模式</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoStartBreaks}
              onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
              className="w-6 h-6 rounded-lg accent-orange"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="space-y-1">
              <p className="text-white font-medium">自动开始专注</p>
              <p className="text-xs text-white/40">休息结束后自动进入专注模式</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoStartPomodoros}
              onChange={(e) => handleChange('autoStartPomodoros', e.target.checked)}
              className="w-6 h-6 rounded-lg accent-orange"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm text-white/40 uppercase tracking-widest">数据管理</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={async () => {
                const data = {
                  tasks: await useStore.getState().tasks,
                  sessions: await useStore.getState().sessions,
                  settings: useStore.getState().settings,
                  exportedAt: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `deepfocus-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
            >
              <Save size={18} /> 导出备份 (JSON)
            </button>
            
            <label className="flex items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
              <RefreshCw size={18} /> 导入备份
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string);
                      if (confirm('导入备份将覆盖当前所有数据，确定吗？')) {
                        // Simple way: clear and reload
                        for (const task of data.tasks || []) await useStore.getState().addTask(task);
                        for (const session of data.sessions || []) await useStore.getState().addSession(session);
                        if (data.settings) await useStore.getState().updateSettings(data.settings);
                        alert('导入成功！页面即将刷新。');
                        window.location.reload();
                      }
                    } catch (err) {
                      alert('导入失败：文件格式不正确');
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <button
            onClick={() => {
              if (confirm('确定要清除所有本地数据吗？')) {
                indexedDB.deleteDatabase('deepfocus-db');
                window.location.reload();
              }
            }}
            className="text-red-400 text-sm flex items-center gap-2 hover:underline"
          >
            <RefreshCw size={14} /> 清除所有本地数据
          </button>
        </div>
      </div>
    </div>
  );
};
