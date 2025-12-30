import { useState } from 'react';
import { Flame, Clock, CheckCircle, ChefHat } from 'lucide-react';
import { CookingTimer } from '../../ui/CookingTimer';

export const KitchenView = ({ 
    metricas, base, isCompact, isDarkMode, currentTheme, toggleCocinando, entregar 
}: any) => {
    
    // Estado para el filtro activo (default 'with_orders')
    const [filter, setFilter] = useState<'all' | 'with_orders' | 'pending' | 'cooking' | 'ready'>('with_orders');

    // Filtrar las métricas según la selección
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

    // Helper para generar la clase del botón
    const getFilterBtnClass = (isActive: boolean) => 
        `px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-colors ${
            isActive 
            ? `${currentTheme.color} text-white border-transparent shadow-md` 
            : base.buttonSec
        }`;

    // ROJO (Único color permitido fuera del tema, solo para horno)
    const cookingRed = "bg-red-500 text-white border-red-500";

    return (
        <div className="space-y-4">
            
            {/* BOTONERA DE FILTROS */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setFilter('with_orders')} className={getFilterBtnClass(filter === 'with_orders')}>Con Pedidos</button>
                <button onClick={() => setFilter('all')} className={getFilterBtnClass(filter === 'all')}>Todas</button>
                <button onClick={() => setFilter('pending')} className={getFilterBtnClass(filter === 'pending')}>En Espera</button>
                <button onClick={() => setFilter('cooking')} className={getFilterBtnClass(filter === 'cooking')}>En Horno</button>
                <button onClick={() => setFilter('ready')} className={getFilterBtnClass(filter === 'ready')}>Listas</button>
            </div>

            {/* GRID DE TARJETAS (DISEÑO ORIGINAL LIST VIEW) */}
            <div className="grid gap-3">
                {filteredMetrics.length === 0 ? (
                    <div className={`text-center py-10 opacity-50 ${base.subtext}`}>
                        <ChefHat size={40} className="mx-auto mb-2 opacity-30"/>
                        <p>No hay items en esta categoría</p>
                    </div>
                ) : (
                    filteredMetrics.map((p: any) => {
                        const pendingNames = Array.from(new Set(p.pedidosPendientes?.map((ped: any) => ped.invitado_nombre) || []));
                        const displayNames = pendingNames.join(', ');

                        return (
                            <div key={p.id} className={`${base.card} rounded-3xl border relative overflow-hidden transition-all ${p.cocinando ? 'border-red-600/50 shadow-lg' : ''} ${isCompact ? 'p-3' : 'p-5'}`}>
                                
                                <div className="flex justify-between items-center mb-2 relative z-10">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className={`font-bold ${isCompact ? 'text-base' : 'text-xl'}`}>
                                                {p.nombre}
                                            </h3>
                                            
                                            {/* Estados alineados al nombre */}
                                            {p.cocinando && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse whitespace-nowrap ${cookingRed}`}>
                                                    EN HORNO
                                                </span>
                                            )}
                                            {p.cocinando && p.cocinando_inicio && (
                                                <div className="scale-90 origin-left"><CookingTimer start={p.cocinando_inicio} duration={p.tiempo_coccion || 60} /></div>
                                            )}
                                            {p.completas > 0 && !p.cocinando && (
                                                <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap bg-gray-500`}>
                                                    EN ESPERA
                                                </span>
                                            )}
                                        </div>

                                        <p className={`text-xs ${base.subtext} flex items-center gap-1 mt-1`}>
                                            <Clock size={12}/> Pendientes: {p.totalPendientes}
                                        </p>
                                        <p className={`text-[10px] mt-1 font-mono ${p.stockRestante === 0 ? 'text-red-500 font-bold' : base.subtext}`}>STOCK: {p.stockRestante} u</p>
                                        
                                        {/* NOMBRE DE LAS PERSONAS */}
                                        {displayNames && (
                                            <p className={`text-[10px] mt-2 opacity-80 leading-tight truncate ${base.text} font-medium`}>
                                                <span className="opacity-50 uppercase mr-1">Piden:</span> 
                                                {displayNames}
                                            </p>
                                        )}
                                    </div>

                                    {/* Botón Fuego centrado a la derecha */}
                                    <div className="flex-shrink-0">
                                        <button onClick={() => toggleCocinando(p)} className={`rounded-xl transition-all flex items-center justify-center ${p.cocinando ? 'bg-red-600 text-white shadow-lg scale-105' : base.buttonSec} ${isCompact ? 'p-2' : 'p-3'}`}>
                                            <Flame size={isCompact ? 16 : 20} className={p.cocinando ? 'animate-bounce' : ''} />
                                        </button>
                                    </div>
                                </div>

                                {/* Barra de Progreso */}
                                <div className={`relative ${isDarkMode ? 'bg-black' : 'bg-gray-300'} rounded-full overflow-hidden z-10 mb-3 ${isCompact ? 'h-2' : 'h-4'}`}>
                                    <div className="absolute inset-0 flex justify-between px-[1px] z-20">
                                        {[...Array(p.target)].map((_, i) => <div key={i} className={`w-[1px] h-full ${isDarkMode ? 'bg-white/10' : 'bg-white/50'}`}></div>)}
                                    </div>
                                    <div className={`absolute h-full ${p.cocinando ? 'bg-red-600' : currentTheme.color} transition-all duration-700`} style={{ width: `${p.percent}%` }}></div>
                                </div>

                                {/* Botón de Acción (Lista / Faltan) */}
                                {p.completas > 0 ? (
                                    <button onClick={() => entregar(p)} className={`w-full ${currentTheme.color} text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 ${isCompact ? 'py-2 text-sm' : 'py-3'}`}>
                                        <CheckCircle size={isCompact ? 16 : 20} /> ¡LISTA! ({p.completas})
                                    </button>
                                ) : (
                                    // MODIFICACIÓN AQUÍ: Solo mostrar "Faltan..." si target > 1 (es decir, NO es unidad)
                                    p.target > 1 && (
                                        <div className={`w-full text-center text-xs ${base.subtext} font-mono border rounded-xl ${isDarkMode ? 'border-neutral-800' : 'border-gray-200'} ${isCompact ? 'py-1' : 'py-2'}`}>
                                            Faltan {p.faltan} porc.
                                        </div>
                                    )
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};