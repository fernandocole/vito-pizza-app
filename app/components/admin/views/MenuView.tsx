import { Plus, Image as ImageIcon, Trash2, Edit2, X, Save, Clock, Package, ChefHat, Copy } from 'lucide-react';

export const MenuView = ({ 
    base, config, setConfig, activeCategories, uniqueCategories, toggleCategory, 
    currentTheme, addP, uploading, newPizzaName, setNewPizzaName, isDarkMode, 
    handleImageUpload, newPizzaImg, newPizzaDesc, setNewPizzaDesc, 
    newPizzaIngredients, removeFromNewPizzaRecipe, newPizzaSelectedIng, 
    setNewPizzaSelectedIng, ingredients, newPizzaRecipeQty, setNewPizzaRecipeQty, 
    addToNewPizzaRecipe, newPizzaCat, setNewPizzaCat, newPizzaPortions, 
    setNewPizzaPortions, stockEstimadoNueva, newPizzaTime, setNewPizzaTime, 
    pizzas, edits, recetas, updateP, savePizzaChanges, cancelChanges, delP, 
    duplicateP, tempRecipeIng, setTempRecipeIng, tempRecipeQty, setTempRecipeQty, 
    addToExistingPizza, removeFromExistingPizza, reservedState, calcularStockDinamico, 
    updateLocalRecipe, newPizzaType, setNewPizzaType
}: any) => {

    const PIZZA_TYPES = [
        { id: 'pizza', label: 'Pizza', icon: '🍕' },
        { id: 'burger', label: 'Hamburguesa', icon: '🍔' },
        { id: 'other', label: 'Otro', icon: '🍲' }
    ];

    // Helper para formato de tiempo
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        if (s === 0) return `${m}m`;
        return `${m}m ${s}s`;
    };

    return (
        <div className="space-y-4 pb-24">
            {/* CONFIGURACIÓN RÁPIDA */}
            <div className={`p-4 rounded-3xl border ${base.card} mb-4`}>
                <h3 className="font-bold text-sm mb-3 uppercase tracking-wider opacity-60">Configuración Rápida</h3>
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">Porciones x Pizza</label>
                        <input type="number" value={config.porciones_por_pizza} onChange={e => setConfig({...config, porciones_por_pizza: Number(e.target.value)})} className={`w-full p-2 rounded-xl text-center font-black ${base.input}`} />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase opacity-50 block mb-1">Total Invitados</label>
                        <input type="number" value={config.total_invitados} onChange={e => setConfig({...config, total_invitados: Number(e.target.value)})} className={`w-full p-2 rounded-xl text-center font-black ${base.input}`} />
                    </div>
                </div>
                
                {/* FILTRO DE CATEGORÍAS */}
                <div>
                    <label className="text-[10px] font-bold uppercase opacity-50 block mb-2">Categorías Activas en Menú</label>
                    <div className="flex flex-wrap gap-2">
                        {uniqueCategories.map((cat: string) => (
                            <button 
                                key={cat} 
                                onClick={() => toggleCategory(cat)} 
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeCategories.includes(cat) ? `${currentTheme.color} text-white border-transparent` : base.buttonSec}`}
                            >
                                {cat || 'Sin Categoría'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CREAR NUEVA COMIDA */}
            <div className={`p-5 rounded-[32px] border shadow-lg relative overflow-hidden ${base.card}`}>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentTheme.gradient}`}></div>
                <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Plus className="w-6 h-6" /> Nuevo Item</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                        <input type="text" value={newPizzaName} onChange={e => setNewPizzaName(e.target.value)} placeholder="Nombre del plato..." className={`w-full p-4 rounded-xl text-lg font-bold border outline-none focus:ring-2 ring-offset-2 ring-offset-transparent ${base.input}`} />
                        <textarea value={newPizzaDesc} onChange={e => setNewPizzaDesc(e.target.value)} placeholder="Descripción corta..." className={`w-full p-4 rounded-xl border outline-none h-24 resize-none ${base.input}`} />
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold uppercase opacity-50 ml-1">Categoría</label>
                                <input type="text" value={newPizzaCat} onChange={e => setNewPizzaCat(e.target.value)} placeholder="Ej: Clásicas" className={`w-full p-3 rounded-xl border outline-none ${base.input}`} />
                            </div>
                            <div className="w-24">
                                <label className="text-[10px] font-bold uppercase opacity-50 ml-1">Tiempo (seg)</label>
                                <input type="number" value={newPizzaTime} onChange={e => setNewPizzaTime(Number(e.target.value))} className={`w-full p-3 rounded-xl border outline-none text-center ${base.input}`} />
                            </div>
                        </div>
                        
                        <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                            {PIZZA_TYPES.map(type => (
                                <button 
                                    key={type.id} 
                                    onClick={() => setNewPizzaType(type.id as any)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${newPizzaType === type.id ? `${base.card} shadow-md border` : 'opacity-50 hover:opacity-100'}`}
                                >
                                    <span className="text-lg">{type.icon}</span>
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        {newPizzaType === 'pizza' && (
                            <div>
                                <label className="text-[10px] font-bold uppercase opacity-50 ml-1">Porciones por Unidad</label>
                                <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                                    <input 
                                        type="range" 
                                        min="1" max="12" step="1" 
                                        value={newPizzaPortions} 
                                        onChange={e => setNewPizzaPortions(Number(e.target.value))} 
                                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                    <span className="font-black text-xl w-8 text-center">{newPizzaPortions}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center h-40 relative group cursor-pointer transition-colors ${base.uploadBox}`}>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                            {uploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div> : newPizzaImg ? <img src={newPizzaImg} className="w-full h-full object-cover rounded-2xl" /> : <><ImageIcon className="w-8 h-8 mb-2 opacity-50" /><span className="text-xs font-bold opacity-50">Subir Foto</span></>}
                        </div>

                        <div className={`p-4 rounded-2xl border ${base.innerCard}`}>
                            <h3 className="font-bold text-xs uppercase mb-3 flex items-center gap-2"><ChefHat size={14}/> Receta (Ingredientes)</h3>
                            <div className="flex gap-2 mb-3">
                                <select value={newPizzaSelectedIng} onChange={e => setNewPizzaSelectedIng(e.target.value)} className={`flex-1 p-2 rounded-lg text-sm border outline-none ${base.input}`}>
                                    <option value="">Seleccionar...</option>
                                    {ingredients.map((i: any) => (<option key={i.id} value={`${i.id}|${i.nombre}`}>{i.nombre} ({i.cantidad_disponible} {i.unidad})</option>))}
                                </select>
                                <input type="number" value={newPizzaRecipeQty} onChange={e => setNewPizzaRecipeQty(e.target.value)} placeholder="Cant" className={`w-16 p-2 rounded-lg text-sm border text-center outline-none ${base.input}`} />
                                <button onClick={addToNewPizzaRecipe} className={`p-2 rounded-lg ${currentTheme.color} text-white shadow-lg active:scale-95`}><Plus size={16}/></button>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                {newPizzaIngredients.map((ing: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-xs bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                                        <span>{ing.nombre}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{ing.cantidad}</span>
                                            <button onClick={() => removeFromNewPizzaRecipe(idx)} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><X size={12}/></button>
                                        </div>
                                    </div>
                                ))}
                                {newPizzaIngredients.length === 0 && <p className="text-[10px] opacity-40 text-center py-2">Sin ingredientes</p>}
                            </div>
                            {newPizzaIngredients.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-dashed border-gray-500/20 text-center">
                                    <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Stock Estimado</p>
                                    <p className={`text-2xl font-black ${stockEstimadoNueva > 0 ? 'text-green-500' : 'text-red-500'}`}>{stockEstimadoNueva} <span className="text-xs font-normal text-gray-500">unid.</span></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button onClick={addP} className={`w-full py-4 rounded-xl font-black text-white shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2 ${currentTheme.color}`}>GUARDAR NUEVO ITEM</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {pizzas.map((pizza: any) => {
                    const isEditing = !!edits[pizza.id];
                    const currentData = isEditing ? { ...pizza, ...edits[pizza.id] } : pizza;
                    const pReceta = recetas.filter((r: any) => r.pizza_id === pizza.id);
                    const stockReal = calcularStockDinamico(pReceta, ingredients); 
                    const reserved = reservedState[pizza.id] || 0; 

                    return (
                        <div key={pizza.id} className={`group relative rounded-3xl border shadow-sm transition-all hover:shadow-md ${base.card} ${!currentData.activa ? 'opacity-60 grayscale' : ''}`}>
                            <div className="flex p-4 gap-4">
                                <div className="relative w-24 h-24 flex-shrink-0 group cursor-pointer overflow-hidden rounded-2xl">
                                    {isEditing ? (
                                        <div className="w-full h-full bg-black/50 flex items-center justify-center relative">
                                            <input type="file" onChange={(e) => handleImageUpload(e, pizza.id)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <ImageIcon className="text-white" />
                                        </div>
                                    ) : (
                                        <img src={currentData.imagen_url || '/placeholder_pizza.png'} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        {isEditing ? (
                                            <input type="text" value={currentData.nombre} onChange={e => updateP(pizza.id, 'nombre', e.target.value)} className={`font-bold w-full bg-transparent border-b ${base.text}`} />
                                        ) : (
                                            <h3 className={`font-bold text-lg truncate pr-2 ${base.text}`}>{currentData.nombre}</h3>
                                        )}
                                        <div className="flex gap-1">
                                            {/* BOTÓN DUPLICAR (NUEVO) */}
                                            {!isEditing && (
                                                <button onClick={() => duplicateP(pizza)} className={`p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors`} title="Duplicar">
                                                    <Copy size={16} />
                                                </button>
                                            )}
                                            <button onClick={() => isEditing ? savePizzaChanges(pizza.id) : updateP(pizza.id, 'editing', true)} className={`p-2 rounded-lg ${isEditing ? 'text-green-500 bg-green-500/10' : `${base.buttonIcon}`}`}>
                                                {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {isEditing ? (
                                        <textarea value={currentData.descripcion || ''} onChange={e => updateP(pizza.id, 'descripcion', e.target.value)} className={`text-xs w-full bg-transparent border rounded p-1 mb-2 h-16 ${base.subtext}`} />
                                    ) : (
                                        <p className={`text-xs line-clamp-2 mb-3 ${base.subtext}`}>{currentData.descripcion}</p>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${base.metric}`}>
                                            <Package size={12}/> Stock: {stockReal}
                                        </div>
                                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${base.metric}`}>
                                            <Clock size={12}/> {formatTime(currentData.tiempo_coccion)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* EDITOR DE RECETA INLINE */}
                            {isEditing && (
                                <div className="p-4 border-t border-dashed border-gray-500/20 bg-black/5 dark:bg-white/5 rounded-b-3xl">
                                    <h4 className="text-xs font-bold uppercase mb-2 opacity-60">Editar Receta</h4>
                                    <div className="flex gap-2 mb-2">
                                        <select 
                                            value={tempRecipeIng[pizza.id] || ''} 
                                            onChange={e => setTempRecipeIng({...tempRecipeIng, [pizza.id]: e.target.value})} 
                                            className={`flex-1 p-1.5 rounded text-xs border outline-none ${base.input}`}
                                        >
                                            <option value="">Ingrediente...</option>
                                            {ingredients.map((i: any) => <option key={i.id} value={`${i.id}|${i.nombre}`}>{i.nombre}</option>)}
                                        </select>
                                        <input 
                                            type="number" 
                                            value={tempRecipeQty[pizza.id] || ''} 
                                            onChange={e => setTempRecipeQty({...tempRecipeQty, [pizza.id]: e.target.value})} 
                                            placeholder="#" 
                                            className={`w-12 p-1.5 rounded text-xs border text-center outline-none ${base.input}`} 
                                        />
                                        <button 
                                            onClick={() => {
                                                const [id, name] = (tempRecipeIng[pizza.id] || '').split('|');
                                                if(id && tempRecipeQty[pizza.id]) {
                                                    const current = edits[pizza.id]?.local_recipe || pReceta;
                                                    addToExistingPizza(pizza.id, id, name, tempRecipeQty[pizza.id], current);
                                                    setTempRecipeIng({...tempRecipeIng, [pizza.id]: ''});
                                                    setTempRecipeQty({...tempRecipeQty, [pizza.id]: ''});
                                                }
                                            }}
                                            className="bg-green-500 text-white p-1.5 rounded"
                                        ><Plus size={14}/></button>
                                    </div>
                                    <div className="space-y-1">
                                        {(edits[pizza.id]?.local_recipe || pReceta).map((r: any, idx: number) => {
                                            const ingName = r.nombre || ingredients.find((i:any) => i.id === r.ingrediente_id)?.nombre || '???';
                                            return (
                                                <div key={idx} className="flex justify-between text-xs items-center bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
                                                    <span>{ingName}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">{r.cantidad_requerida}</span>
                                                        <button onClick={() => removeFromExistingPizza(pizza.id, idx, (edits[pizza.id]?.local_recipe || pReceta))} className="text-red-500"><X size={12}/></button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-2 border-t border-white/10">
                                        <button onClick={() => delP(pizza.id)} className="flex-1 py-2 text-xs font-bold text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10">ELIMINAR ITEM</button>
                                        <button onClick={() => cancelChanges(pizza.id)} className="flex-1 py-2 text-xs font-bold border border-gray-500/30 rounded-lg">CANCELAR</button>
                                    </div>
                                </div>
                            )}

                            {!isEditing && (
                                <div className="px-4 pb-4 flex justify-between items-center">
                                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                        <div className={`w-8 h-5 rounded-full p-1 transition-colors ${currentData.activa ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                            <div className={`w-3 h-3 bg-white rounded-full shadow-md transition-transform ${currentData.activa ? 'translate-x-3' : ''}`}></div>
                                        </div>
                                        <input type="checkbox" checked={currentData.activa} onChange={e => updateP(pizza.id, 'activa', e.target.checked)} className="hidden" />
                                        {currentData.activa ? 'Activa' : 'Inactiva'}
                                    </label>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};