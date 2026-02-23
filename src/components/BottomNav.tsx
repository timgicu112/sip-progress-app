import { Droplets, BarChart3, Settings } from 'lucide-react';

type Tab = 'home' | 'history' | 'settings';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: typeof Droplets; label: string }[] = [
  { id: 'home', icon: Droplets, label: 'Home' },
  { id: 'history', icon: BarChart3, label: 'History' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-surface border-t border-border/40 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md md:max-w-[500px] mx-auto h-20 md:h-24 pb-2">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1 px-5 py-2 md:px-6 md:py-3 rounded-xl transition-all duration-200 tap-bounce
                ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Icon className={`w-6 h-6 md:w-7 md:h-7 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] md:text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
