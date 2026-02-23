import { useEffect, useRef, useState } from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  mdSize?: number;
  strokeWidth?: number;
}

export default function ProgressRing({ progress, size = 260, mdSize, strokeWidth = 14 }: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    if (!mdSize) return;
    const mql = window.matchMedia('(min-width: 768px)');
    const update = () => setIsMd(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [mdSize]);

  const actualSize = mdSize && isMd ? mdSize : size;
  const actualStroke = isMd && mdSize ? strokeWidth + 4 : strokeWidth;
  const radius = (actualSize - actualStroke) / 2;
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
    <svg width={actualSize} height={actualSize} className="transform -rotate-90" style={{ overflow: 'visible' }}>
      {/* Track */}
      <circle
        cx={actualSize / 2}
        cy={actualSize / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--progress-track))"
        strokeWidth={actualStroke}
        strokeLinecap="round"
      />
      {/* Progress */}
      <circle
        cx={actualSize / 2}
        cy={actualSize / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={actualStroke}
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
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary) / 0.4)"
          strokeWidth={actualStroke + 6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: 'blur(6px)' }}
        />
      )}
    </svg>
  );
}
