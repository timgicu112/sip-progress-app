import { useState, useEffect, useCallback } from 'react';

export interface WaterEntry {
  amount: number;
  timestamp: string;
}

export interface DayLog {
  date: string;
  entries: WaterEntry[];
  total: number;
}

export interface Settings {
  dailyGoal: number;
  defaultGlass: number;
  reminderInterval: string;
  wakeTime: string;
  sleepTime: string;
  darkMode: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  dailyGoal: 2000,
  defaultGlass: 250,
  reminderInterval: '2h',
  wakeTime: '07:00',
  sleepTime: '23:00',
  darkMode: false,
};

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() =>
    loadFromStorage('hydroday-settings', DEFAULT_SETTINGS)
  );

  useEffect(() => {
    saveToStorage('hydroday-settings', settings);
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  return { settings, updateSettings };
}

export function useWaterLog(dailyGoal: number) {
  const [history, setHistory] = useState<Record<string, DayLog>>(() =>
    loadFromStorage('hydroday-history', {})
  );

  const todayKey = getTodayKey();
  const today = history[todayKey] || { date: todayKey, entries: [], total: 0 };

  useEffect(() => {
    saveToStorage('hydroday-history', history);
  }, [history]);

  const addWater = useCallback((amount: number) => {
    const key = getTodayKey();
    setHistory(prev => {
      const day = prev[key] || { date: key, entries: [], total: 0 };
      const entry: WaterEntry = { amount, timestamp: new Date().toISOString() };
      return {
        ...prev,
        [key]: {
          ...day,
          entries: [...day.entries, entry],
          total: day.total + amount,
        },
      };
    });
  }, []);

  const resetToday = useCallback(() => {
    const key = getTodayKey();
    setHistory(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const progress = Math.min(today.total / dailyGoal, 1);

  const getLastNDays = useCallback((n: number): DayLog[] => {
    const days: DayLog[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push(history[key] || { date: key, entries: [], total: 0 });
    }
    return days;
  }, [history]);

  const getStreak = useCallback((): number => {
    let streak = 0;
    const d = new Date();
    // Start from yesterday if today hasn't met goal yet
    if (today.total < dailyGoal) {
      d.setDate(d.getDate() - 1);
    }
    while (true) {
      const key = d.toISOString().split('T')[0];
      const day = history[key];
      if (day && day.total >= dailyGoal) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    // Include today if goal met
    if (today.total >= dailyGoal) {
      streak++;
    }
    return streak;
  }, [history, today, dailyGoal]);

  const getDayLog = useCallback((date: string): DayLog | null => {
    return history[date] || null;
  }, [history]);

  return { today, progress, addWater, resetToday, getLastNDays, getStreak, getDayLog, history };
}

export function getMotivationalMessage(progress: number): string {
  if (progress >= 1) return "Goal reached! 🎉";
  if (progress >= 0.75) return "Almost there! 🎯";
  if (progress >= 0.5) return "More than halfway! 💪";
  if (progress >= 0.25) return "Keep going! 🌊";
  return "Let's get started! 💧";
}
