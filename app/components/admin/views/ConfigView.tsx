import { Lock, Save, Trash2, Clock, Smartphone, RotateCcw, Users, KeyRound } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Inicializamos el cliente de Supabase aquí para este componente
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const ConfigView = ({ 
    base, config, setConfig, isDarkMode, resetAllOrders, 
    newPass, setNewPass, confirmPass, setConfirmPass, changePass, 
    currentTheme, sessionDuration, setSessionDuration 
}: any) => {

    const DURATIONS = [
        { label: '1 Hora', value: 60 * 60 * 1000 },
        { label: '8 Horas', value: 8 * 60 * 60 * 1000 },
        { label: '24 Horas', value: 24 * 60 * 60 * 1000 },
        { label: '3 Días', value: 3 * 24 * 60 * 60 * 1000 },
        { label: '1 Semana', value: 7 * 24 * 60 * 60 * 1000 },
        { label: '30 Días', value: 30 * 24 * 60 * 60 * 1000 },
    ];

    const handleDurationChange = (val: number) => {
        setSessionDuration(val);
        // Actualizar también la sesión actual si existe para extenderla
        const currentSession = localStorage.getItem('vito-admin-session');
        if (currentSession) {
            const expiry = Date.now() + val;
            localStorage.setItem('vito-admin-session', JSON.stringify({ expiry }));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            
            {/* --- MENSAJE DE BIENVENIDA --- */}
            <div className={`p-5 rounded-3xl border ${base.card}`}>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Smartphone size={20}/> Mensaje de Bienvenida</h3>
                <p className={`text-xs mb-3 ${base.subtext}`}>Usa [nombre], [fecha], [hora], [pizzas] como variables.</p>
                <textarea 
                    className={`w-full p-4 rounded-xl border outline-none min-h-[100px] text-sm ${base.input}`}
                    value={config.mensaje_bienvenida || ''}
                    onChange={(e) => setConfig({...config, mensaje_bienvenida: e.target.value})}
                    placeholder="Ej: Hola [nombre], hoy hay [pizzas] variedades..."
                />
                <button 
                    onClick={async () => {
                        await supabase.from('configuracion_dia').update({ mensaje_bienvenida: config.mensaje_bienvenida }).eq('id', config.id);
                        alert("Mensaje guardado");
                    }} 
                    className={`mt-3 w-full py-3 rounded-xl font-bold text-sm ${currentTheme.color} text-white shadow-lg`}
                >
                    GUARDAR MENSAJE
                </button>
            </div>

            {/* --- ACCESO INVITADOS (RESTITUIDO) --- */}
            <div className={`p-5 rounded-3xl border ${base.card}`}>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Users size={20}/> Acceso Invitados</h3>
                <p className={`text-xs mb-3 ${base.subtext}`}>Si dejas esto vacío, cualquiera podrá entrar sin clave.</p>
                
                <div className="flex gap-2">
                    <div className={`flex-1 flex items-center px-4 rounded-xl border ${base.input}`}>
                        <KeyRound size={18} className={base.subtext} />
                        <input 
                            type="text"
                            className="w-full bg-transparent outline-none p-3 ml-2"
                            value={config.password_invitados || ''}
                            onChange={(e) => setConfig({...config, password_invitados: e.target.value})}
                            placeholder="Sin contraseña..."
                        />
                    </div>
                    <button 
                        onClick={async () => {
                            await supabase.from('configuracion_dia').update({ password_invitados: config.password_invitados }).eq('id', config.id);
                            alert("Contraseña de invitados actualizada");
                        }} 
                        className={`px-6 rounded-xl font-bold text-sm ${currentTheme.color} text-white shadow-lg`}
                    >
                        <Save size={20} />
                    </button>
                </div>
            </div>

            {/* --- SEGURIDAD ADMIN --- */}
            <div className={`p-5 rounded-3xl border ${base.card}`}>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Lock size={20}/> Seguridad Admin</h3>
                
                {/* Selector de Duración de Sesión */}
                <div className="mb-6">
                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${base.subtext}`}>Mantener sesión abierta por:</label>
                    <div className="grid grid-cols-3 gap-2">
                        {DURATIONS.map((d) => (
                            <button
                                key={d.label}
                                onClick={() => handleDurationChange(d.value)}
                                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${sessionDuration === d.value ? `${currentTheme.color} text-white border-transparent` : `${base.buttonSec}`}`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`h-[1px] w-full ${base.divider} my-4`}></div>

                <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${base.subtext}`}>Cambiar Contraseña Admin</label>
                <div className="flex flex-col gap-2">
                    <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} placeholder="Nueva contraseña" />
                    <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} placeholder="Confirmar contraseña" />
                    <button onClick={changePass} disabled={!newPass || newPass !== confirmPass} className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${newPass && newPass === confirmPass ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                        ACTUALIZAR PASS
                    </button>
                </div>
            </div>

            {/* --- ZONA DE PELIGRO --- */}
            <div className={`p-5 rounded-3xl border border-red-500/20 bg-red-500/5`}>
                <h3 className="font-bold text-lg mb-4 text-red-500 flex items-center gap-2"><Trash2 size={20}/> Zona de Peligro</h3>
                
                <div className="flex items-center justify-between mb-4">
                     <div className="flex-1">
                         <h4 className={`font-bold text-sm ${base.text}`}>Resetear Pedidos</h4>
                         <p className={`text-[10px] ${base.subtext}`}>Borra todos los pedidos pero mantiene el menú.</p>
                     </div>
                     <button onClick={resetAllOrders} className="bg-red-500 text-white p-2 rounded-xl"><RotateCcw size={20}/></button>
                </div>
            </div>
        </div>
    );
};