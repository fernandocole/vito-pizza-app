import { User, CheckCircle, Clock, Flame, RotateCcw, X } from 'lucide-react';

export const OrdersView = ({ 
    pedidosAgrupados, base, isDarkMode, eliminarPedidosGusto, resetAllOrders, eliminarUnidad 
}: any) => {
    
    return (
        <div className="pb-24 space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><User /> Pedidos por Usuario</h2>
                <button 
                    onClick={resetAllOrders}
                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg active:scale-95"
                >
                    BORRAR TODO EL DÍA
                </button>
            </div>

            {pedidosAgrupados.length === 0 ? (
                <div className={`p-8 rounded-3xl text-center border-2 border-dashed ${base.divider} opacity-50`}>
                    <p>No hay pedidos activos.</p>
                </div>
            ) : (
                pedidosAgrupados.map((u: any) => (
                    <div key={u.nombre} className={`p-4 rounded-2xl border ${base.card} shadow-sm animate-in fade-in slide-in-from-bottom-2`}>
                        <div className="flex justify-between items-start mb-3 border-b border-gray-200 dark:border-white/10 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-neutral-200 dark:bg-neutral-800 rounded-full"><User size={16}/></div>
                                <h3 className="font-bold text-lg">{u.nombre}</h3>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold opacity-60 block">Total Pendiente</span>
                                <span className="text-xl font-black">{u.totalPendienteGeneral}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {u.detalle.map((d: any) => (
                                <div key={d.id} className={`flex justify-between items-center p-2 rounded-xl ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm mb-1 flex items-center gap-2">
                                            {d.nombre}
                                            {/* BOTÓN DE BORRADO INDIVIDUAL */}
                                            <button 
                                                onClick={() => eliminarUnidad(u.nombre, d.id)}
                                                className="p-1 rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                                                title="Eliminar 1 unidad"
                                            >
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                                            {d.entregada > 0 && <span className="text-green-500 flex items-center gap-1"><CheckCircle size={10}/> {d.entregada} Listas</span>}
                                            {d.enHorno > 0 && <span className="text-orange-500 flex items-center gap-1"><Flame size={10}/> {d.enHorno} Horno</span>}
                                            {d.enEspera > 0 && <span className="opacity-50 flex items-center gap-1"><Clock size={10}/> {d.enEspera} Espera</span>}
                                        </div>
                                    </div>
                                    
                                    {d.oldestPending && (
                                        <div className="text-[9px] opacity-40 font-mono text-right">
                                            {new Date(d.oldestPending).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/5 flex justify-end">
                            <button 
                                onClick={() => eliminarPedidosGusto(u.nombre)}
                                className={`text-[10px] font-bold flex items-center gap-1 ${base.subtext} hover:text-red-500 transition-colors`}
                            >
                                <RotateCcw size={12} /> Limpiar Pendientes
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};