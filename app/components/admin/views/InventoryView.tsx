import { Plus, ChevronDown, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';

export const InventoryView = ({
    base, currentTheme, ingredients, newIngName, setNewIngName, newIngQty, setNewIngQty, 
    newIngUnit, setNewIngUnit, addIng, editingIngId, editIngForm, setEditIngForm, 
    saveEditIng, cancelEditIng, delIng, startEditIng, reservedState 
}: any) => {
    return (
        <div className="space-y-6">
            {/* ZONA AGREGAR */}
            <div className={`p-6 rounded-3xl border ${base.card}`}>
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${base.subtext}`}><Plus size={18}/> Agregar Stock / Nuevo</h3>
                
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input 
                                list="ingredientes-list"
                                className={`w-full p-3 rounded-xl border outline-none ${base.input}`} 
                                placeholder="Nombre del producto..." 
                                value={newIngName} 
                                onChange={(e: any) => setNewIngName(e.target.value)} 
                            />
                            <datalist id="ingredientes-list">
                                {ingredients.map((i: any) => <option key={i.id} value={i.nombre} />)}
                            </datalist>
                            <div className="absolute right-3 top-3 pointer-events-none opacity-50"><ChevronDown size={16}/></div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            className={`w-24 p-3 rounded-xl border outline-none text-center ${base.input}`} 
                            placeholder="Cant (0)" 
                            value={newIngQty} 
                            onChange={(e: any) => setNewIngQty(e.target.value)} 
                        />
                        <select 
                            className={`w-24 p-3 rounded-xl border outline-none bg-transparent ${base.input}`} 
                            value={newIngUnit} 
                            onChange={(e: any) => setNewIngUnit(e.target.value)}
                        >
                            <option value="u" className="text-black">u</option>
                            <option value="g" className="text-black">g</option>
                            <option value="kg" className="text-black">kg</option>
                            <option value="ml" className="text-black">ml</option>
                            <option value="L" className="text-black">L</option>
                        </select>
                        <button onClick={addIng} className={`${currentTheme.color} text-white font-bold px-6 rounded-xl shadow-lg active:scale-95 transition-transform flex-1`}>
                            {ingredients.some((i: any) => i.nombre.toLowerCase() === newIngName.toLowerCase()) ? 'SUMAR' : 'CREAR'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* LISTA FIJA ABAJO */}
            <div className="grid gap-2 pb-20">
                {ingredients.map((ing: any) => {
                    const reservado = reservedState[ing.id] || 0;
                    const disponible = Math.max(0, ing.cantidad_disponible - reservado);
                    
                    return (
                    <div key={ing.id} className={`p-3 rounded-2xl border flex flex-col gap-2 transition-all ${base.card} ${editingIngId === ing.id ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}>
                        
                        {editingIngId === ing.id ? (
                            // MODO EDICION
                            <div className="flex items-center gap-2">
                                <div className="flex-1 flex flex-col gap-2">
                                    <input 
                                        value={editIngForm.nombre} 
                                        onChange={(e: any) => setEditIngForm({...editIngForm, nombre: e.target.value})} 
                                        className={`p-2 rounded-lg border text-sm ${base.input}`}
                                    />
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            value={editIngForm.cantidad} 
                                            onChange={(e: any) => setEditIngForm({...editIngForm, cantidad: e.target.value})} 
                                            className={`w-24 p-2 rounded-lg border text-center ${base.input}`}
                                        />
                                        <select 
                                            value={editIngForm.unidad} 
                                            onChange={(e: any) => setEditIngForm({...editIngForm, unidad: e.target.value})} 
                                            className={`flex-1 p-2 rounded-lg border bg-transparent ${base.input}`}
                                        >
                                            <option value="u" className="text-black">u</option>
                                            <option value="g" className="text-black">g</option>
                                            <option value="kg" className="text-black">kg</option>
                                            <option value="ml" className="text-black">ml</option>
                                            <option value="L" className="text-black">L</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => saveEditIng(ing.id)} className="p-3 bg-green-600 text-white rounded-xl shadow-lg"><CheckCircle size={20}/></button>
                                    <button onClick={cancelEditIng} className="p-3 bg-red-600 text-white rounded-xl shadow-lg"><XCircle size={20}/></button>
                                </div>
                            </div>
                        ) : (
                            // MODO LECTURA
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <span className="font-bold text-sm block mb-1">{ing.nombre}</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`font-mono font-bold text-2xl ${disponible <= 0 ? 'text-red-500' : ''}`}>{disponible}</span>
                                        <span className="text-xs opacity-50 font-bold uppercase">{ing.unidad} (Disp)</span>
                                    </div>
                                    {reservado > 0 && <span className="text-[10px] opacity-60">Físico: {ing.cantidad_disponible} | En uso: {reservado.toFixed(1)}</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => startEditIng(ing)} className={`p-2 rounded-xl border ${base.buttonSec}`}><Pencil size={18}/></button>
                                    <button onClick={() => delIng(ing.id)} className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        )}
                    </div>
                )})}
            </div>
        </div>
    );
};