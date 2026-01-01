import { useState } from 'react';
import { 
  CheckSquare, Square, Plus, ImageIcon, UploadCloud, X, Calculator, Save, 
  Eye, EyeOff, Trash2, Pizza, Utensils, ChevronDown, ChevronUp 
} from 'lucide-react';
import { TimeControl } from '../../ui/TimeControl';
import { BurgerIcon } from '../../ui/BurgerIcon'; 

export const MenuView = ({
    base, config, setConfig, activeCategories, uniqueCategories, toggleCategory, currentTheme,
    addP, uploading, newPizzaName, setNewPizzaName, isDarkMode, handleImageUpload, newPizzaImg,
    newPizzaDesc, setNewPizzaDesc, newPizzaIngredients, removeFromNewPizzaRecipe, newPizzaSelectedIng,
    setNewPizzaSelectedIng, ingredients, newPizzaRecipeQty, setNewPizzaRecipeQty, addToNewPizzaRecipe,
    newPizzaCat, setNewPizzaCat, newPizzaPortions, setNewPizzaPortions, stockEstimadoNueva, newPizzaTime,
    setNewPizzaTime, pizzas, edits, recetas, updateP, savePizzaChanges, cancelChanges, delP,
    tempRecipeIng, setTempRecipeIng, tempRecipeQty, setTempRecipeQty, addToExistingPizza, removeFromExistingPizza,
    reservedState, calcularStockDinamico, updateLocalRecipe, 
    newPizzaType, setNewPizzaType 
}: any) => {

    // Estado para controlar qué items están expandidos
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-6">
            <div className={`${base.card} p-5 rounded-3xl border flex flex-col gap-3 shadow-sm`}>
                <label className={`text-xs font-bold uppercase tracking-wider opacity-60 ${base.subtext}`}>CATEGORIAS A MOSTRAR:</label>
                <div className="flex flex-wrap gap-2">
                     <button onClick={async () => {
                         const isAll = activeCategories.includes('Todas');
                         const newVal = isAll ? ['General'] : ['Todas'];
                         setConfig({...config, categoria_activa: JSON.stringify(newVal)});
                     }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${activeCategories.includes('Todas') ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-100 dark:bg-white/5 border-transparent text-gray-500'}`}>
                         {activeCategories.includes('Todas') ? <CheckSquare size={14}/> : <Square size={14}/>} Todas
                     </button>
                     {uniqueCategories.map((cat: string) => {
                         const isActive = activeCategories.includes(cat);
                         return (
                             <button key={cat} onClick={() => toggleCategory(cat)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isActive ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-100 dark:bg-white/5 border-transparent text-gray-500'}`}>
                                 {isActive ? <CheckSquare size={14}/> : <Square size={14}/>} {cat}
                             </button>
                         )
                     })}
                </div>
            </div>

            <div className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden group ${base.card}`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className={`font-bold flex items-center gap-2 text-xl ${base.subtext}`}><Plus size={24}/> Nuevo Item</h3>
                    
                    <div className="flex bg-neutral-100 dark:bg-black/30 rounded-xl p-1 border border-neutral-200 dark:border-white/10">
                        <button 
                            onClick={() => { 
                                setNewPizzaType('pizza'); 
                                setNewPizzaPortions(4); 
                                setNewPizzaCat('Pizzas'); 
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${newPizzaType === 'pizza' ? 'bg-white dark:bg-neutral-800 shadow text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Pizza size={14}/>
                        </button>
                        <button 
                            onClick={() => { 
                                setNewPizzaType('burger'); 
                                setNewPizzaPortions(1); 
                                setNewPizzaCat('Hamburguesas'); 
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${newPizzaType === 'burger' ? 'bg-white dark:bg-neutral-800 shadow text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <BurgerIcon className="w-4 h-4"/>
                        </button>
                        <button 
                            onClick={() => { 
                                setNewPizzaType('other'); 
                                setNewPizzaPortions(1); 
                                setNewPizzaCat(''); 
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${newPizzaType === 'other' ? 'bg-white dark:bg-neutral-800 shadow text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Utensils size={14}/>
                        </button>
                    </div>

                    <button onClick={addP} disabled={uploading} className={`${currentTheme.color} text-white font-bold px-6 py-2 rounded-xl shadow-lg active:scale-95 transition-all text-sm`}>CREAR</button>
                </div>
                
                <div className="flex flex-col gap-4">
                    <input className={`w-full text-2xl font-bold bg-transparent outline-none placeholder-opacity-30 ${isDarkMode ? 'placeholder-white' : 'placeholder-black'}`} placeholder="Nombre del plato..." value={newPizzaName} onChange={(e: any) => setNewPizzaName(e.target.value)} />
                    
                    <div className="flex gap-4">
                        <label className={`flex-shrink-0 cursor-pointer w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed ${base.uploadBox} flex items-center justify-center transition-colors group relative`}>
                            {newPizzaImg ? <img src={newPizzaImg} className="w-full h-full object-cover"/> : <ImageIcon size={24} className="opacity-30"/>}
                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"><UploadCloud size={20}/></div>
                            <input type="file" accept="image/*" className="hidden" onChange={(e: any) => handleImageUpload(e)} disabled={uploading}/>
                        </label>
                        <textarea className={`flex-1 p-0 bg-transparent text-sm leading-relaxed outline-none resize-none h-24 placeholder-opacity-40 ${isDarkMode ? 'placeholder-white' : 'placeholder-black'}`} placeholder="Descripción..." value={newPizzaDesc} onChange={(e: any) => setNewPizzaDesc(e.target.value)} />
                    </div>

                    <div className={`${base.innerCard} p-3 rounded-2xl`}>
                        <div className="flex flex-wrap gap-2 mb-3">
                             {newPizzaIngredients.map((ing: any, i: number) => (
                                 <span key={i} className="text-xs bg-white shadow-sm dark:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold text-black dark:text-white">
                                     {ing.nombre} <span className="opacity-50 text-[10px]">{ing.cantidad}</span> <button onClick={() => removeFromNewPizzaRecipe(i)}><X size={12}/></button>
                                 </span>
                             ))}
                        </div>
                        <div className="flex gap-2">
                            <select className={`flex-1 w-0 min-w-0 p-2 text-sm rounded-xl font-bold outline-none bg-white dark:bg-black/20 text-black dark:text-white`} value={newPizzaSelectedIng} onChange={(e: any) => setNewPizzaSelectedIng(e.target.value)}>
                                <option value="">+ Ingrediente</option>
                                {ingredients.map((i: any) => <option key={i.id} value={`${i.id}|${i.nombre}`}>{i.nombre} (Disp: {i.cantidad_disponible})</option>)}
                            </select>
                            <input type="number" className={`w-14 p-2 text-sm rounded-xl text-center font-bold outline-none bg-white dark:bg-black/20 text-black dark:text-white`} value={newPizzaRecipeQty} onChange={(e: any) => setNewPizzaRecipeQty(Number(e.target.value) || '')} placeholder="Cant" />
                            <button onClick={addToNewPizzaRecipe} className="bg-neutral-800 dark:bg-white text-white dark:text-black px-4 rounded-xl text-sm font-bold shadow-sm flex-shrink-0">OK</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                        <div className={`${base.innerCard} p-3 rounded-2xl flex flex-col items-center justify-center text-center`}>
                            <span className="text-[10px] uppercase font-bold opacity-50 tracking-wider mb-1">Categoria</span>
                            <input 
                                list="categories" 
                                className="w-full text-center font-bold bg-transparent outline-none text-sm" 
                                value={newPizzaCat} 
                                onChange={(e: any) => setNewPizzaCat(e.target.value)} 
                                placeholder={newPizzaType === 'other' ? 'Ej: Bebidas' : ''}
                            />
                            <datalist id="categories">{uniqueCategories.map((c: string) => <option key={c} value={c}/>)}</datalist>
                        </div>
                        
                        <div className={`${base.innerCard} p-3 rounded-2xl flex flex-col items-center justify-center text-center ${newPizzaType === 'burger' ? 'opacity-50' : ''}`}>
                            <span className="text-[10px] uppercase font-bold opacity-50 tracking-wider mb-1">Porciones</span>
                            <input 
                                type="number" 
                                disabled={newPizzaType === 'burger'}
                                className="w-full text-center font-bold bg-transparent outline-none text-sm" 
                                value={newPizzaPortions} 
                                onChange={(e: any) => setNewPizzaPortions(Number(e.target.value))} 
                            />
                        </div>
                        
                        <div className={`${base.innerCard} p-3 rounded-2xl flex flex-col items-center justify-center text-center`}>
                            <span className="text-[10px] uppercase font-bold opacity-50 tracking-wider mb-1">Stock Est.</span>
                            <span className="text-xl font-bold">{stockEstimadoNueva}</span>
                        </div>
                        <div className={`${base.innerCard} p-3 rounded-2xl flex flex-col items-center justify-center text-center`}>
                            <span className="text-[10px] uppercase font-bold opacity-50 tracking-wider mb-1">Timer</span>
                            <TimeControl value={newPizzaTime} onChange={setNewPizzaTime} isDarkMode={isDarkMode}/>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-3">
                {pizzas.map((p: any) => {
                const isEdited = !!edits[p.id];
                const isOpen = expanded[p.id]; // Verificamos si está expandido
                const display = { ...p, ...edits[p.id] }; 
                const isNewRecipe = !!edits[p.id]?.local_recipe;
                const currentRecipe = isNewRecipe ? edits[p.id].local_recipe : recetas.filter((r: any) => r.pizza_id === p.id).map((r: any) => ({...r, nombre: ingredients.find((i: any) => i.id === r.ingrediente_id)?.nombre || '?'}));
                const dynamicStock = calcularStockDinamico(currentRecipe, ingredients);
                const currentType = display.tipo || 'pizza';

                return (
                <div key={p.id} className={`p-4 rounded-3xl border flex flex-col relative overflow-hidden transition-all ${base.card} ${isEdited ? 'border-yellow-500/50' : ''}`}>
                    {/* --- HEADER (Siempre visible) --- */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 flex-1 mr-2">
                            {/* Botón de expandir/contraer */}
                            <button onClick={() => toggleExpand(p.id)} className={`p-1.5 rounded-lg ${base.buttonSec}`}>
                                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {currentType === 'burger' ? (
                                <BurgerIcon className="text-orange-500 w-5 h-5 flex-shrink-0" />
                            ) : currentType === 'other' ? (
                                <Utensils size={20} className="text-blue-500 flex-shrink-0" />
                            ) : (
                                <Pizza size={20} className="text-red-500 flex-shrink-0" />
                            )}
                            
                            {/* Input de nombre */}
                            <input 
                                value={display.nombre} 
                                onChange={(e: any) => updateP(p.id, 'nombre', e.target.value)} 
                                className="bg-transparent font-bold text-lg outline-none w-full border-b border-transparent focus:border-white/20 pb-1 truncate" 
                            />
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                            {/* BOTONES GUARDAR/CANCELAR MEJORADOS */}
                            {isEdited && (
                                <>
                                    <button 
                                        onClick={() => savePizzaChanges(p.id)} 
                                        className={`p-2 ${currentTheme.color} text-white rounded-xl animate-pulse shadow-lg hover:scale-105 transition-transform`}
                                        title="Guardar"
                                    >
                                        <Save size={16}/>
                                    </button>
                                    <button 
                                        onClick={() => cancelChanges(p.id)} 
                                        className={`p-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl shadow-sm hover:scale-105 transition-transform`}
                                        title="Cancelar"
                                    >
                                        <X size={16}/>
                                    </button>
                                </>
                            )}
                            
                            {/* Botones de acción normales */}
                            {!isEdited && (
                                <button onClick={() => updateP(p.id, 'activa', !p.activa)} className={`p-2 rounded-xl transition-colors ${p.activa ? 'bg-white/10 hover:bg-white/20' : 'bg-black/50 text-neutral-500'}`}>{p.activa ? <Eye size={16}/> : <EyeOff size={16}/>}</button>
                            )}
                            {!isEdited && (
                                <button onClick={() => delP(p.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={16}/></button>
                            )}
                        </div>
                    </div>

                    {/* --- CONTENIDO EXPANDIBLE --- */}
                    {isOpen && (
                        <div className="flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex gap-4">
                                <label className="cursor-pointer relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-900 group flex-shrink-0 shadow-inner">
                                    {display.imagen_url ? <img src={display.imagen_url} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-neutral-600"><ImageIcon size={20}/></div>}
                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"><UploadCloud size={16}/></div>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e: any) => handleImageUpload(e, p.id)}/>
                                </label>
                                <textarea value={display.descripcion || ''} onChange={(e: any) => updateP(p.id, 'descripcion', e.target.value)} className={`flex-1 p-0 bg-transparent text-sm leading-relaxed outline-none resize-none h-20 opacity-80 placeholder-opacity-30 ${isDarkMode ? 'placeholder-white' : 'placeholder-black'}`} placeholder="Descripción..." />
                            </div>
                            
                            <div className={`${base.innerCard} p-3 rounded-2xl`}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[10px] font-bold uppercase opacity-50 tracking-wider">Receta</p>
                                    <span className="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded-full">{currentRecipe.length} Ingredientes</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {currentRecipe.map((r: any, idx: number) => (
                                        <span key={idx} className="text-xs bg-white dark:bg-white/10 px-2 py-1 rounded-lg flex items-center gap-1 border border-black/5 dark:border-white/5 font-medium text-black dark:text-white">
                                            {r.nombre}: {r.cantidad_requerida}
                                            <button onClick={() => removeFromExistingPizza(p.id, idx, currentRecipe)} className="text-red-400 hover:text-red-300 ml-1"><X size={12}/></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <select className={`flex-1 w-0 min-w-0 p-1.5 text-xs rounded-lg font-bold outline-none bg-white dark:bg-black/20 text-black dark:text-white`} value={tempRecipeIng[p.id] || ''} onChange={(e: any) => setTempRecipeIng({...tempRecipeIng, [p.id]: e.target.value})}>
                                        <option value="">+ Ingrediente</option>
                                        {ingredients.map((i: any) => <option key={i.id} value={`${i.id}|${i.nombre}`}>{i.nombre} (Disp: {Math.max(0, i.cantidad_disponible - (reservedState[i.id] || 0))})</option>)}
                                    </select>
                                    <input type="number" placeholder="Cant" className={`w-12 p-1.5 text-xs rounded-lg text-center font-bold outline-none bg-white dark:bg-black/20 text-black dark:text-white`} value={tempRecipeQty[p.id] || ''} onChange={(e: any) => setTempRecipeQty({...tempRecipeQty, [p.id]: Number(e.target.value) || ''})} />
                                    <button onClick={() => {
                                        if(!tempRecipeIng[p.id]) return;
                                        const [ingId, name] = tempRecipeIng[p.id].split('|');
                                        addToExistingPizza(p.id, ingId, name, tempRecipeQty[p.id] || 0, currentRecipe);
                                        setTempRecipeIng({...tempRecipeIng, [p.id]: ''}); 
                                        setTempRecipeQty({...tempRecipeQty, [p.id]: ''});
                                    }} className="bg-neutral-800 dark:bg-white text-white dark:text-black px-3 rounded-lg text-xs font-bold flex-shrink-0">OK</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className={`${base.innerCard} p-2 rounded-2xl flex flex-col items-center justify-center text-center`}>
                                    <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider mb-1">Tipo & Cat.</span>
                                    <div className="flex gap-1 bg-black/10 dark:bg-white/5 p-1 rounded-lg mb-1">
                                        <button 
                                            onClick={() => {
                                                updateP(p.id, 'tipo', 'pizza');
                                                updateP(p.id, 'categoria', 'Pizzas'); 
                                                updateP(p.id, 'porciones_individuales', 4);
                                            }}
                                            className={`p-1.5 rounded-md transition-all ${currentType === 'pizza' ? 'bg-white dark:bg-neutral-700 text-red-500 shadow' : 'text-gray-400 hover:text-gray-500'}`}
                                            title="Pizza"
                                        >
                                            <Pizza size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                updateP(p.id, 'tipo', 'burger');
                                                updateP(p.id, 'categoria', 'Hamburguesas'); 
                                                updateP(p.id, 'porciones_individuales', 1);
                                            }}
                                            className={`p-1.5 rounded-md transition-all ${currentType === 'burger' ? 'bg-white dark:bg-neutral-700 text-orange-500 shadow' : 'text-gray-400 hover:text-gray-500'}`}
                                            title="Burger"
                                        >
                                            <BurgerIcon className="w-4 h-4"/>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                updateP(p.id, 'tipo', 'other');
                                            }}
                                            className={`p-1.5 rounded-md transition-all ${currentType === 'other' ? 'bg-white dark:bg-neutral-700 text-blue-500 shadow' : 'text-gray-400 hover:text-gray-500'}`}
                                            title="Otro"
                                        >
                                            <Utensils size={16}/>
                                        </button>
                                    </div>
                                    <input 
                                        list="categories" 
                                        value={display.categoria || ''} 
                                        onChange={(e: any) => updateP(p.id, 'categoria', e.target.value)} 
                                        className={`w-full text-center bg-transparent outline-none text-[10px] font-bold opacity-80`} 
                                        placeholder="Categoría..."
                                    />
                                </div>
                                
                                <div className={`${base.innerCard} p-2 rounded-2xl flex flex-col items-center justify-center text-center ${currentType === 'burger' ? 'opacity-50' : ''}`}>
                                    <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider mb-1">Porciones</span>
                                    <input 
                                        type="number" 
                                        disabled={currentType === 'burger'}
                                        value={display.porciones_individuales || ''} 
                                        onChange={(e: any) => updateP(p.id, 'porciones_individuales', e.target.value ? parseInt(e.target.value) : null)} 
                                        className={`w-full text-center bg-transparent outline-none text-sm font-bold`} 
                                    />
                                </div>
                                
                                <div className={`${base.innerCard} p-2 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden text-center`}>
                                    <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider mb-1">Stock</span>
                                    {currentRecipe.length > 0 ? (
                                        <div className="flex items-center gap-1 font-bold text-xl"><Calculator size={14} className="opacity-30"/> {dynamicStock}</div>
                                    ) : (
                                        <input type="number" value={display.stock || 0} onChange={(e: any) => updateP(p.id, 'stock', parseInt(e.target.value))} className={`w-full text-center bg-transparent outline-none text-sm font-bold`} />
                                    )}
                                </div>

                                <div className={`${base.innerCard} p-2 rounded-2xl flex flex-col items-center justify-center text-center`}>
                                    <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider mb-1">Timer</span>
                                    <TimeControl value={display.tiempo_coccion || 60} onChange={(val: number) => updateP(p.id, 'tiempo_coccion', val)} isDarkMode={isDarkMode} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                );})}
            </div>
        </div>
    );
};