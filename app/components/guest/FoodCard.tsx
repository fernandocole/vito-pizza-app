import { 
    Maximize2, Star, Minus, Plus, Pizza, Utensils, 
    ChefHat, MessageSquare, Flame 
  } from 'lucide-react';
  
  // Componente local para el icono de Hamburguesa (para no depender de imports externos)
  const BurgerIcon = ({ className }: { className?: string }) => (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
      >
        <path d="M19.1 8a6 6 0 0 0-14.2 0" />
        <path d="M4 11h16" />
        <rect x="4" y="15" width="16" height="4" rx="2" />
        <path d="M4 15h16" />
      </svg>
  );
  
  export const FoodCard = ({ 
      pizza, base, isCompact, isDarkMode, currentTheme, zoomLevel, t, 
      DESC_SIZES, STOCK_SIZES, setImageToView, miHistorial, misValoraciones, 
      openRating, modificarPedido 
  }: any) => {
      
      const hist = miHistorial[pizza.id];
      const pendientes = hist?.pendientes || 0;
      const comidos = hist?.comidos || 0;
      
      const isBurger = pizza.tipo === 'burger';
      const isOther = pizza.tipo === 'other';
      const isUnit = isBurger || isOther; 
  
      return (
          <div className={`${base.card} ${isCompact ? 'rounded-3xl' : 'rounded-[36px]'} border ${pizza.stockRestante === 0 ? 'border-neutral-200 dark:border-neutral-800' : pizza.cocinando ? 'border-red-600/50 ring-1 ring-red-500/20' : ''} shadow-lg relative overflow-hidden group ${isCompact ? 'p-3' : 'p-5'} transition-all duration-300`}>
              
              {/* IMAGEN GRANDE ARRIBA (Diseño Clásico) */}
              {!isCompact && pizza.imagen_url && (
                  <div 
                      className="mb-4 w-full h-44 rounded-2xl overflow-hidden relative cursor-pointer group-hover:shadow-md transition-all" 
                      onClick={() => setImageToView(pizza.imagen_url)}
                  >
                      <img 
                          src={pizza.imagen_url} 
                          alt={pizza.displayName} 
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                      />
                      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 size={14}/>
                      </div>
                  </div>
              )}
  
              <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                      {/* CABECERA */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                          
                          {/* Miniatura en modo compacto */}
                          {isCompact && pizza.imagen_url && (
                              <img 
                                  src={pizza.imagen_url} 
                                  onClick={(e)=>{e.stopPropagation(); setImageToView(pizza.imagen_url)}} 
                                  className="w-10 h-10 rounded-full object-cover border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                              />
                          )}
  
                          {/* ICONO DEL TIPO DE COMIDA (Solo si NO hay imagen) */}
                          {!pizza.imagen_url && (
                              isBurger ? (
                                  <BurgerIcon className={`text-orange-500 ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`} /> 
                              ) : isOther ? (
                                  <Utensils size={isCompact ? 16 : 20} className="text-blue-500" /> 
                              ) : (
                                  <Pizza size={isCompact ? 16 : 20} className="text-red-500" />
                              )
                          )}
  
                          <h2 className={`font-black leading-none ${isCompact ? 'text-lg' : 'text-2xl'} ${pizza.stockRestante === 0 ? 'text-gray-400 dark:text-neutral-600' : base.text}`}>
                              {pizza.displayName}
                          </h2>
                          
                          {/* Rating Badge */}
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs ${base.badge}`}>
                              <Star size={12} className={pizza.countRating > 0 ? "text-yellow-500" : "text-gray-500 opacity-50"} fill={pizza.countRating > 0 ? "currentColor" : "none"} />
                              <span className={`font-bold ${pizza.countRating > 0 ? '' : 'text-gray-500 opacity-50'}`}>{pizza.avgRating || '0.0'}</span>
                              <span className={`text-[10px] ${pizza.countRating > 0 ? 'opacity-60' : 'text-gray-500 opacity-40'}`}>({pizza.countRating || 0})</span>
                              {comidos > 0 && !misValoraciones.includes(pizza.id) && (
                                  <button onClick={() => openRating(pizza)} className="ml-1 bg-yellow-500 text-black px-1.5 py-0.5 rounded text-[9px] font-bold animate-pulse hover:scale-105 transition-transform">{t.rateBtn}</button>
                              )}
                          </div>
  
                          {/* Estado Cocinando */}
                          {pizza.cocinando && (
                              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-1">
                                  <Flame size={10} fill="white"/> {t.inOven}
                              </span>
                          )}
                      </div>
  
                      {/* Descripción */}
                      {!isCompact && (
                          <p className={`leading-relaxed max-w-[90%] opacity-70 ${base.subtext} ${DESC_SIZES[zoomLevel]}`}>
                              {pizza.displayDesc}
                          </p>
                      )}
                      
                      {/* Stock Text */}
                      <p className={`font-mono mt-1 ${pizza.stockRestante === 0 ? 'text-red-500 font-bold' : base.subtext} ${STOCK_SIZES[zoomLevel]}`}>
                          {pizza.stockRestante === 0 ? t.soldOut : (
                              isUnit 
                              ? `${t.stockLabel} ${pizza.stockRestante} ${t.units}` 
                              : `${t.ingredientsFor} ${pizza.stockRestante} ${t.portionsMore}`
                          )}
                      </p>
                  </div>
                  
                  {/* Badges de Usuario (Pedidos/Comidos) */}
                  <div className="flex flex-col items-end gap-1 ml-2">
                      {pendientes > 0 && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-neutral-800 border-neutral-800 text-white'}`}>
                              {t.youOrdered} {pendientes}
                          </span>
                      )}
                      {comidos > 0 && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-neutral-800 border-neutral-800 text-white'}`}>
                              {t.youAte} {comidos}
                          </span>
                      )}
                  </div>
              </div>
  
              {/* BARRA DE PROGRESO (Solo para Pizzas) */}
              {!isUnit && (
                  <div className={`rounded-2xl border ${isCompact ? 'p-2 mb-2 mt-1' : 'p-3 mb-5 mt-4'} ${base.progressBg}`}>
                      <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2 ${base.subtext}`}>
                          <span>{pizza.faltanParaCompletar === pizza.target ? t.newPizza : t.progress}</span>
                          <span className={pizza.faltanParaCompletar === 0 ? currentTheme.text : base.subtext}>
                              {pizza.faltanParaCompletar > 0 ? `${t.missing} ${pizza.faltanParaCompletar}` : t.completed}
                          </span>
                      </div>
                      <div className={`rounded-full overflow-hidden flex border ${isCompact ? 'h-1.5' : 'h-2'} ${base.progressTrack}`}>
                          {[...Array(pizza.target)].map((_, i) => (
                              <div 
                                  key={i} 
                                  className={`flex-1 border-r last:border-0 ${isDarkMode ? 'border-black/50' : 'border-white/50'} ${i < pizza.ocupadasActual ? `bg-gradient-to-r ${currentTheme.name === 'Carbone' ? 'from-white to-neutral-300' : currentTheme.gradient}` : 'bg-transparent'}`}
                              ></div>
                          ))}
                      </div>
                  </div>
              )}
              
              {isUnit && <div className="mb-4"></div>}
  
              {/* BOTONES DE ACCIÓN */}
              <div className="flex gap-3">
                  {pendientes > 0 && (
                      <button 
                          onClick={() => modificarPedido(pizza, 'restar')} 
                          className={`rounded-2xl flex items-center justify-center border active:scale-95 transition ${base.buttonSec} ${isCompact ? 'w-12 h-10' : 'w-16 h-14'}`}
                      >
                          <Minus size={isCompact ? 16 : 20} />
                      </button>
                  )}
                  {pizza.stockRestante > 0 ? (
                      <button 
                          onClick={() => modificarPedido(pizza, 'sumar')} 
                          className={`flex-1 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${currentTheme.gradient} hover:brightness-110 ${isCompact ? 'h-10 text-base' : 'h-14 text-lg'}`}
                      >
                          <Plus size={isCompact ? 18 : 24} strokeWidth={3} /> {t.buttonOrder}
                      </button>
                  ) : (
                      <div className={`flex-1 rounded-2xl font-bold flex items-center justify-center border ${isDarkMode ? 'text-neutral-500 bg-neutral-900 border-neutral-800' : 'text-gray-400 bg-gray-100 border-gray-200'} ${isCompact ? 'h-10 text-xs' : 'h-14 text-sm'}`}>
                          {t.soldOut}
                      </div>
                  )}
              </div>
          </div>
      );
  };