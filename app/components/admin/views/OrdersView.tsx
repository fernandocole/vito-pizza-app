import { User, Flame, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Timer } from '../../ui/Timer';

export const OrdersView = ({ pedidosAgrupados, base, isDarkMode, eliminarPedidosGusto }: any) => {
    return (
        <div className="space-y-4">
            <div className={`p-4 rounded-3xl border mb-6 shadow-sm flex items-center justify-center ${base.card}`}>
                <h2 className={`text-sm font-bold uppercase tracking-widest ${base.textHead}`}>Pedidos Activos</h2>
            </div>
            {pedidosAgrupados.length === 0 ? <p className={`text-center ${base.subtext}`}>Sin pedidos.</p> : pedidosAgrupados.map((u: any, i: number) => { 
                return (
                    <div key={i} className={`${base.card} p-4 rounded-2xl border relative`}>
                        <div className={`flex justify-between border-b pb-2 mb-3 pr-10 ${base.divider}`}>
                            <h3 className="font-bold flex items-center gap-2 capitalize text-lg">
                                <User size={18}/> {u.nombre}
                                {u.totalEnHorno > 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">EN HORNO</span>}
                                {u.totalEnEspera > 0 && <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">ESPERANDO</span>}
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {u.detalle.map((d: any, k: number) => (
                                <div key={k} className={`flex justify-between items-center text-sm p-2 rounded-lg border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center">
                                        <span>{d.nombre}</span>
                                        {d.oldestPending && <Timer startTime={d.oldestPending} />}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold">
                                        {d.enHorno > 0 && (<span className="text-red-500 flex items-center gap-1"><Flame size={12}/> {d.enHorno}</span>)}
                                        {d.enEspera > 0 && (<span className="text-yellow-500 flex items-center gap-1"><Clock size={12}/> {d.enEspera}</span>)}
                                        {d.entregada > 0 && (<span className="text-green-500 flex items-center gap-1"><CheckCircle size={12}/> {d.entregada}</span>)}
                                        <button onClick={(e) => { e.stopPropagation(); eliminarPedidosGusto(u.nombre, d.id); }} className="p-1 ml-2 bg-red-900/20 text-red-500 rounded hover:bg-red-900/40 border border-red-900/30">
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ); 
            })}
        </div>
    );
};