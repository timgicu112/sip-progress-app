import { useState, useCallback } from 'react';
import ProgressRing from '@/components/ProgressRing';
import { getMotivationalMessage, type DayLog } from '@/hooks/useWaterTracker';
import { Droplets, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HomeScreenProps {
  today: DayLog;
  progress: number;
  dailyGoal: number;
  onAddWater: (amount: number) => void;
}

const QUICK_AMOUNTS = [150, 250, 500, 750];

export default function HomeScreen({ today, progress, dailyGoal, onAddWater }: HomeScreenProps) {
  const [bouncing, setBouncing] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);
  const [tappedAmount, setTappedAmount] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const glasses = today.entries.length;
  const message = getMotivationalMessage(progress);

  const handleAdd = useCallback((amount: number) => {
    onAddWater(amount);
    setBouncing(true);
    setRippleKey(k => k + 1);
    setTappedAmount(amount);
    setTimeout(() => setBouncing(false), 300);
    setTimeout(() => setTappedAmount(null), 300);
  }, [onAddWater]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 pb-24 pt-16 md:pb-28 md:pt-20 min-h-[calc(100vh-80px)]">
      {/* Progress Ring */}
      <div className="relative flex items-center justify-center mb-6 md:mb-10">
        <ProgressRing progress={progress} size={260} mdSize={340} />
        <div className={`absolute flex flex-col items-center ${bouncing ? 'animate-bounce-in' : ''}`}>
          <span className="text-5xl md:text-7xl font-bold tracking-tight text-foreground animate-count-up" key={today.total}>
            {today.total}
          </span>
          <span className="text-sm md:text-lg text-muted-foreground font-medium mt-1">
            / {dailyGoal} ml
          </span>
        </div>
      </div>

      {/* Motivational message */}
      <p className="text-base md:text-xl font-medium text-muted-foreground mb-6 md:mb-8 transition-all duration-300" key={message}>
        {message}
      </p>

      {/* Glass dots */}
      {glasses > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-6 md:mb-8 max-w-[240px] md:max-w-[320px]">
          {Array.from({ length: Math.min(glasses, 20) }).map((_, i) => (
            <Droplets
              key={i}
              className="w-4 h-4 md:w-5 md:h-5 text-primary/70"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
          {glasses > 20 && (
            <span className="text-xs md:text-sm text-muted-foreground ml-1">+{glasses - 20}</span>
          )}
        </div>
      )}

      {/* Mobile: Main add button + quick amounts */}
      {isMobile ? (
        <>
          <div className="relative mb-6">
            <div
              key={rippleKey}
              className={rippleKey > 0 ? 'absolute inset-0 rounded-full bg-primary/20 animate-ripple' : 'hidden'}
            />
            <button
              onClick={() => handleAdd(250)}
              className="relative w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-light shadow-lg shadow-primary/30 tap-bounce active:shadow-primary/50 transition-shadow"
            >
              +
            </button>
          </div>
          <span className="text-xs text-muted-foreground mb-6">250 ml</span>
          <div className="flex gap-3">
            {QUICK_AMOUNTS.map(amount => (
              <button
                key={amount}
                onClick={() => handleAdd(amount)}
                className="px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium tap-bounce hover:bg-muted/80 transition-colors"
              >
                {amount}ml
              </button>
            ))}
          </div>
        </>
      ) : (
        /* iPad: Single row of action buttons */
        <div className="flex gap-4 mt-2">
          {QUICK_AMOUNTS.map(amount => (
            <button
              key={amount}
              onClick={() => handleAdd(amount)}
              className={`flex items-center gap-2 px-7 py-4 rounded-2xl bg-primary/15 text-primary text-base font-semibold shadow-sm hover:bg-primary/25 active:scale-90 transition-all duration-200 ${tappedAmount === amount ? 'animate-bounce-in' : ''}`}
            >
              <Plus className="w-4 h-4" />
              {amount}ml
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
