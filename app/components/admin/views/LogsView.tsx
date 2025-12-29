import { useState } from 'react';
import { Smartphone, Monitor, Globe, MapPin, Clock, ShieldAlert, Edit2, Check, X, RefreshCw } from 'lucide-react';

export const LogsView = ({ base, logs, isDarkMode, currentTheme, updateLogName, onRefresh }: any) => {
    
    // Estado local para la edición
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempName, setTempName] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit'});
    };

    const handleStartEdit = (log: any) => {
        setEditingId(log.id);
        setTempName(log.invitado_nombre || '');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTempName('');
    };

    const handleSaveEdit = (id: string) => {
        updateLogName(id, tempName);
        setEditingId(null);
    };

    const handleManualRefresh = async () => {
        if (!onRefresh) return;
        setIsRefreshing(true);
        await onRefresh();
        setTimeout(() => setIsRefreshing(false), 800); // Pequeño delay visual para que se vea el giro
    };

    return (
        <div className="space-y-4 animate-in fade-in">
            <div className={`p-4 rounded-3xl border ${base.card} flex justify-between items-center`}>
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${currentTheme.color} text-white shadow-lg`}>
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold leading-none">Registro de Accesos</h2>
                        <p className={`text-xs ${base.subtext} mt-1`}>Total visitas hoy: {logs.length}</p>
                    </div>
                </div>
                
                {/* BOTON DE REFRESCO MANUAL */}
                <button 
                    onClick={handleManualRefresh}
                    className={`p-3 rounded-xl border transition-all active:scale-95 ${base.buttonSec} ${isRefreshing ? 'animate-spin' : ''}`}
                    title="Actualizar lista"
                >
                    <RefreshCw size={20}/>
                </button>
            </div>

            <div className="space-y-2">
                {logs.length === 0 ? (
                    <div className={`text-center py-10 opacity-50 ${base.subtext}`}>No hay registros aún...</div>
                ) : (
                    logs.map((log: any) => (
                        <div key={log.id} className={`p-4 rounded-2xl border flex flex-col gap-2 relative overflow-hidden ${base.card} ${!log.invitado_nombre ? 'opacity-70' : ''}`}>
                            {/* Barra lateral de estado */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${log.invitado_nombre ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            
                            <div className="flex justify-between items-start pl-2">
                                <div className="flex items-center gap-2 flex-1">
                                    {log.device?.toLowerCase().includes('mobile') || log.device?.toLowerCase().includes('iphone') || log.device?.toLowerCase().includes('android') 
                                        ? <Smartphone size={18} className="text-blue-500 flex-shrink-0"/> 
                                        : <Monitor size={18} className="text-purple-500 flex-shrink-0"/>
                                    }
                                    
                                    {/* Lógica de Edición */}
                                    {editingId === log.id ? (
                                        <div className="flex items-center gap-1 w-full max-w-[200px]">
                                            <input 
                                                type="text" 
                                                value={tempName} 
                                                onChange={(e) => setTempName(e.target.value)}
                                                className={`text-sm px-2 py-1 rounded border outline-none w-full ${base.input}`}
                                                placeholder="Nombre..."
                                                autoFocus
                                            />
                                            <button onClick={() => handleSaveEdit(log.id)} className="p-1 text-green-500 hover:bg-green-500/10 rounded"><Check size={14}/></button>
                                            <button onClick={handleCancelEdit} className="p-1 text-red-500 hover:bg-red-500/10 rounded"><X size={14}/></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group">
                                            <span className={`font-bold text-sm ${log.invitado_nombre ? base.text : base.subtext}`}>
                                                {log.invitado_nombre || 'Visitante Anónimo'}
                                            </span>
                                            <button onClick={() => handleStartEdit(log)} className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded ${base.subtext}`}>
                                                <Edit2 size={10}/>
                                            </button>
                                            {log.is_manual_edit && (
                                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">
                                                    EDITADO
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-mono opacity-60 ml-2 whitespace-nowrap">
                                    <Clock size={10} /> {formatDate(log.created_at)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pl-2 mt-1">
                                <div className={`flex items-center gap-1.5 text-[10px] ${base.subtext}`}>
                                    <Globe size={12}/> {log.ip || 'IP Oculta'}
                                </div>
                                <div className={`flex items-center gap-1.5 text-[10px] ${base.subtext}`}>
                                    <MapPin size={12}/> {log.ciudad ? `${log.ciudad}, ${log.pais}` : 'Ubicación desc.'}
                                </div>
                                <div className={`col-span-2 text-[10px] opacity-50 truncate font-mono bg-black/5 dark:bg-white/5 p-1 rounded`}>
                                    {log.device} - {log.browser}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};