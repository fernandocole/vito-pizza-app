import { Flame, Clock, CheckCircle } from 'lucide-react';
import { CookingTimer } from '../../ui/CookingTimer';

export const KitchenView = ({ 
    metricas, base, isCompact, isDarkMode, currentTheme, toggleCocinando, entregar 
}: any) => {
    return (
        <div className="grid gap-3">
            {metricas.map((p: any) => (
                <div key={p.id} className={`${base.card} rounded-3xl border relative overflow-hidden transition-all ${p.cocinando ? 'border-red-600/50 shadow-lg' : ''} ${isCompact ? 'p-3' : 'p-5'}`}>
                    {!isCompact && p.cocinando && (<div className="absolute -right-10 -bottom-10 text-red-600/20"><Flame size={150} /></div>)}
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                            <h3 className={`font-bold flex items-center gap-2 ${isCompact ? 'text-base' : 'text-xl'}`}>
                                {p.nombre}
                                {p.cocinando && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">EN HORNO</span>}
                            </h3>
                            <p className={`text-xs ${base.subtext} flex items-center gap-1 mt-1`}>
                                <Clock size={12}/> Pendientes: {p.totalPendientes}
                            </p>
                            <p className={`text-[10px] mt-1 font-mono ${p.stockRestante === 0 ? 'text-red-500 font-bold' : base.subtext}`}>STOCK: {p.stockRestante} u</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            {p.cocinando && p.cocinando_inicio && <CookingTimer start={p.cocinando_inicio} duration={p.tiempo_coccion || 60} />}
                            <button onClick={() => toggleCocinando(p)} className={`rounded-xl transition-all flex items-center justify-center ${p.cocinando ? 'bg-red-600 text-white shadow-lg scale-105' : base.buttonSec} ${isCompact ? 'p-2' : 'p-3'}`}>
                                <Flame size={isCompact ? 16 : 20} className={p.cocinando ? 'animate-bounce' : ''} />
                            </button>
                        </div>
                    </div>
                    <div className={`relative ${isDarkMode ? 'bg-black' : 'bg-gray-300'} rounded-full overflow-hidden z-10 mb-3 ${isCompact ? 'h-2' : 'h-4'}`}>
                        <div className="absolute inset-0 flex justify-between px-[1px] z-20">
                            {[...Array(p.target)].map((_, i) => <div key={i} className={`w-[1px] h-full ${isDarkMode ? 'bg-white/10' : 'bg-white/50'}`}></div>)}
                        </div>
                        <div className={`absolute h-full ${p.cocinando ? 'bg-red-600' : currentTheme.color} transition-all duration-700`} style={{ width: `${p.percent}%` }}></div>
                    </div>
                    {p.completas > 0 ? (
                        <button onClick={() => entregar(p)} className={`w-full ${currentTheme.color} text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 ${isCompact ? 'py-2 text-sm' : 'py-3'}`}>
                            <CheckCircle size={isCompact ? 16 : 20} /> ¡LISTA! ({p.completas})
                        </button>
                    ) : (
                        <div className={`w-full text-center text-xs ${base.subtext} font-mono border rounded-xl ${isDarkMode ? 'border-neutral-800' : 'border-gray-200'} ${isCompact ? 'py-1' : 'py-2'}`}>
                            Faltan {p.faltan} porc.
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};