import { useState } from 'react';
import { Flame, Clock, CheckCircle, ChefHat, UtensilsCrossed, Zap } from 'lucide-react';
import { CookingTimer } from '../../ui/CookingTimer';

export const KitchenView = ({ 
    metricas, base, isCompact, isDarkMode, currentTheme, toggleCocinando, entregar 
}: any) => {
    
    const [filter, setFilter] = useState<'all' | 'with_orders' | 'pending' | 'cooking' | 'ready'>('with_orders');

    const filteredMetrics = metricas.filter((p: any) => {
        const hasPending = p.totalPendientes > 0;
        const isReady = p.completas > 0;
        const isCooking = p.cocinando;
        const hasActivity = hasPending || isCooking || isReady;

        if (filter === 'all') return true; 
        if (filter === 'with_orders') return hasActivity; 
        if (filter === 'pending') return hasPending && !isCooking && !isReady;
        if (filter === 'cooking') return isCooking;
        if (filter === 'ready') return isReady;
        return true;
    });

    const getFilterBtnClass = (isActive: boolean) => 
        `px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-colors ${
            isActive 
            ? `${currentTheme.color} text-white border-transparent shadow-md` 
            : base.buttonSec
        }`;

    const getStatusConfig = (item: any) => {
        const isPizza = item.tipo === 'pizza';
        return {
            textReady: isPizza ? 'EN HORNO' : 'PREPARANDO',
            textAction: isPizza ? 'Al Horno' : 'Cocinar',
            color: isPizza ? 'bg-red-600 border-red-600' : 'bg-orange-500 border-orange-500', 
            icon: isPizza ? <Flame size={isCompact ? 14 : 16} className={item.cocinando ? "animate-bounce" : ""} /> : <UtensilsCrossed size={isCompact ? 14 : 16} className={item.cocinando ? "animate-pulse" : ""} />
        };
    };

    // Estilo seguro para botones de "1 unidad" (Evita texto blanco sobre fondo blanco)
    const singleActionBtnClass = `flex-1 bg-transparent border font-bold rounded-xl flex items-center justify-center gap-1 py-3 active:scale-95 transition-colors 
        ${isDarkMode 
            ? 'border-neutral-600 text-neutral-200 hover:bg-neutral-800 hover:text-white' 
            : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black'
        } text-[10px]`;

    return (
        <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setFilter('with_orders')} className={getFilterBtnClass(filter === 'with_orders')}>Con Pedidos</button>
                <button onClick={() => setFilter('all')} className={getFilterBtnClass(filter === 'all')}>Todas</button>
                <button onClick={() => setFilter('pending')} className={getFilterBtnClass(filter === 'pending')}>En Espera</button>
                <button onClick={() => setFilter('cooking')} className={getFilterBtnClass(filter === 'cooking')}>Cocinando</button>
                <button onClick={() => setFilter('ready')} className={getFilterBtnClass(filter === 'ready')}>Listas</button>
            </div>

            <div className="grid gap-3">
                {filteredMetrics.length === 0 ? (
                    <div className={`text-center py-10 opacity-50 ${base.subtext}`}>
                        <ChefHat size={40} className="mx-auto mb-2 opacity-30"/>
                        <p>No hay items en esta categoría</p>
                    </div>
                ) : (
                    filteredMetrics.map((p: any) => {
                        const sortedOrders = [...(p.pedidosPendientes || [])].sort((a: any, b: any) => 
                            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        );
                        const activeOrders = sortedOrders.filter((ped: any) => ped.estado !== 'entregado');
                        const displayNames = activeOrders.map((ped: any) => ped.invitado_nombre).join(', ');
                        
                        const config = getStatusConfig(p);

                        return (
                            <div key={p.id} className={`${base.card} rounded-3xl border relative overflow-hidden transition-all ${p.cocinando ? 'border-red-600/30 shadow-md' : ''} ${isCompact ? 'p-3' : 'p-5'}`}>
                                
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className={`font-bold leading-tight ${isCompact ? 'text-base' : 'text-xl'}`}>
                                                {p.nombre}
                                            </h3>
                                            
                                            {p.cocinando && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white whitespace-nowrap ${config.color}`}>
                                                    {config.textReady} ({p.enHorno})
                                                </span>
                                            )}

                                            {p.cocinando && p.cocinando_inicio && (
                                                <div className="scale-90 origin-left">
                                                    <CookingTimer start={p.cocinando_inicio} duration={p.tiempo_coccion || 60} />
                                                </div>
                                            )}

                                            {p.enEspera > 0 && (
                                                <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap bg-gray-500`}>
                                                    EN ESPERA ({p.enEspera})
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 text-xs opacity-70">
                                            <span className="flex items-center gap-1 font-mono"><Clock size={12}/> Tot. Pend: {p.totalPendientes}</span>
                                            <span className="flex items-center gap-1 font-mono">Stock: {p.stockRestante}</span>
                                        </div>
                                        
                                        {/* NOMBRES */}
                                        {displayNames && (
                                            <div className={`text-[10px] mt-2 opacity-80 leading-tight ${base.text} font-medium ${
                                                isCompact 
                                                    ? 'overflow-x-auto whitespace-nowrap no-scrollbar pb-1' 
                                                    : 'whitespace-normal break-words'
                                            }`}>
                                                <span className="opacity-50 uppercase mr-1 sticky left-0 font-bold">Piden:</span> 
                                                {displayNames}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* BARRA PROGRESO */}
                                <div className={`relative ${isDarkMode ? 'bg-black' : 'bg-gray-300'} rounded-full overflow-hidden z-10 mb-4 ${isCompact ? 'h-1.5' : 'h-2.5'}`}>
                                    <div className="absolute inset-0 flex justify-between px-[1px] z-20">
                                        {[...Array(p.target)].map((_, i) => <div key={i} className={`w-[1px] h-full ${isDarkMode ? 'bg-white/10' : 'bg-white/50'}`}></div>)}
                                    </div>
                                    <div className={`absolute h-full ${p.cocinando ? config.color : currentTheme.color} transition-all duration-700`} style={{ width: `${p.percent}%` }}></div>
                                </div>

                                <div className="flex gap-2 items-center">
                                    
                                    {/* IZQUIERDA: MOVER AL HORNO */}
                                    {p.enEspera > 0 ? (
                                        <div className="flex-1 flex gap-2">
                                            {/* BOTÓN 1 UNIDAD AL HORNO (Estilo Corregido) */}
                                            <button onClick={() => toggleCocinando(p, 'una')} className={singleActionBtnClass}>
                                                {config.icon} 1
                                            </button>
                                            
                                            {p.enEspera > 1 && (
                                                <button onClick={() => toggleCocinando(p, 'todas')} className={`flex-[1.5] ${config.color} text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 py-3 shadow-lg active:scale-95`}>
                                                    {config.icon} ¡Todos!
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`flex-1 text-center text-[10px] py-3 opacity-40 font-bold border rounded-xl border-dashed ${isDarkMode ? 'border-neutral-700' : 'border-gray-300'}`}>
                                            Nada en espera
                                        </div>
                                    )}

                                    {/* DERECHA: ENTREGAR */}
                                    {p.enHorno > 0 || p.enEspera > 0 ? (
                                        <>
                                            <div className="w-[1px] bg-gray-300 dark:bg-neutral-700 h-8 mx-1"></div>
                                            
                                            <div className="flex-[1.5] flex gap-2">
                                                {p.enHorno > 0 ? (
                                                    <>
                                                        {/* BOTÓN 1 UNIDAD LISTA (Estilo Corregido) */}
                                                        <button onClick={() => entregar(p, 'una', false)} className={singleActionBtnClass}>
                                                            <CheckCircle size={14} /> <span>1 Listo</span>
                                                        </button>
                                                        
                                                        {p.enHorno > 1 && (
                                                            <button onClick={() => entregar(p, 'todas', false)} className={`flex-1 ${currentTheme.color} text-white text-[10px] font-bold rounded-xl flex flex-col leading-none items-center justify-center gap-1 py-2 shadow-lg active:scale-95`}>
                                                                <CheckCircle size={14} /> <span>Todos</span>
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="flex-1"></div>
                                                )}

                                                {/* Botón Emergencia */}
                                                {p.enEspera > 0 && (
                                                    <button onClick={() => entregar(p, 'una', true)} className={`w-8 bg-yellow-500 text-black font-bold rounded-xl flex items-center justify-center shadow-lg active:scale-95`} title="Entregar directo (Emergencia)">
                                                        <Zap size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};