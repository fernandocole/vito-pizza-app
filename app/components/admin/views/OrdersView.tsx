import { Trash2, AlertTriangle, Clock } from 'lucide-react';

export const OrdersView = ({ pedidosAgrupados, base, isDarkMode, eliminarPedidosGusto, resetAllOrders }: any) => {
    return (
        <div className="space-y-4">
            
            {/* HEADER CON BOTÓN DE BORRAR TODO */}
            <div className={`p-4 rounded-3xl border flex items-center justify-between ${base.card}`}>
                <h2 className="text-xl font-bold">Lista de Pedidos</h2>
                <button 
                    onClick={resetAllOrders} 
                    className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg active:scale-95"
                >
                    <Trash2 size={16} /> BORRAR TODO
                </button>
            </div>

            {pedidosAgrupados.length === 0 ? (
                <div className={`text-center py-20 opacity-50 ${base.subtext}`}>
                    <p>No hay pedidos pendientes</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {pedidosAgrupados.map((u: any) => (
                        <div key={u.nombre} className={`${base.card} rounded-3xl p-4 border relative overflow-hidden`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-lg leading-none">{u.nombre}</h3>
                                    <p className={`text-[10px] mt-1 font-mono opacity-60`}>Total: {u.totalPendienteGeneral} items</p>
                                </div>
                                {u.totalPendienteGeneral > 0 && (
                                    <button onClick={() => eliminarPedidosGusto(u.nombre)} className={`text-red-500 p-2 hover:bg-red-500/10 rounded-full transition-colors`}>
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {u.detalle.map((d: any) => (
                                    <div key={d.id} className={`flex items-center justify-between text-sm p-2 rounded-xl ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-50'}`}>
                                        <span className="font-medium">{d.nombre}</span>
                                        <div className="flex gap-2 text-xs font-bold">
                                            {d.entregada > 0 && <span className="text-green-500">{d.entregada} OK</span>}
                                            {d.enHorno > 0 && <span className="text-orange-500 flex items-center gap-1"><Clock size={10}/> {d.enHorno}</span>}
                                            {d.enEspera > 0 && <span className="opacity-50">{d.enEspera} Pend</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};