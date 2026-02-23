import { useState } from 'react';
import { useSettings, useWaterLog } from '@/hooks/useWaterTracker';
import { useWaterReminder } from '@/hooks/useWaterReminder';
import HomeScreen from '@/components/HomeScreen';
import HistoryScreen from '@/components/HistoryScreen';
import SettingsScreen from '@/components/SettingsScreen';
import BottomNav from '@/components/BottomNav';

type Tab = 'home' | 'history' | 'settings';

const Index = () => {
  const [tab, setTab] = useState<Tab>('home');
  const { settings, updateSettings } = useSettings();
  const { today, progress, addWater, resetToday, getLastNDays, getStreak, getDayLog, history } = useWaterLog(settings.dailyGoal);
  useWaterReminder(settings, today.total, settings.dailyGoal);

  return (
    <div className="max-w-md md:max-w-[500px] mx-auto min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-5 pt-12 pb-3 max-w-md md:max-w-[500px] mx-auto">
        <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
          {tab === 'home' ? '💧 HydroDay' : ''}
        </h2>
      </header>

      {tab === 'home' && (
        <HomeScreen
          today={today}
          progress={progress}
          dailyGoal={settings.dailyGoal}
          onAddWater={addWater}
        />
      )}
      {tab === 'history' && (
        <HistoryScreen
          getLastNDays={getLastNDays}
          getDayLog={getDayLog}
          streak={getStreak()}
          dailyGoal={settings.dailyGoal}
          history={history}
        />
      )}
      {tab === 'settings' && (
        <SettingsScreen
          settings={settings}
          onUpdate={updateSettings}
          onResetToday={resetToday}
        />
      )}

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
