import { Star, RotateCcw, BarChart3 } from 'lucide-react';

export const RankingView = ({ base, delAllVal, ranking, delValPizza }: any) => {
    return (
        <div className="space-y-6">
            <div className={`p-6 rounded-3xl ${base.card} mb-6 shadow-sm flex justify-between items-center`}>
                <h3 className={`font-bold uppercase tracking-widest text-sm ${base.textHead}`}>Ranking & Feedback</h3>
                <button onClick={delAllVal} className="text-[10px] bg-red-900/30 text-red-500 px-3 py-1 rounded-full border border-red-900/50 hover:bg-red-900/50 transition-colors">RESET ALL</button>
            </div>
            <div className="grid gap-3">
                {ranking.map((p: any) => (
                    <div key={p.id} className={`p-3 rounded-2xl border flex justify-between items-center ${base.card}`}>
                        <div className="flex items-center gap-3">
                            <div className="text-center w-12">
                                <div className="text-xl font-bold text-yellow-500 flex justify-center items-center gap-0.5">{p.avg} <Star size={12} fill="currentColor"/></div>
                                <div className={`text-[9px] ${base.subtext}`}>{p.count} votes</div>
                            </div>
                            <div>
                                <div className="font-bold text-sm">{p.nombre}</div>
                                <div className={`text-[10px] ${base.subtext}`}>{p.totalOrders} porciones</div>
                            </div>
                        </div>
                        <button onClick={() => delValPizza(p.id)} className="p-2 text-neutral-500 hover:text-red-500 transition-colors" title="Reset item">
                            <RotateCcw size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};