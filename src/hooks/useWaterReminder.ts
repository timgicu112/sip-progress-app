import { useEffect, useRef, useCallback } from 'react';
import type { Settings } from './useWaterTracker';

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

function isWithinWakingHours(wakeTime: string, sleepTime: string): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const wake = parseTime(wakeTime);
  const sleep = parseTime(sleepTime);
  const wakeMinutes = wake.hours * 60 + wake.minutes;
  const sleepMinutes = sleep.hours * 60 + sleep.minutes;

  if (sleepMinutes > wakeMinutes) {
    return currentMinutes >= wakeMinutes && currentMinutes < sleepMinutes;
  }
  // Overnight schedule (e.g., wake 22:00, sleep 06:00)
  return currentMinutes >= wakeMinutes || currentMinutes < sleepMinutes;
}

function getIntervalMs(interval: string): number | null {
  switch (interval) {
    case '1h': return 60 * 60 * 1000;
    case '1.5h': return 90 * 60 * 1000;
    case '2h': return 2 * 60 * 60 * 1000;
    case '3h': return 3 * 60 * 60 * 1000;
    default: return null;
  }
}

const MESSAGES = [
  "Time to hydrate! 💧",
  "Your body needs water! 🌊",
  "Stay hydrated, stay healthy! 💪",
  "Water break! Take a sip 🥤",
  "Don't forget to drink water! 💙",
];

export function useWaterReminder(settings: Settings, currentTotal: number, dailyGoal: number) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const permissionRef = useRef<NotificationPermission>('default');

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      permissionRef.current = 'granted';
      return true;
    }
    if (Notification.permission === 'denied') {
      permissionRef.current = 'denied';
      return false;
    }
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result === 'granted';
  }, []);

  const sendNotification = useCallback(() => {
    if (permissionRef.current !== 'granted') return;
    if (!isWithinWakingHours(settings.wakeTime, settings.sleepTime)) return;
    // Don't notify if goal already met
    if (currentTotal >= dailyGoal) return;

    const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    const remaining = dailyGoal - currentTotal;

    try {
      new Notification('HydroDay 💧', {
        body: `${message}\n${remaining}ml remaining today.`,
        icon: '/favicon.ico',
        tag: 'hydroday-reminder',
      });
    } catch {
      // Notification constructor may fail in some contexts
    }
  }, [settings.wakeTime, settings.sleepTime, currentTotal, dailyGoal]);

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const ms = getIntervalMs(settings.reminderInterval);
    if (!ms) return; // reminders off

    // Request permission on first enable
    requestPermission();

    intervalRef.current = setInterval(() => {
      sendNotification();
    }, ms);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [settings.reminderInterval, sendNotification, requestPermission]);

  return { requestPermission };
}
