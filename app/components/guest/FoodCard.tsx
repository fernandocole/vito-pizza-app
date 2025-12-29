import { Maximize2, Star, Minus, Plus, Pizza, Sandwich, Utensils } from 'lucide-react';
import { CookingTimer } from '../ui/CookingTimer';

export const FoodCard = ({ 
    pizza, base, isCompact, isDarkMode, currentTheme, zoomLevel, t, DESC_SIZES, STOCK_SIZES,
    setImageToView, miHistorial, misValoraciones, openRating, modificarPedido 
}: any) => {
    // Helper para verificar historial de esta pizza
    const hist = miHistorial[pizza.id];
    const pendientes = hist?.pendientes || 0;
    const comidos = hist?.comidos || 0;
    
    // Determinar tipo
    const isBurger = pizza.tipo === 'burger';
    const isOther = pizza.tipo === 'other';
    // Si es Burger u Otro, se trata como unidad (no se comparte en porciones con otros)
    const isUnit = isBurger || isOther;

    return (
        <div className={`${base.card} ${isCompact ? 'rounded-3xl' : 'rounded-[36px]'} border ${pizza.stockRestante === 0 ? 'border-neutral-200 dark:border-neutral-800' : pizza.cocinando ? 'border-red-600/30' : ''} shadow-lg relative overflow-hidden group ${isCompact ? 'p-3' : 'p-5'}`}>
            
            {/* Imagen Grande */}
            {!isCompact && pizza.imagen_url && (
                <div className="mb-4 w-full h-40 rounded-2xl overflow-hidden relative cursor-pointer" onClick={() => setImageToView(pizza.imagen_url)}>
                    <img src={pizza.imagen_url} alt={pizza.displayName} className="w-full h-full object-cover transition-transform hover:scale-105" />
                    <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white"><Maximize2 size={14}/></div>
                </div>
            )}

            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Avatar en Compacto */}
                        {isCompact && pizza.imagen_url && (
                            <img src={pizza.imagen_url} onClick={(e)=>{e.stopPropagation(); setImageToView(pizza.imagen_url)}} className="w-10 h-10 rounded-full object-cover border border-white/20 cursor-pointer hover:scale-110 transition-transform"/>
                        )}

                        {/* ICONO IDENTIFICADOR */}
                        {isBurger ? (
                            <Sandwich size={isCompact ? 16 : 20} className="text-orange-500" />
                        ) : isOther ? (
                            <Utensils size={isCompact ? 16 : 20} className="text-blue-500" />
                        ) : (
                            <Pizza size={isCompact ? 16 : 20} className="text-red-500" />
                        )}

                        <h2 className={`font-bold ${isCompact ? 'text-lg' : 'text-2xl'} ${pizza.stockRestante === 0 ? 'text-gray-400 dark:text-neutral-600' : base.text}`}>{pizza.displayName}</h2>
                        
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs ${base.badge}`}>
                            <Star size={12} className={pizza.countRating > 0 ? "text-yellow-500" : "text-gray-500 opacity-50"} fill="currentColor" />
                            <span className={`font-bold ${pizza.countRating > 0 ? '' : 'text-gray-500 opacity-50'}`}>{pizza.avgRating || '0.0'}</span>
                            <span className={`text-[10px] ${pizza.countRating > 0 ? 'opacity-60' : 'text-gray-500 opacity-40'}`}>({pizza.countRating || 0})</span>
                            {comidos > 0 && !misValoraciones.includes(pizza.id) && (
                                <button onClick={() => openRating(pizza)} className="ml-1 bg-yellow-500 text-black px-1.5 py-0.5 rounded text-[9px] font-bold animate-pulse hover:scale-105 transition-transform">{t.rateBtn}</button>
                            )}
                        </div>
                        {pizza.cocinando && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">{t.inOven}</span>}
                        {pizza.cocinando && pizza.cocinando_inicio && <CookingTimer start={pizza.cocinando_inicio} duration={pizza.tiempo_coccion || 60} small={true}/>}
                    </div>
                    {!isCompact && (<p className={`leading-relaxed max-w-[200px] ${base.subtext} ${DESC_SIZES[zoomLevel]}`}>{pizza.displayDesc}</p>)}
                    
                    {/* TEXTO DE STOCK DIFERENCIADO */}
                    <p className={`font-mono mt-1 ${pizza.stockRestante === 0 ? 'text-red-500 font-bold' : base.subtext} ${STOCK_SIZES[zoomLevel]}`}>
                        {pizza.stockRestante === 0 ? t.soldOut : (
                            isUnit 
                            ? `Stock: ${pizza.stockRestante} u.` 
                            : `${t.ingredientsFor} ${pizza.stockRestante} ${t.portionsMore}`
                        )}
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-1 ml-2">
                    {pendientes > 0 && (<span className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-neutral-800 border-neutral-800 text-white'}`}>PEDISTE: {pendientes}</span>)}
                    {comidos > 0 && (<span className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-neutral-800 border-neutral-800 text-white'}`}>COMISTE: {comidos}</span>)}
                </div>
            </div>

            {/* BARRA DE PROGRESO (SOLO PARA PIZZAS) */}
            {!isUnit && (
                <div className={`rounded-2xl border ${isCompact ? 'p-2 mb-2 mt-1' : 'p-3 mb-5 mt-4'} ${base.progressBg}`}>
                    <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2 ${base.subtext}`}>
                        <span>{pizza.faltanParaCompletar === pizza.target ? t.newPizza : t.progress}</span>
                        <span className={pizza.faltanParaCompletar === 0 ? currentTheme.text : base.subtext}>{pizza.faltanParaCompletar > 0 ? `${t.missing} ${pizza.faltanParaCompletar}` : t.completed}</span>
                    </div>
                    <div className={`rounded-full overflow-hidden flex border ${isCompact ? 'h-1.5' : 'h-2'} ${base.progressTrack}`}>
                        {[...Array(pizza.target)].map((_, i) => (
                            <div key={i} className={`flex-1 border-r last:border-0 ${isDarkMode ? 'border-black/50' : 'border-white/50'} ${i < pizza.ocupadasActual ? `bg-gradient-to-r ${currentTheme.name === 'Carbone' ? 'from-white to-neutral-300' : currentTheme.gradient}` : 'bg-transparent'}`}></div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Espaciador si es Unit para alinear botones */}
            {isUnit && <div className="mb-4"></div>}

            {/* BOTONES */}
            <div className="flex gap-3">
                {pendientes > 0 && (
                    <button onClick={() => modificarPedido(pizza, 'restar')} className={`rounded-2xl flex items-center justify-center border active:scale-95 transition ${base.buttonSec} ${isCompact ? 'w-12 h-10' : 'w-16 h-14'}`}>
                        <Minus size={isCompact ? 16 : 20} />
                    </button>
                )}
                {pizza.stockRestante > 0 ? (
                    <button onClick={() => modificarPedido(pizza, 'sumar')} className={`flex-1 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${currentTheme.gradient} hover:brightness-110 ${isCompact ? 'h-10 text-base' : 'h-14 text-lg'}`}>
                        <Plus size={isCompact ? 18 : 24} strokeWidth={3} /> {t.buttonOrder}
                    </button>
                ) : (
                    <div className={`flex-1 rounded-2xl font-bold flex items-center justify-center border ${isDarkMode ? 'text-neutral-500 bg-neutral-900 border-neutral-800' : 'text-gray-400 bg-gray-100 border-gray-200'} ${isCompact ? 'h-10 text-xs' : 'h-14 text-sm'}`}>{t.soldOut}</div>
                )}
            </div>
        </div>
    );
};