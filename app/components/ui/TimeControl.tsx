'use client';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const TimeControl = ({ value, onChange, isDarkMode }: { value: number, onChange: (val: number) => void, isDarkMode: boolean }) => {
    const m = Math.floor(value / 60);
    const s = value % 60;

    const adjust = (type: 'm' | 's', amount: number) => {
        let newM = m;
        let newS = s;
        if (type === 'm') newM = Math.max(0, newM + amount);
        if (type === 's') {
            newS = newS + amount;
            if (newS >= 60) { newS -= 60; newM++; }
            if (newS < 0) { 
                if (newM > 0) { newS += 60; newM--; } else { newS = 0; }
            }
        }
        onChange(newM * 60 + newS);
    };

    const btnClass = isDarkMode ? "hover:bg-white/10 active:bg-white/20 text-white" : "hover:bg-black/10 active:bg-black/20 text-black";

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex w-full items-center justify-center gap-1">
                <div className="flex flex-col items-center">
                    <button onClick={() => adjust('m', 1)} className={`${btnClass} p-0.5 rounded`}><ChevronUp size={12}/></button>
                    <span className="text-sm font-mono font-bold leading-none">{m.toString().padStart(2,'0')}</span>
                    <button onClick={() => adjust('m', -1)} className={`${btnClass} p-0.5 rounded`}><ChevronDown size={12}/></button>
                </div>
                <span className="pb-1">:</span>
                <div className="flex flex-col items-center">
                    <button onClick={() => adjust('s', 10)} className={`${btnClass} p-0.5 rounded`}><ChevronUp size={12}/></button>
                    <span className="text-sm font-mono font-bold leading-none">{s.toString().padStart(2,'0')}</span>
                    <button onClick={() => adjust('s', -10)} className={`${btnClass} p-0.5 rounded`}><ChevronDown size={12}/></button>
                </div>
            </div>
        </div>
    );
};