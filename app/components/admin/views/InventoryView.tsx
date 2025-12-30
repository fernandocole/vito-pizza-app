import { useState, useMemo } from 'react';
import { Trash2, Edit3, Save, X, Plus, Package, Share2, Smartphone, MessageCircle } from 'lucide-react';

export const InventoryView = ({ 
    base, currentTheme, ingredients, newIngName, setNewIngName, newIngQty, setNewIngQty, 
    newIngUnit, setNewIngUnit, newIngCat, setNewIngCat, 
    addIng, editingIngId, editIngForm, setEditIngForm, saveEditIng, cancelEditIng, delIng, 
    startEditIng, reservedState, quickUpdateStock 
}: any) => {
    
    const [filterCategory, setFilterCategory] = useState<string>('Todos');
    const [showShareModal, setShowShareModal] = useState(false);

    const isDark = base.bg.includes('neutral-950');
    const incrementBtnClass = isDark 
        ? "text-neutral-500 hover:bg-neutral-700 hover:text-white" 
        : "text-gray-400 hover:bg-gray-200 hover:text-black";

    // 1. Obtener categorías únicas
    const uniqueCategories = useMemo(() => {
        const cats = new Set<string>();
        ingredients.forEach((i: any) => {
            if(i.categoria) cats.add(i.categoria.trim());
        });
        return ['Todos', 'General', ...Array.from(cats).filter(c => c !== 'General').sort()];
    }, [ingredients]);

    // 2. Filtrar ingredientes
    const filteredIngredients = useMemo(() => {
        if (filterCategory === 'Todos') return ingredients;
        return ingredients.filter((i: any) => (i.categoria || 'General') === filterCategory);
    }, [ingredients, filterCategory]);

    // 3. Funciones de Compartir
    const generateShareText = () => {
        if (filteredIngredients.length === 0) return "Lista vacía";
        let text = `*🛒 Lista de Compras (${filterCategory})*\n\n`;
        filteredIngredients.forEach((ing: any) => {
            text += `- ${ing.nombre}: ${ing.cantidad_disponible} ${ing.unidad}\n`;
        });
        return text;
    };

    const handleWhatsAppShare = () => {
        const text = generateShareText();
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        setShowShareModal(false);
    };

    const handleNativeShare = async () => {
        const text = generateShareText();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Lista de Compras - Vito App',
                    text: text,
                });
                setShowShareModal(false);
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            alert("Tu dispositivo no soporta compartir nativo.");
        }
    };

    return (
        <div className="space-y-6 relative">
            
            {/* CABECERA: Título y Share */}
            <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-bold opacity-80">Inventario</h2>
                <button 
                    onClick={() => setShowShareModal(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${currentTheme.color} text-white shadow-lg active:scale-95 transition-transform`}
                >
                    <Share2 size={16} /> Compartir
                </button>
            </div>

            {/* FILTROS DE CATEGORÍA */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {uniqueCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                            filterCategory === cat 
                                ? `${currentTheme.color} text-white border-transparent shadow-md` 
                                : base.buttonSec
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* FORMULARIO AGREGAR */}
            <div className={`p-4 rounded-3xl border ${base.card} flex flex-col gap-3`}>
                <div className="flex items-center gap-2 opacity-50 uppercase text-[10px] font-bold tracking-wider">
                    <Package size={12}/> Nuevo Ingrediente
                </div>
                <div className="flex gap-2 flex-wrap">
                    <input 
                        type="text" 
                        value={newIngName} 
                        onChange={e => setNewIngName(e.target.value)} 
                        placeholder="Nombre..." 
                        className={`flex-[2] p-3 rounded-xl outline-none border min-w-[120px] ${base.input}`} 
                    />
                    <input 
                        type="text" 
                        value={newIngCat} 
                        onChange={e => setNewIngCat(e.target.value)} 
                        placeholder="Categoría" 
                        list="cat-list"
                        className={`flex-1 p-3 rounded-xl outline-none border min-w-[100px] ${base.input}`} 
                    />
                    <datalist id="cat-list">{uniqueCategories.map(c => <option key={c} value={c} />)}</datalist>
                    
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

            {/* LISTA INGREDIENTES */}
            <div className="grid gap-3 grid-cols-2">
                {filteredIngredients.map((ing: any) => {
                    const isEditing = editingIngId === ing.id;
                    const reserved = reservedState[ing.id] || 0;
                    
                    return (
                        <div key={ing.id} className={`${base.card} rounded-3xl border relative group overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md`}>
                            {isEditing ? (
                                <div className="p-4 space-y-3">
                                    <label className="text-[10px] font-bold opacity-50 uppercase">Editando</label>
                                    <input type="text" value={editIngForm.nombre} onChange={e => setEditIngForm({...editIngForm, nombre: e.target.value})} className={`w-full p-2 rounded-lg border text-sm ${base.input}`} placeholder="Nombre" />
                                    <input type="text" value={editIngForm.categoria} onChange={e => setEditIngForm({...editIngForm, categoria: e.target.value})} className={`w-full p-2 rounded-lg border text-sm ${base.input}`} placeholder="Categoría" list="cat-list" />
                                    
                                    <div className="flex gap-2">
                                        <input type="number" value={editIngForm.cantidad} onChange={e => setEditIngForm({...editIngForm, cantidad: e.target.value})} className={`w-full p-2 rounded-lg border text-sm ${base.input}`} />
                                        <select value={editIngForm.unidad} onChange={e => setEditIngForm({...editIngForm, unidad: e.target.value})} className={`p-2 rounded-lg border text-sm bg-transparent ${base.input}`}>
                                            <option value="g">g</option><option value="kg">kg</option><option value="u">u</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button 
                                            onClick={cancelEditIng} 
                                            className={`flex-1 ${base.buttonSec} border p-2 rounded-lg flex items-center justify-center`}
                                        >
                                            <X size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => saveEditIng(ing.id)} 
                                            className={`flex-[2] ${currentTheme.color} text-white p-2 rounded-lg flex items-center justify-center shadow`}
                                        >
                                            <Save size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* CABECERA TARJETA */}
                                    <div className="p-4 pb-2 relative flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="min-w-0 pr-12"> 
                                                <h3 className="font-bold text-sm overflow-x-auto whitespace-nowrap no-scrollbar opacity-90">
                                                    {ing.nombre}
                                                </h3>
                                                <p className="text-[9px] opacity-50 uppercase font-bold">{ing.categoria || 'General'}</p>
                                            </div>
                                            
                                            <div className="flex gap-1 opacity-30 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
                                                <button onClick={() => startEditIng(ing)} className="hover:text-blue-500 transition-colors p-1"><Edit3 size={14}/></button>
                                                <button onClick={() => delIng(ing.id)} className="hover:text-red-500 transition-colors p-1"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                        
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

                                    {/* BOTONES DE CARGA RÁPIDA */}
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

            {/* MODAL DE COMPARTIR - ESTILO BOTTOM SHEET ELEVADO */}
            {showShareModal && (
                // z-[60] para estar sobre la barra de navegación (z-50)
                // pb-24 para elevarlo visualmente sobre la barra
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4 pb-24 sm:pb-4">
                    
                    {/* Fondo Clickable para cerrar */}
                    <div className="absolute inset-0" onClick={() => setShowShareModal(false)}></div>

                    <div className={`${base.card} w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative border z-10 animate-in slide-in-from-bottom-10 duration-300`}>
                        {/* Indicador de arrastre visual */}
                        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6 opacity-50"></div>

                        <button onClick={() => setShowShareModal(false)} className="absolute top-6 right-6 opacity-50 hover:opacity-100 p-1"><X size={20}/></button>
                        
                        <h3 className="text-xl font-bold mb-1 text-center">Compartir Lista</h3>
                        <p className="text-sm opacity-60 mb-6 text-center">Enviando lista de: <b>{filterCategory}</b></p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={handleWhatsAppShare}
                                className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold bg-[#25D366] text-white shadow-lg active:scale-95 transition-transform hover:brightness-110"
                            >
                                <MessageCircle size={24} /> Enviar por WhatsApp
                            </button>
                            
                            <button 
                                onClick={handleNativeShare}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold border ${base.buttonSec} active:scale-95 transition-transform`}
                            >
                                <Smartphone size={24} /> Otras Aplicaciones
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};