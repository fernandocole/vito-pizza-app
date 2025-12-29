'use client';
import { useState, useEffect } from 'react';

export const Timer = ({ startTime }: { startTime: string }) => {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const update = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  return <span className="ml-2 font-mono text-[10px] opacity-70 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full border border-current">{elapsed}</span>;
};