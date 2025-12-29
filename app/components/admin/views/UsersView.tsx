import { Users, User, UserCheck, CheckCircle, Ban, Trash2, RotateCcw, Save } from 'lucide-react';

export const UsersView = ({ 
    base, newGuestName, setNewGuestName, addU, allUsersList, resetU, toggleB, eliminarUsuario, 
    tempMotivos, setTempMotivos, guardarMotivo, currentTheme 
}: any) => {
    return (
        <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${base.card}`}>
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${base.subtext}`}><Users size={18}/> Usuarios</h3>
                <div className="flex gap-2">
                    <input className={`w-full p-4 rounded-2xl border outline-none ${base.input}`} placeholder="Nombre..." value={newGuestName} onChange={(e: any) => setNewGuestName(e.target.value)} />
                    <button onClick={addU} className={`${currentTheme.color} text-white font-bold px-6 rounded-2xl`}>CREAR</button>
                </div>
            </div>
            <div className="space-y-2">
                {allUsersList.map((u: any) => (
                    <div key={u.nombre} className={`p-4 rounded-2xl border flex flex-col gap-2 ${u.bloqueado ? base.blocked : base.card}`}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {u.source === 'db' && u.origen !== 'guest' ? (<UserCheck size={16} className="text-blue-500 flex-shrink-0" />) : (<User size={16} className="text-orange-400 flex-shrink-0" />)}
                                <span className={`font-bold truncate ${u.bloqueado ? 'text-red-500 line-through' : ''}`}>{u.nombre}</span>
                                {u.source === 'ped' && <span className="text-[9px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded border border-orange-500/20 flex-shrink-0">Guest</span>}
                            </div>
                            <div className="flex gap-2 items-center flex-shrink-0">
                                <span className="text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-white px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600">{u.totalOrders || 0}</span>
                                <button onClick={() => resetU(u.nombre)} className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl hover:bg-yellow-500/20"><RotateCcw size={16}/></button>
                                <button onClick={() => toggleB(u)} className={`p-2 rounded-xl ${u.bloqueado ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{u.bloqueado ? <CheckCircle size={16}/> : <Ban size={16}/>}</button>
                                <button onClick={() => eliminarUsuario(u.nombre, u.source === 'db' ? u : null)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        {u.bloqueado && (
                            <div className="flex gap-2 mt-2">
                                <input className={`w-full p-2 rounded-lg text-sm outline-none border ${base.input} text-red-400`} placeholder="Motivo..." value={tempMotivos[u.nombre] !== undefined ? tempMotivos[u.nombre] : (u.motivo_bloqueo || '')} onChange={(e: any) => setTempMotivos({ ...tempMotivos, [u.nombre]: e.target.value })} />
                                <button onClick={() => guardarMotivo(u.nombre, u)} className="p-2 bg-neutral-800 text-white rounded-lg border border-white/10 hover:bg-neutral-700"><Save size={16}/></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};