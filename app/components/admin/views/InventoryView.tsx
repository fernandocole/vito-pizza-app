import { Trash2, Edit3, Save, X, Plus, Package } from 'lucide-react';

export const InventoryView = ({ 
    base, currentTheme, ingredients, newIngName, setNewIngName, newIngQty, setNewIngQty, newIngUnit, setNewIngUnit, 
    addIng, editingIngId, editIngForm, setEditIngForm, saveEditIng, cancelEditIng, delIng, startEditIng, reservedState, quickUpdateStock 
}: any) => {
    
    // Detectar modo oscuro basado en el color de fondo recibido
    const isDark = base.bg.includes('neutral-950');

    // Estilos específicos para el botón de incremento según el modo
    const incrementBtnClass = isDark 
        ? "text-neutral-500 hover:bg-neutral-700 hover:text-white" 
        : "text-gray-400 hover:bg-gray-200 hover:text-black";

    return (
        <div className="space-y-6">
            
            {/* FORMULARIO AGREGAR */}
            <div className={`p-4 rounded-3xl border ${base.card} flex flex-col gap-3`}>
                <div className="flex items-center gap-2 opacity-50 uppercase text-[10px] font-bold tracking-wider">
                    <Package size={12}/> Nuevo Ingrediente
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newIngName} 
                        onChange={e => setNewIngName(e.target.value)} 
                        placeholder="Nombre (ej: Harina)" 
                        className={`flex-[2] p-3 rounded-xl outline-none border min-w-0 ${base.input}`} 
                    />
                    <input 
                        type="number" 
                        value={newIngQty} 
                        onChange={e => setNewIngQty(e.target.value)} 
                        placeholder="0" 
                        className={`w-16 p-3 rounded-xl outline-none border text-center ${base.input}`} 
                    />
                    <select 
                        value={newIngUnit} 
                        onChange={e => setNewIngUnit(e.target.value)} 
                        className={`w-20 p-3 rounded-xl outline-none border bg-transparent ${base.input}`}
                    >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="u">u</option>
                        <option value="ml">ml</option>
                        <option value="L">L</option>
                    </select>
                    <button 
                        onClick={addIng} 
                        className={`w-12 rounded-xl font-bold flex items-center justify-center ${currentTheme.color} text-white shadow-lg active:scale-95`}
                    >
                        <Plus size={24}/>
                    </button>
                </div>
            </div>

            {/* LISTA INGREDIENTES - 2 COLUMNAS */}
            <div className="grid gap-3 grid-cols-2">
                {ingredients.map((ing: any) => {
                    const isEditing = editingIngId === ing.id;
                    const reserved = reservedState[ing.id] || 0;
                    
                    return (
                        <div key={ing.id} className={`${base.card} rounded-3xl border relative group overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md`}>
                            {isEditing ? (
                                <div className="p-4 space-y-3">
                                    <label className="text-[10px] font-bold opacity-50 uppercase">Editando</label>
                                    <input type="text" value={editIngForm.nombre} onChange={e => setEditIngForm({...editIngForm, nombre: e.target.value})} className={`w-full p-3 rounded-xl border text-sm outline-none ${base.input}`} />
                                    <div className="flex gap-2">
                                        <input type="number" value={editIngForm.cantidad} onChange={e => setEditIngForm({...editIngForm, cantidad: e.target.value})} className={`w-full p-3 rounded-xl border text-sm outline-none ${base.input}`} />
                                        <select value={editIngForm.unidad} onChange={e => setEditIngForm({...editIngForm, unidad: e.target.value})} className={`p-3 rounded-xl border text-sm bg-transparent outline-none ${base.input}`}>
                                            <option value="g">g</option><option value="kg">kg</option><option value="u">u</option>
                                        </select>
                                    </div>
                                    
                                    {/* BOTONES DE EDICIÓN MODERNIZADOS */}
                                    <div className="flex gap-2 mt-3">
                                        {/* Cancelar: Botón secundario */}
                                        <button 
                                            onClick={cancelEditIng} 
                                            className={`flex-1 ${base.buttonSec} border p-3 rounded-xl flex items-center justify-center active:scale-95 transition-all`}
                                            title="Cancelar"
                                        >
                                            <X size={20} className="opacity-70"/>
                                        </button>
                                        
                                        {/* Guardar: Botón primario con tema */}
                                        <button 
                                            onClick={() => saveEditIng(ing.id)} 
                                            className={`flex-[2] ${currentTheme.color} text-white p-3 rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all hover:opacity-90`}
                                            title="Guardar"
                                        >
                                            <Save size={20}/>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* CABECERA TARJETA */}
                                    <div className="p-4 pb-2 relative flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-sm truncate pr-6 opacity-80">{ing.nombre}</h3>
                                            
                                            {/* Botones de acción (Edit/Delete) */}
                                            <div className="flex gap-1 opacity-30 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEditIng(ing)} className="hover:text-blue-500 transition-colors"><Edit3 size={14}/></button>
                                                <button onClick={() => delIng(ing.id)} className="hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                        
                                        {/* CANTIDAD GRANDE (Achicada) */}
                                        <div className="flex items-baseline gap-1 mt-2">
                                            <span className="text-xl font-black tracking-tight">{ing.cantidad_disponible}</span>
                                            <span className="text-xs font-bold opacity-40">{ing.unidad}</span>
                                        </div>

                                        {reserved > 0 && (
                                            <div className="mt-2 text-[10px] text-orange-500 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full inline-block">
                                                Res: {reserved.toFixed(1)} {ing.unidad}
                                            </div>
                                        )}
                                    </div>

                                    {/* BOTONES DE CARGA RÁPIDA (Footer Limpio y Corregido) */}
                                    <div className="px-2 pb-2 pt-0">
                                        <div className="flex gap-1 justify-between">
                                            {[1, 5, 10, 100].map((amt) => (
                                                <button 
                                                    key={amt}
                                                    onClick={() => quickUpdateStock(ing.id, ing.cantidad_disponible, amt)}
                                                    className={`flex-1 py-2 text-[10px] font-bold opacity-50 hover:opacity-100 rounded active:scale-95 transition-all ${incrementBtnClass}`}
                                                >
                                                    +{amt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};