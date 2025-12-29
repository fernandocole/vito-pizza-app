import { Settings, Users, MessageSquare, Info, Hourglass, Trash2, KeyRound } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export const ConfigView = ({ 
    base, config, setConfig, isDarkMode, resetAllOrders, newPass, setNewPass, confirmPass, 
    setConfirmPass, changePass, currentTheme 
}: any) => {
    return (
      <div className={`p-6 rounded-3xl border space-y-6 ${base.card}`}>
        <h3 className={`font-bold mb-4 flex items-center gap-2 ${base.subtext}`}><Settings size={18}/> Ajustes Globales</h3>
        
        <div className={`border-b pb-4 ${base.divider}`}>
            <label className={`text-sm font-bold flex items-center gap-2 mb-2 ${base.subtext}`}><Users size={16}/> Total Comensales (Lista)</label>
            <div className="flex gap-2">
                <input type="number" placeholder="10" value={config.total_invitados || ''} onChange={(e: any) => setConfig({...config, total_invitados: parseInt(e.target.value)})} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} />
                <button onClick={async () => { await supabase.from('configuracion_dia').update({ total_invitados: config.total_invitados }).eq('id', config.id); alert('Guardado'); }} className={`font-bold px-4 rounded-xl ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>OK</button>
            </div>
        </div>

        <div className={`border-b pb-4 ${base.divider}`}>
            <label className={`text-sm font-bold flex items-center gap-2 mb-2 ${base.subtext}`}><MessageSquare size={16}/> Mensaje Bienvenida</label>
            <div className="flex gap-2">
                <textarea 
                    placeholder="Mensaje personalizado..." 
                    value={config.mensaje_bienvenida || ''} 
                    onChange={(e: any) => setConfig({...config, mensaje_bienvenida: e.target.value})} 
                    className={`w-full p-3 rounded-xl border outline-none resize-none h-20 text-sm ${base.input}`} 
                />
                <button onClick={async () => { await supabase.from('configuracion_dia').update({ mensaje_bienvenida: config.mensaje_bienvenida }).eq('id', config.id); alert('Guardado'); }} className={`font-bold px-4 rounded-xl self-end h-20 flex items-center justify-center ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>OK</button>
            </div>
            {/* GLOSARIO */}
            <div className="flex flex-wrap gap-2 mt-2 text-xs opacity-60">
                <span className="font-bold flex items-center gap-1 w-full"><Info size={12}/> Variables disponibles:</span>
                <span className="bg-neutral-500/20 px-1.5 py-0.5 rounded font-mono">[nombre]</span>
                <span className="bg-neutral-500/20 px-1.5 py-0.5 rounded font-mono">[fecha]</span>
                <span className="bg-neutral-500/20 px-1.5 py-0.5 rounded font-mono">[hora]</span>
                <span className="bg-neutral-500/20 px-1.5 py-0.5 rounded font-mono">[pizzas]</span>
            </div>
        </div>

        <div className={`border-b pb-4 ${base.divider}`}>
            <label className={`text-sm font-bold flex items-center gap-2 mb-2 ${base.subtext}`}><Hourglass size={16}/> Minutos Recordatorio Calificación</label>
            <div className="flex gap-2">
                <input type="number" placeholder="10" value={config.tiempo_recordatorio_minutos || ''} onChange={(e: any) => setConfig({...config, tiempo_recordatorio_minutos: parseInt(e.target.value)})} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} />
                <button onClick={async () => { await supabase.from('configuracion_dia').update({ tiempo_recordatorio_minutos: config.tiempo_recordatorio_minutos }).eq('id', config.id); alert('Guardado'); }} className={`font-bold px-4 rounded-xl ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>OK</button>
            </div>
        </div>

        <div className="flex justify-between items-center">
            <label className={`text-sm ${base.subtext}`}>Modo Estricto</label>
            <button onClick={async () => { const n = !config.modo_estricto; setConfig({...config, modo_estricto: n}); await supabase.from('configuracion_dia').update({ modo_estricto: n }).eq('id', config.id); }} className={`w-12 h-6 rounded-full transition-colors relative ${config.modo_estricto ? 'bg-green-600' : 'bg-gray-400'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${config.modo_estricto ? 'left-7' : 'left-1'}`}></div>
            </button>
        </div>

        <div className="border-t pt-4 border-gray-200 dark:border-neutral-800">
            <button onClick={resetAllOrders} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Trash2 size={18}/> RESETEAR TODOS LOS PEDIDOS</button>
        </div>

        <div className={`border-t pt-4 ${base.divider}`}>
            <label className={`text-sm font-bold flex items-center gap-2 mb-2 ${base.subtext}`}><KeyRound size={16}/> Clave Invitados</label>
            <div className="flex gap-2">
                <input type="text" placeholder="Ej: pizza2024" value={config.password_invitados || ''} onChange={(e: any) => setConfig({...config, password_invitados: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} />
                <button onClick={async () => { await supabase.from('configuracion_dia').update({ password_invitados: config.password_invitados }).eq('id', config.id); alert('Guardado'); }} className={`font-bold px-4 rounded-xl ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>OK</button>
            </div>
        </div>

        <div className={`border-t pt-4 ${base.divider}`}>
            <label className={`text-sm ${base.subtext} mb-2 block`}>Contraseña Admin</label>
            <div className="flex flex-col gap-3">
                <input type="password" placeholder="Nueva..." value={newPass} onChange={(e: any) => setNewPass(e.target.value)} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} />
                <input type="password" placeholder="Confirmar..." value={confirmPass} onChange={(e: any) => setConfirmPass(e.target.value)} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} />
                <button onClick={changePass} className={`w-full ${currentTheme.color} text-white font-bold py-3 rounded-xl`}>GUARDAR</button>
            </div>
        </div>
      </div>
    );
};