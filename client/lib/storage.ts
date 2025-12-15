import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  RELAPSE_LOGS: "focus_lock_relapse_logs",
  SETTINGS: "focus_lock_settings",
  FOCUS_SESSIONS: "focus_lock_focus_sessions",
} as const;

export interface RelapseLog {
  id: string;
  timestamp: number;
  replacementAction: "physical" | "writing" | "breathing";
}

export interface Settings {
  focusDuration: number;
  unlockThreshold: number;
  isFirstSetup: boolean;
}

export interface FocusSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  completed: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  focusDuration: 30,
  unlockThreshold: 7,
  isFirstSetup: true,
};

export async function getRelapseLogs(): Promise<RelapseLog[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RELAPSE_LOGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addRelapseLog(
  replacementAction: RelapseLog["replacementAction"]
): Promise<RelapseLog> {
  const logs = await getRelapseLogs();
  const newLog: RelapseLog = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    replacementAction,
  };
  logs.push(newLog);
  await AsyncStorage.setItem(STORAGE_KEYS.RELAPSE_LOGS, JSON.stringify(logs));
  return newLog;
}

export async function getSettings(): Promise<Settings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}

export async function getFocusSessions(): Promise<FocusSession[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addFocusSession(session: Omit<FocusSession, "id">): Promise<FocusSession> {
  const sessions = await getFocusSessions();
  const newSession: FocusSession = {
    ...session,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  sessions.push(newSession);
  await AsyncStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
  return newSession;
}

export async function resetAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.RELAPSE_LOGS,
    STORAGE_KEYS.SETTINGS,
    STORAGE_KEYS.FOCUS_SESSIONS,
  ]);
}

export function getCurrentStreak(logs: RelapseLog[]): number {
  if (logs.length === 0) return 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  const lastRelapse = sortedLogs[0];
  
  if (!lastRelapse) return 0;
  
  const lastRelapseDate = new Date(lastRelapse.timestamp);
  const lastRelapseDay = new Date(
    lastRelapseDate.getFullYear(),
    lastRelapseDate.getMonth(),
    lastRelapseDate.getDate()
  ).getTime();
  
  const daysSinceLastRelapse = Math.floor((today - lastRelapseDay) / (1000 * 60 * 60 * 24));
  return daysSinceLastRelapse;
}

export function getTodayRelapseCount(logs: RelapseLog[]): number {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;
  
  return logs.filter(log => log.timestamp >= todayStart && log.timestamp < todayEnd).length;
}

export function getDailyPattern(logs: RelapseLog[], days: number = 7): { date: string; count: number }[] {
  const now = new Date();
  const result: { date: string; count: number }[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayStart = date.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    
    const count = logs.filter(log => log.timestamp >= dayStart && log.timestamp < dayEnd).length;
    
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    result.push({
      date: dayNames[date.getDay()],
      count,
    });
  }
  
  return result;
}

export function getWeeklyPattern(logs: RelapseLog[], weeks: number = 4): { week: string; count: number }[] {
  const now = new Date();
  const result: { week: string; count: number }[] = [];
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const count = logs.filter(
      log => log.timestamp >= weekStart.getTime() && log.timestamp < weekEnd.getTime()
    ).length;
    
    result.push({
      week: `W${weeks - i}`,
      count,
    });
  }
  
  return result;
}

export function getHourlyPattern(logs: RelapseLog[]): { hour: number; count: number }[] {
  const hourCounts: number[] = new Array(24).fill(0);
  
  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    hourCounts[hour]++;
  });
  
  return hourCounts.map((count, hour) => ({ hour, count }));
}

export function getRiskWindows(logs: RelapseLog[]): { start: number; end: number; count: number }[] {
  const hourlyPattern = getHourlyPattern(logs);
  const avgCount = logs.length > 0 ? logs.length / 24 : 0;
  
  const riskWindows: { start: number; end: number; count: number }[] = [];
  let currentWindow: { start: number; end: number; count: number } | null = null;
  
  hourlyPattern.forEach(({ hour, count }) => {
    if (count > avgCount * 1.5 && count >= 2) {
      if (currentWindow && hour === currentWindow.end) {
        currentWindow.end = hour + 1;
        currentWindow.count += count;
      } else {
        if (currentWindow) {
          riskWindows.push(currentWindow);
        }
        currentWindow = { start: hour, end: hour + 1, count };
      }
    } else {
      if (currentWindow) {
        riskWindows.push(currentWindow);
        currentWindow = null;
      }
    }
  });
  
  if (currentWindow) {
    riskWindows.push(currentWindow);
  }
  
  return riskWindows.sort((a, b) => b.count - a.count);
}

export function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}
