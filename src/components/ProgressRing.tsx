import { useEffect, useRef, useState } from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({ progress, size = 260, strokeWidth = 14 }: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - animatedProgress * circumference;
  const prevProgress = useRef(0);

  useEffect(() => {
    // Animate from previous to new progress
    const start = prevProgress.current;
    const end = progress;
    const duration = 600;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedProgress(start + (end - start) * eased);
      if (t < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    prevProgress.current = end;
  }, [progress]);

  return (
    <svg width={size} height={size} className="transform -rotate-90" style={{ overflow: 'visible' }}>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--progress-track))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-colors duration-300"
        style={{
          filter: progress >= 1 ? 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))' : 'none',
        }}
      />
      {/* Glow at tip when > 0 */}
      {animatedProgress > 0.02 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary) / 0.4)"
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: 'blur(6px)' }}
        />
      )}
    </svg>
  );
}
