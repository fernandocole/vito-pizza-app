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
    
    // NOTA: duration debe llegar en SEGUNDOS.
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (!start) return;
        const interval = setInterval(() => {
            const startTime = new Date(start).getTime();
            const now = new Date().getTime();
            
            // Calculamos segundos transcurridos con protección de zona horaria
            const elapsedSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
            
            // Calculamos restante
            const remaining = Math.max(0, duration - elapsedSeconds);
            
            setTimeLeft(remaining);
            if (remaining === 0 && onFinish) onFinish();
        }, 1000);
        return () => clearInterval(interval);
    }, [start, duration, onFinish]);
    
    const isFinished = timeLeft === 0;

    // Versión reducida (para App Invitados)
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
        <div className={`flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-full text-xs transition-all duration-300 ${
            isFinished 
            ? 'bg-gray-600 text-white shadow-sm' // Listo: Gris oscuro, sin resplandor
            : 'bg-gray-500 text-white border border-gray-400/30' // Contando: Gris medio
        }`}>
            <Clock size={12} className={isFinished ? '' : 'animate-pulse'} />
            <span className="tabular-nums">
                {isFinished ? 'LISTO' : formatSeconds(timeLeft)}
            </span>
        </div>
    );
};