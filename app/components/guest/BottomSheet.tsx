import { ChevronUp, Clock, Flame, ChefHat, X, Minus, ImageIcon } from 'lucide-react';

export const BottomSheet = ({ 
    summarySheet, setSummarySheet, base, isDarkMode, currentTheme, mySummary, t, summaryData, modificarPedido 
}: any) => {
    
    if (!summarySheet) {
        return (
            <div className={`fixed bottom-4 left-4 right-4 z-50 rounded-full p-3 shadow-2xl ${base.bar}`}>
                <div className="max-w-lg mx-auto flex justify-around items-center text-xs font-bold">
                    <button onClick={() => setSummarySheet('total')} className={`flex flex-col items-center flex-1 transition-colors`}>
                        <ChevronUp size={12} className={`mb-1 transition-transform duration-300`} />
                        <span className="opacity-60 text-[9px] uppercase tracking-wider">{t.sumTotal}</span>
                        <span className="text-base">{mySummary.total}</span>
                    </button>
                    
                    <div className="h-6 w-[1px] bg-current opacity-20"></div>

                    <button onClick={() => setSummarySheet('wait')} className={`flex flex-col items-center flex-1 transition-colors`}>
                        <ChevronUp size={12} className={`mb-1 transition-transform duration-300`} />
                        <span className="opacity-60 text-[9px] uppercase tracking-wider flex items-center gap-1"><Clock size={10}/> {t.sumWait}</span>
                        <span className="text-base">{mySummary.wait}</span>
                    </button>
                    
                    <div className="h-6 w-[1px] bg-current opacity-20"></div>

                    <button onClick={() => setSummarySheet('oven')} className={`flex flex-col items-center flex-1 transition-colors`}>
                        <ChevronUp size={12} className={`mb-1 transition-transform duration-300`} />
                        <span className="opacity-60 text-[9px] uppercase tracking-wider flex items-center gap-1"><Flame size={10}/> {t.sumOven}</span>
                        <span className="text-base">{mySummary.oven}</span>
                    </button>
                    
                    <div className="h-6 w-[1px] bg-current opacity-20"></div>

                    <button onClick={() => setSummarySheet('ready')} className={`flex flex-col items-center flex-1 transition-colors`}>
                        <ChevronUp size={12} className={`mb-1 transition-transform duration-300`} />
                        <span className="opacity-60 text-[9px] uppercase tracking-wider flex items-center gap-1"><ChefHat size={10}/> {t.sumReady}</span>
                        <span className="text-base">{mySummary.ready}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setSummarySheet(null)}></div>
            <div className={`fixed bottom-4 left-4 right-4 z-50 rounded-3xl p-5 shadow-2xl border animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[60vh] ${base.bar}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        {summarySheet === 'total' && <span>{t.summaryTotalTitle}</span>}
                        {summarySheet === 'wait' && <span className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}><Clock size={20}/> {t.summaryWaitTitle}</span>}
                        {summarySheet === 'oven' && <span className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}><Flame size={20}/> {t.summaryOvenTitle}</span>}
                        {summarySheet === 'ready' && <span className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}><ChefHat size={20}/> {t.summaryReadyTitle}</span>}
                    </h3>
                    <button onClick={() => setSummarySheet(null)} className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}><X size={20}/></button>
                </div>
                
                <div className="overflow-y-auto no-scrollbar space-y-2 pr-1">
                    {summaryData.length === 0 ? (
                        <p className={`text-center py-4 text-xs opacity-60 ${isDarkMode ? 'text-white' : 'text-black'}`}>...</p>
                    ) : (
                        summaryData.map((p: any) => (
                            <div key={p.id} className={`flex items-center justify-between p-2 rounded-xl ${isDarkMode ? 'bg-white/10' : 'bg-gray-100/80'} border border-transparent`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 border border-white/20 flex-shrink-0">
                                        {p.imagen_url ? <img src={p.imagen_url} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-neutral-400"><ImageIcon size={16}/></div>}
                                    </div>
                                    <div className="leading-tight">
                                        <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>{p.displayName}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-black'}`}>x{p.count}</span>
                                    {!p.cocinando && (summarySheet === 'wait' || summarySheet === 'total') && (
                                        <button onClick={() => modificarPedido(p, 'restar')} className="p-1 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 active:scale-95 transition-all">
                                            <Minus size={16}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};