import { type Settings } from '@/hooks/useWaterTracker';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SettingsScreenProps {
  settings: Settings;
  onUpdate: (partial: Partial<Settings>) => void;
  onResetToday: () => void;
}

const GLASS_SIZES = [150, 200, 250, 300, 500];
const REMINDER_OPTIONS = [
  { value: '1h', label: 'Every 1 hour' },
  { value: '1.5h', label: 'Every 1.5 hours' },
  { value: '2h', label: 'Every 2 hours' },
  { value: '3h', label: 'Every 3 hours' },
  { value: 'off', label: 'Off' },
];

export default function SettingsScreen({ settings, onUpdate, onResetToday }: SettingsScreenProps) {
  return (
    <div className="flex flex-col flex-1 px-5 pb-28 pt-16 overflow-y-auto min-h-[calc(100vh-80px)]">
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      {/* Daily goal */}
      <div className="glass-surface rounded-2xl p-5 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-foreground">Daily Goal</span>
          <span className="text-sm font-bold text-primary">{settings.dailyGoal} ml</span>
        </div>
        <Slider
          value={[settings.dailyGoal]}
          onValueChange={([v]) => onUpdate({ dailyGoal: v })}
          min={1000}
          max={4000}
          step={250}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">1000ml</span>
          <span className="text-[10px] text-muted-foreground">4000ml</span>
        </div>
      </div>

      {/* Glass size */}
      <div className="glass-surface rounded-2xl p-5 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Default Glass Size</span>
          <Select value={String(settings.defaultGlass)} onValueChange={v => onUpdate({ defaultGlass: Number(v) })}>
            <SelectTrigger className="w-28 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GLASS_SIZES.map(s => (
                <SelectItem key={s} value={String(s)}>{s} ml</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reminder */}
      <div className="glass-surface rounded-2xl p-5 mb-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-foreground">Reminder Interval</span>
          <Select value={settings.reminderInterval} onValueChange={v => onUpdate({ reminderInterval: v })}>
            <SelectTrigger className="w-36 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REMINDER_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {settings.reminderInterval !== 'off' && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Wake Time</label>
              <input
                type="time"
                value={settings.wakeTime}
                onChange={e => onUpdate({ wakeTime: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-muted text-foreground text-sm border-none outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Sleep Time</label>
              <input
                type="time"
                value={settings.sleepTime}
                onChange={e => onUpdate({ sleepTime: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-muted text-foreground text-sm border-none outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Dark mode */}
      <div className="glass-surface rounded-2xl p-5 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Dark Mode</span>
          <Switch
            checked={settings.darkMode}
            onCheckedChange={v => onUpdate({ darkMode: v })}
          />
        </div>
      </div>

      {/* Reset */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="w-full py-3 rounded-2xl bg-destructive/10 text-destructive text-sm font-medium tap-bounce">
            Reset Today's Progress
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Progress?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all water entries for today. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onResetToday} className="rounded-xl bg-destructive text-destructive-foreground">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
