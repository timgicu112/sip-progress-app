import { useMemo, useState } from 'react';
import { type DayLog } from '@/hooks/useWaterTracker';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HistoryScreenProps {
  getLastNDays: (n: number) => DayLog[];
  getDayLog: (date: string) => DayLog | null;
  streak: number;
  dailyGoal: number;
  history: Record<string, DayLog>;
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en', { weekday: 'short' });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default function HistoryScreen({ getLastNDays, getDayLog, streak, dailyGoal, history }: HistoryScreenProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const weekData = useMemo(() => getLastNDays(7), [getLastNDays]);
  const maxInWeek = Math.max(...weekData.map(d => d.total), dailyGoal);

  const selectedDayLog = selectedDay ? getDayLog(selectedDay) : null;

  // Calendar
  const now = new Date();
  const calMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const calYear = calMonth.getFullYear();
  const calMo = calMonth.getMonth();
  const daysInMonth = new Date(calYear, calMo + 1, 0).getDate();
  const firstDow = new Date(calYear, calMo, 1).getDay();
  const monthLabel = calMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col flex-1 px-5 pb-28 pt-16 overflow-y-auto min-h-[calc(100vh-80px)]">
      <h1 className="text-2xl font-bold text-foreground mb-6">History</h1>

      {/* Weekly chart */}
      <div className="glass-surface rounded-2xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Last 7 Days</h2>
        <div className="flex items-end gap-2 h-36">
          {weekData.map(day => {
            const pct = Math.max((day.total / maxInWeek) * 100, 4);
            const metGoal = day.total >= dailyGoal;
            const partial = day.total > 0 && !metGoal;
            return (
              <button
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1 tap-bounce"
                onClick={() => setSelectedDay(day.date === selectedDay ? null : day.date)}
              >
                <span className="text-[10px] text-muted-foreground font-medium">{day.total > 0 ? `${day.total}` : ''}</span>
                <div className="w-full rounded-lg overflow-hidden bg-muted" style={{ height: '100px' }}>
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${metGoal ? 'bg-success' : partial ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                    style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{formatDay(day.date)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Streak */}
      <div className="glass-surface rounded-2xl p-4 mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">🔥</div>
        <div>
          <p className="text-2xl font-bold text-foreground">{streak} day{streak !== 1 ? 's' : ''}</p>
          <p className="text-xs text-muted-foreground">Current streak</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="glass-surface rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMonthOffset(m => m - 1)} className="tap-bounce p-1">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h2 className="text-sm font-semibold text-foreground">{monthLabel}</h2>
          <button
            onClick={() => setMonthOffset(m => Math.min(m + 1, 0))}
            className="tap-bounce p-1"
            disabled={monthOffset >= 0}
          >
            <ChevronRight className={`w-5 h-5 ${monthOffset >= 0 ? 'text-muted-foreground/30' : 'text-muted-foreground'}`} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-[10px] text-muted-foreground font-medium py-1">{d}</div>
          ))}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = `${calYear}-${String(calMo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const log = history[key];
            const metGoal = log && log.total >= dailyGoal;
            const partial = log && log.total > 0 && !metGoal;
            const isSelected = selectedDay === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedDay(key === selectedDay ? null : key)}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs tap-bounce relative
                  ${isSelected ? 'bg-primary/15 ring-1 ring-primary' : ''}`}
              >
                <span className="text-foreground/70">{day}</span>
                {metGoal && <div className="w-1.5 h-1.5 rounded-full bg-success absolute bottom-1" />}
                {partial && <div className="w-1.5 h-1.5 rounded-full bg-primary absolute bottom-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail */}
      {selectedDay && (
        <div className="glass-surface rounded-2xl p-5 mb-5 animate-count-up">
          <h3 className="text-sm font-semibold text-foreground mb-2">{formatDate(selectedDay)}</h3>
          {selectedDayLog && selectedDayLog.entries.length > 0 ? (
            <>
              <p className="text-2xl font-bold text-foreground">{selectedDayLog.total} ml</p>
              <p className="text-xs text-muted-foreground mb-3">{selectedDayLog.entries.length} glass{selectedDayLog.entries.length !== 1 ? 'es' : ''}</p>
              <div className="flex flex-wrap gap-2">
                {selectedDayLog.entries.map((e, i) => (
                  <span key={i} className="text-[10px] bg-muted rounded-md px-2 py-1 text-muted-foreground">
                    {e.amount}ml @ {new Date(e.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No data for this day</p>
          )}
        </div>
      )}
    </div>
  );
}
