'use client';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const formatSeconds = (seconds: number) => {
  if (!seconds && seconds !== 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const CookingTimer = ({ start, duration, onFinish, small = false }: { start: string, duration: number, onFinish?: () => void, small?: boolean }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    useEffect(() => {
        if (!start) return;
        const interval = setInterval(() => {
            const startTime = new Date(start).getTime();
            const now = new Date().getTime();
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const remaining = Math.max(0, duration - elapsedSeconds);
            setTimeLeft(remaining);
            if (remaining === 0 && onFinish) onFinish();
        }, 1000);
        return () => clearInterval(interval);
    }, [start, duration, onFinish]);
    
    const isFinished = timeLeft === 0;

    // Versión reducida para la App de Invitados
    if (small) {
         return (
        <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 transition-colors ${isFinished ? 'bg-black/20 text-white/50' : 'bg-black/40 text-white'}`}>
            <Clock size={10}/> 
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
    );
    }

    // Versión completa para Admin
    return (
        <div className={`flex items-center gap-1 font-mono font-bold px-3 py-1 rounded-full text-xs transition-all duration-300 ${isFinished ? 'bg-red-600 text-white animate-bounce border-2 border-yellow-400 shadow-[0_0_15px_rgba(239,68,68,0.8)] scale-110' : 'bg-orange-100 text-orange-600 border border-orange-200'}`}>
            <Clock size={12} />
            <span>{isFinished ? 'LISTA!' : formatSeconds(timeLeft)}</span>
        </div>
    );
};