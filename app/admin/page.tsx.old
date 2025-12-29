'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Pizza, Settings, Plus, Trash2, ChefHat, Eye, EyeOff, CheckCircle, 
  Clock, Flame, LogOut, List, User, Bell, ArrowRight, ArrowDownAZ, 
  ArrowUpNarrowWide, Maximize2, Minimize2, Users, Ban, RotateCcw, 
  KeyRound, LayoutDashboard, XCircle, Sun, Moon, BarChart3, Star, MessageSquare, Palette, Save, UserCheck, ImageIcon, UploadCloud, Timer as TimerIcon, Tag, ChevronUp, ChevronDown, CheckSquare, Square, Calculator, ShoppingBag, X, Minus, Pencil, Info, Hourglass
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- UTILIDADES ---
const formatSeconds = (seconds: number) => {
  if (!seconds && seconds !== 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Calcula el stock posible en base a una receta y el inventario actual
const calcularStockDinamico = (receta: any[], inventario: any[]) => {
    if (!receta || receta.length === 0) return 0;
    let min = Infinity;
    receta.forEach(item => {
        const ing = inventario.find(i => i.id === item.ingrediente_id);
        if (ing) {
            const requerida = Number(item.cantidad || item.cantidad_requerida || 0);
            if (requerida > 0) {
                const posible = Math.floor(ing.cantidad_disponible / requerida);
                if (posible < min) min = posible;
            }
        } else {
            min = 0;
        }
    });
    return min === Infinity ? 0 : min;
};

// --- COMPONENTE CONTROL DE TIEMPO (Flechas) ---
const TimeControl = ({ value, onChange, isDarkMode }: { value: number, onChange: (val: number) => void, isDarkMode: boolean }) => {
    const m = Math.floor(value / 60);
    const s = value % 60;

    const adjust = (type: 'm' | 's', amount: number) => {
        let newM = m;
        let newS = s;
        if (type === 'm') newM = Math.max(0, newM + amount);
        if (type === 's') {
            newS = newS + amount;
            if (newS >= 60) { newS -= 60; newM++; }
            if (newS < 0) { 
                if (newM > 0) { newS += 60; newM--; } else { newS = 0; }
            }
        }
        onChange(newM * 60 + newS);
    };

    const btnClass = isDarkMode ? "hover:bg-white/10 active:bg-white/20 text-white" : "hover:bg-black/10 active:bg-black/20 text-black";

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex w-full items-center justify-center gap-1">
                <div className="flex flex-col items-center">
                    <button onClick={() => adjust('m', 1)} className={`${btnClass} p-0.5 rounded`}><ChevronUp size={12}/></button>
                    <span className="text-sm font-mono font-bold leading-none">{m.toString().padStart(2,'0')}</span>
                    <button onClick={() => adjust('m', -1)} className={`${btnClass} p-0.5 rounded`}><ChevronDown size={12}/></button>
                </div>
                <span className="pb-1">:</span>
                <div className="flex flex-col items-center">
                    <button onClick={() => adjust('s', 10)} className={`${btnClass} p-0.5 rounded`}><ChevronUp size={12}/></button>
                    <span className="text-sm font-mono font-bold leading-none">{s.toString().padStart(2,'0')}</span>
                    <button onClick={() => adjust('s', -10)} className={`${btnClass} p-0.5 rounded`}><ChevronDown size={12}/></button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE TEMPORIZADOR VISUAL ---
const CookingTimer = ({ start, duration, onFinish }: { start: string, duration: number, onFinish?: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    useEffect(() => {
        if (!start) return;
        const interval = setInterval(() => {
            const startTime = new Date(start).getTime();
            const now = new Date().getTime();
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const remaining = Math.max(0, duration - elapsedSeconds);
            setTimeLeft(remaining);
            if (remaining === 0 && onFinish) onFinish();
        }, 1000);
        return () => clearInterval(interval);
    }, [start, duration]);
    const isFinished = timeLeft === 0;
    return (
        <div className={`flex items-center gap-1 font-mono font-bold px-3 py-1 rounded-full text-xs transition-all duration-300 ${isFinished ? 'bg-red-600 text-white animate-bounce border-2 border-yellow-400 shadow-[0_0_15px_rgba(239,68,68,0.8)] scale-110' : 'bg-orange-100 text-orange-600 border border-orange-200'}`}>
            <Clock size={12} />
            <span>{isFinished ? 'LISTA!' : formatSeconds(timeLeft)}</span>
        </div>
    );
};

const Timer = ({ startTime }: { startTime: string }) => {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const update = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  return <span className="ml-2 font-mono text-[10px] opacity-70 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full border border-current">{elapsed}</span>;
};

const THEMES = [
  { name: 'Carbone', color: 'bg-neutral-600', gradient: 'from-neutral-700 to-neutral-900', text: 'text-neutral-400' },
  { name: 'Turquesa', color: 'bg-cyan-600', gradient: 'from-cyan-600 to-teal-900', text: 'text-cyan-400' },
  { name: 'Pistacho', color: 'bg-lime-600', gradient: 'from-lime-600 to-green-900', text: 'text-lime-400' },
  { name: 'Fuego', color: 'bg-red-600', gradient: 'from-red-600 to-rose-900', text: 'text-red-500' },
  { name: 'Violeta', color: 'bg-violet-600', gradient: 'from-violet-600 to-purple-900', text: 'text-violet-400' },
  { name: 'Insta', color: 'bg-pink-600', gradient: 'from-purple-600 via-pink-600 to-orange-500', text: 'text-pink-500' },
  { name: 'Aurora', color: 'bg-indigo-600', gradient: 'from-blue-500 via-indigo-500 to-purple-500', text: 'text-indigo-400' },
  { name: 'Sunset', color: 'bg-orange-500', gradient: 'from-rose-500 via-orange-500 to-yellow-500', text: 'text-orange-500' },
  { name: 'Oceanic', color: 'bg-cyan-600', gradient: 'from-cyan-500 via-blue-600 to-indigo-600', text: 'text-cyan-500' },
  { name: 'Berry', color: 'bg-fuchsia-600', gradient: 'from-fuchsia-600 via-purple-600 to-pink-600', text: 'text-fuchsia-500' },
];

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'cocina' | 'pedidos' | 'menu' | 'ingredientes' | 'usuarios' | 'config' | 'ranking'>('cocina');
   
  // DATOS
  const [pedidos, setPedidos] = useState<any[]>([]); 
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [recetas, setRecetas] = useState<any[]>([]);
  const [reservedState, setReservedState] = useState<Record<string, number>>({});
   
  // ESTADO LOCAL
  const [edits, setEdits] = useState<Record<string, any>>({});
  const [invitadosDB, setInvitadosDB] = useState<any[]>([]); 
  const [valoraciones, setValoraciones] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ porciones_por_pizza: 4, total_invitados: 10, password_invitados: '', categoria_activa: '["General"]', mensaje_bienvenida: '', tiempo_recordatorio_minutos: 10 });
  const [invitadosCount, setInvitadosCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const prevPedidosCount = useRef(0);
   
  // NUEVA COMIDA
  const [newPizzaName, setNewPizzaName] = useState('');
  const [newPizzaDesc, setNewPizzaDesc] = useState('');
  const [newPizzaImg, setNewPizzaImg] = useState('');
  const [newPizzaTime, setNewPizzaTime] = useState(90);
  const [newPizzaCat, setNewPizzaCat] = useState(''); 
  const [newPizzaPortions, setNewPizzaPortions] = useState(8);
  const [uploading, setUploading] = useState(false);
   
  // NUEVA RECETAS
  const [newPizzaIngredients, setNewPizzaIngredients] = useState<{ingrediente_id: string, nombre: string, cantidad: number}[]>([]);
  const [newPizzaSelectedIng, setNewPizzaSelectedIng] = useState('');
  const [newPizzaRecipeQty, setNewPizzaRecipeQty] = useState<string | number>('');

  // ESTADOS INGREDIENTES (INVENTARIO)
  const [newIngName, setNewIngName] = useState('');
  const [newIngQty, setNewIngQty] = useState<string | number>('');
  const [newIngUnit, setNewIngUnit] = useState('g');
   
  // ESTADOS EDICION INGREDIENTE EN LISTA
  const [editingIngId, setEditingIngId] = useState<string | null>(null);
  const [editIngForm, setEditIngForm] = useState<{nombre: string, cantidad: number | string, unidad: string}>({nombre:'', cantidad:0, unidad:'g'});

  // ASIGNAR RECETA EXISTENTE
  const [tempRecipeIng, setTempRecipeIng] = useState<Record<string, string>>({});
  const [tempRecipeQty, setTempRecipeQty] = useState<Record<string, string | number>>({});
   
  const [newGuestName, setNewGuestName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [tempMotivos, setTempMotivos] = useState<Record<string, string>>({});

  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [orden, setOrden] = useState<'estado' | 'nombre'>('estado');
  const [isCompact, setIsCompact] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Estilos Base
  const base = isDarkMode ? {
      bg: "bg-neutral-950 text-white",
      card: "bg-neutral-900 border-neutral-800",
      input: "bg-black border-neutral-700 text-white placeholder-neutral-600",
      header: "bg-neutral-900/90 border-neutral-800",
      subtext: "text-neutral-500",
      textHead: "text-neutral-300",
      buttonSec: "bg-neutral-800 text-neutral-400 hover:text-white border-white/10",
      buttonIcon: "bg-neutral-800 text-neutral-400 hover:text-white", 
      divider: "border-neutral-800",
      metric: "bg-neutral-900 border-neutral-800",
      blocked: "bg-red-900/10 border-red-900/30",
      bar: "bg-neutral-900/50 backdrop-blur-md border-white/10 shadow-lg text-white border",
      innerCard: "bg-neutral-800 border-neutral-700 text-white",
      uploadBox: "bg-neutral-800 border-neutral-600 hover:bg-neutral-700"
  } : {
      bg: "bg-gray-100 text-gray-900",
      card: "bg-white border-gray-200 shadow-sm",
      input: "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
      header: "bg-white/90 border-gray-200",
      subtext: "text-gray-500",
      textHead: "text-gray-800",
      buttonSec: "bg-white text-gray-600 hover:text-black border-gray-300",
      buttonIcon: "bg-gray-200 text-gray-600 hover:text-black",
      divider: "border-gray-200",
      metric: "bg-white border-gray-200 shadow-sm",
      blocked: "bg-red-50 border-red-200",
      bar: "bg-white/50 backdrop-blur-md border-gray-300 shadow-lg text-gray-900 border",
      innerCard: "bg-neutral-100 border-neutral-200 text-gray-900",
      uploadBox: "bg-neutral-100 border-neutral-300 hover:bg-neutral-200"
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('vito-theme');
    if (savedTheme) setCurrentTheme(THEMES.find(t => t.name === savedTheme) || THEMES[0]);
    const savedMode = localStorage.getItem('vito-dark-mode');
    if (savedMode !== null) setIsDarkMode(savedMode === 'true');
    const savedOrden = localStorage.getItem('vito-orden');
    if (savedOrden) setOrden(savedOrden as any);
    const savedCompact = localStorage.getItem('vito-compact');
    if (savedCompact) setIsCompact(savedCompact === 'true');
    
    // --- REAL-TIME PRESENCE LOGIC (FIXED) ---
    const presenceChannel = supabase.channel('online-users');
    
    presenceChannel
        .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState();
            // Aplanar todos los estados para contar conexiones individuales
            const allPresences = Object.values(state).flat();
            // Filtrar solo los guests
            const count = allPresences.filter((p: any) => p.role === 'guest').length;
            setOnlineUsers(count);
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                // Admin se registra como 'admin' para no contar
                await presenceChannel.track({
                    online_at: new Date().toISOString(),
                    role: 'admin'
                });
            }
        });

    if (autenticado) {
      cargarDatos();
      const channel = supabase.channel('admin-realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => cargarDatos()).subscribe();
      return () => { supabase.removeChannel(channel); supabase.removeChannel(presenceChannel); };
    }
  }, [autenticado]);

  const toggleDarkMode = () => { setIsDarkMode(!isDarkMode); localStorage.setItem('vito-dark-mode', String(!isDarkMode)); };
  const toggleOrden = () => { const n = orden === 'estado' ? 'nombre' : 'estado'; setOrden(n); localStorage.setItem('vito-orden', n); };
  const toggleCompact = () => { setIsCompact(!isCompact); localStorage.setItem('vito-compact', String(!isCompact)); };
  const selectTheme = (t: any) => { setCurrentTheme(t); localStorage.setItem('vito-theme', t.name); setShowThemeSelector(false); window.dispatchEvent(new Event('storage')); };

  const ingresar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let { data } = await supabase.from('configuracion_dia').select('*').single();
    if (!data) { const { data: n } = await supabase.from('configuracion_dia').insert([{ password_admin: 'admin' }]).select().single(); data = n; }
    if (data && data.password_admin === password) { setAutenticado(true); setConfig(data); cargarDatos(); } else { alert('Incorrecto'); }
  };

  const cargarDatos = async () => {
    const now = new Date(); if (now.getHours() < 6) now.setDate(now.getDate() - 1); now.setHours(6, 0, 0, 0); const iso = now.toISOString();
    
    // Carga paralela
    const [piz, ing, rec, ped, inv, conf, val] = await Promise.all([
        supabase.from('menu_pizzas').select('*').order('created_at', { ascending: true }),
        supabase.from('ingredientes').select('*').order('nombre'),
        supabase.from('recetas').select('*'),
        supabase.from('pedidos').select('*').gte('created_at', iso).order('created_at', { ascending: true }),
        supabase.from('lista_invitados').select('*').order('nombre'),
        supabase.from('configuracion_dia').select('*').single(),
        supabase.from('valoraciones').select('*').gte('created_at', iso).order('created_at', { ascending: false })
    ]);

    if(piz.data) setPizzas(piz.data);
    if(ing.data) setIngredientes(ing.data);
    if(rec.data) setRecetas(rec.data);
    if(ped.data) {
        setPedidos(ped.data); 
        setInvitadosCount(new Set(ped.data.map((p: any) => p.invitado_nombre.toLowerCase())).size); 
        if (prevPedidosCount.current > 0 && ped.data.length > prevPedidosCount.current) new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{}); 
        prevPedidosCount.current = ped.data.length;
    }
    if(inv.data) setInvitadosDB(inv.data);
    if(conf.data) setConfig(conf.data);
    if(val.data) setValoraciones(val.data);
    
    if(piz.data && ing.data && rec.data && ped.data) {
        actualizarStockGlobal();
    }
  };

  const compressImage = async (file: File): Promise<Blob> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
              const img = new Image();
              img.src = event.target?.result as string;
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const MAX_WIDTH = 1600; const MAX_HEIGHT = 1600;
                  let width = img.width; let height = img.height;
                  if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                  canvas.width = width; canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx?.drawImage(img, 0, 0, width, height);
                  canvas.toBlob((blob) => { if(blob) resolve(blob); else reject(new Error('Canvas error')); }, 'image/jpeg', 0.8);
              };
          };
          reader.onerror = (error) => reject(error);
      });
  };

  const handleLocalEdit = (id: string, field: string, value: any) => {
      setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const updateLocalRecipe = (pizzaId: string, newRecipeList: any[]) => {
      handleLocalEdit(pizzaId, 'local_recipe', newRecipeList);
  };

  const savePizzaChanges = async (id: string) => {
      const changes = edits[id];
      if (!changes) return;

      const { local_recipe, ...pizzaFields } = changes;
      if (Object.keys(pizzaFields).length > 0) {
          await supabase.from('menu_pizzas').update(pizzaFields).eq('id', id);
      }

      if (local_recipe) {
          await supabase.from('recetas').delete().eq('pizza_id', id);
          if (local_recipe.length > 0) {
              const rows = local_recipe.map((r: any) => ({
                  pizza_id: id,
                  ingrediente_id: r.ingrediente_id,
                  cantidad_requerida: r.cantidad_requerida
              }));
              await supabase.from('recetas').insert(rows);
          }
      }
      await cargarDatos();
      await actualizarStockGlobal(); 
      setEdits(prev => { const newEdits = { ...prev }; delete newEdits[id]; return newEdits; });
  };

  const cancelChanges = (id: string) => { setEdits(prev => { const newEdits = { ...prev }; delete newEdits[id]; return newEdits; }); };

  const handleImageUpload = async (event: any, pizzaId: string | null = null) => {
      const file = event.target.files?.[0]; if (!file) return;
      setUploading(true);
      try {
          const compressedBlob = await compressImage(file);
          const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
          const fileName = `${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage.from('pizzas').upload(fileName, compressedFile);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from('pizzas').getPublicUrl(fileName);
          if(pizzaId) handleLocalEdit(pizzaId, 'imagen_url', data.publicUrl); else setNewPizzaImg(data.publicUrl);
      } catch (error: any) { alert('Error: ' + error.message); } finally { setUploading(false); }
  };

  const actualizarStockGlobal = async () => {
      const now = new Date(); if (now.getHours() < 6) now.setDate(now.getDate() - 1); now.setHours(6, 0, 0, 0); const iso = now.toISOString();

      const [ { data: allRecetas }, { data: allIngs }, { data: allPizzas }, { data: allPendientes }, { data: configDia } ] = await Promise.all([
          supabase.from('recetas').select('*'),
          supabase.from('ingredientes').select('*'),
          supabase.from('menu_pizzas').select('*'),
          supabase.from('pedidos').select('*').eq('estado', 'pendiente').gte('created_at', iso), 
          supabase.from('configuracion_dia').select('*').single()
      ]);
      
      if(!allRecetas || !allIngs || !allPizzas || !allPendientes || !configDia) return;

      const porcionesDefault = configDia.porciones_por_pizza || 8;
      const reservedStock: Record<string, number> = {};
      
      allPendientes.forEach((pedido: any) => {
          const pizza = allPizzas.find((p:any) => p.id === pedido.pizza_id);
          const porcionesEntera = pizza?.porciones_individuales || porcionesDefault;
          const fraccion = pedido.cantidad_porciones / porcionesEntera;
          const recetaPizza = allRecetas.filter((r: any) => r.pizza_id === pedido.pizza_id);
          
          recetaPizza.forEach((item: any) => {
              const cantidadNecesaria = item.cantidad_requerida * fraccion;
              reservedStock[item.ingrediente_id] = (reservedStock[item.ingrediente_id] || 0) + cantidadNecesaria;
          });
      });
      
      setReservedState(reservedStock);

      const updates = allPizzas.map(async (p) => {
          const pRecetas = allRecetas.filter((r: any) => r.pizza_id === p.id);
          let stockVirtual = 999; 

          if (pRecetas.length > 0) {
              let minPizzasPosibles = Infinity;
              pRecetas.forEach((item: any) => {
                  const ing = allIngs.find((i: any) => i.id === item.ingrediente_id);
                  if (ing) {
                      const fisico = ing.cantidad_disponible || 0;
                      const reservado = reservedStock[ing.id] || 0;
                      const disponibleReal = Math.max(0, fisico - reservado);
                      const posibles = item.cantidad_requerida > 0 ? Math.floor(disponibleReal / item.cantidad_requerida) : 999;
                      if (posibles < minPizzasPosibles) minPizzasPosibles = posibles;
                  } else {
                      minPizzasPosibles = 0; 
                  }
              });
              stockVirtual = minPizzasPosibles === Infinity ? 0 : minPizzasPosibles;
          } else {
             stockVirtual = 0; 
          }

          if (p.stock !== stockVirtual) {
              await supabase.from('menu_pizzas').update({ stock: stockVirtual }).eq('id', p.id);
          }
      });
      
      await Promise.all(updates);
      const { data: refreshedPizzas } = await supabase.from('menu_pizzas').select('*').order('created_at', { ascending: true });
      if(refreshedPizzas) setPizzas(refreshedPizzas);
  };

  const toggleCocinando = async (p: any) => { 
      if(!p.cocinando && p.totalPendientes < p.target) { alert("Falta para 1 entera"); return; } 
      const newState = !p.cocinando;
      const startTime = newState ? new Date().toISOString() : null;

      if (newState) {
          const receta = recetas.filter(r => r.pizza_id === p.id);
          if(receta.length > 0) {
              for (const item of receta) {
                  const ing = ingredientes.find(i => i.id === item.ingrediente_id);
                  if (ing) {
                      const nuevaCant = ing.cantidad_disponible - item.cantidad_requerida;
                      await supabase.from('ingredientes').update({ cantidad_disponible: nuevaCant }).eq('id', ing.id);
                  }
              }
          }
      } else {
          const receta = recetas.filter(r => r.pizza_id === p.id);
          if(receta.length > 0) {
              for (const item of receta) {
                  const ing = ingredientes.find(i => i.id === item.ingrediente_id);
                  if (ing) {
                      const nuevaCant = ing.cantidad_disponible + item.cantidad_requerida;
                      await supabase.from('ingredientes').update({ cantidad_disponible: nuevaCant }).eq('id', ing.id);
                  }
              }
          }
      }

      await supabase.from('menu_pizzas').update({ cocinando: newState, cocinando_inicio: startTime }).eq('id', p.id);
      await actualizarStockGlobal();
      const { data: ings } = await supabase.from('ingredientes').select('*').order('nombre');
      if(ings) setIngredientes(ings);
  };

  // CALCULO STOCK DINAMICO NUEVA PIZZA
  const stockEstimadoNueva = useMemo(() => {
      return calcularStockDinamico(newPizzaIngredients, ingredientes);
  }, [newPizzaIngredients, ingredientes]);

  const activeCategories: string[] = useMemo(() => { try { const parsed = JSON.parse(config.categoria_activa); if (parsed === 'Todas' || (Array.isArray(parsed) && parsed.length === 0)) return []; return Array.isArray(parsed) ? parsed : ['General']; } catch { return ['General']; } }, [config.categoria_activa]);

  const metricas = useMemo(() => {
      // 1. Aplicar filtro de categorías también a cocina
      let lista = pizzas.filter(p => p.activa);
      
      if (activeCategories.length > 0 && !activeCategories.includes('Todas')) {
          lista = lista.filter(p => activeCategories.includes(p.categoria || 'General'));
      }

      const listaProcesada = lista.map(pizza => {
        const pendientes = pedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado');
        const totalPendientes = pendientes.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
        const target = pizza.porciones_individuales || config.porciones_por_pizza;
        
        return { ...pizza, totalPendientes, completas: Math.floor(totalPendientes / target), faltan: target - (totalPendientes % target), target, percent: ((totalPendientes % target) / target) * 100, pedidosPendientes: pendientes, stockRestante: pizza.stock };
      });

      return listaProcesada.sort((a, b) => {
          if (a.cocinando && !b.cocinando) return -1; if (!a.cocinando && b.cocinando) return 1;
          const aReady = a.totalPendientes >= a.target; const bReady = b.totalPendientes >= b.target;
          if (aReady && !bReady) return -1; if (!aReady && bReady) return 1;
          if (orden === 'nombre') return a.nombre.localeCompare(b.nombre);
          return b.totalPendientes - a.totalPendientes;
      });
  }, [pizzas, pedidos, config, orden, activeCategories]);

  // Categories & Stats
  const uniqueCategories = useMemo(() => { const cats = new Set<string>(); pizzas.forEach(p => { if(p.categoria) cats.add(p.categoria); }); return Array.from(cats); }, [pizzas]);
  const toggleCategory = async (cat: string) => { const current = new Set(activeCategories); if (current.has(cat)) current.delete(cat); else current.add(cat); const newArr = Array.from(current); setConfig({...config, categoria_activa: JSON.stringify(newArr)}); await supabase.from('configuracion_dia').update({ categoria_activa: JSON.stringify(newArr) }).eq('id', config.id); };

  const stats = useMemo(() => {
      const totalPendientes = metricas.reduce((acc, m) => acc + m.totalPendientes, 0);
      const pizzasIncompletas = metricas.filter(m => m.faltan < m.target && m.totalPendientes > 0).length;
      let totalPizzasEntregadas = 0;
      pizzas.forEach(pz => { const porc = pedidos.filter(p => p.pizza_id === pz.id && p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0); const t = pz.porciones_individuales || config.porciones_por_pizza; totalPizzasEntregadas += Math.floor(porc / t); });
      const totalStock = pizzas.reduce((acc, p) => acc + ((p.stock || 0) * (p.porciones_individuales || config.porciones_por_pizza)), 0);
      return { totalPendientes, pizzasIncompletas, totalPizzasEntregadas, totalStockPorciones: totalStock };
  }, [metricas, pizzas, pedidos, config]);

  const pedidosAgrupados = Array.from(new Set(pedidos.map(p => p.invitado_nombre.toLowerCase()))).map(nombre => {
      const susPedidos = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre);
      const nombreReal = susPedidos[0]?.invitado_nombre || nombre;
      const detalle = pizzas.map(pz => {
          const ped = susPedidos.filter(p => p.pizza_id === pz.id); 
          if (ped.length === 0) return null;
          const entr = ped.filter(p => p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0);
          const pendientesArr = ped.filter(p => p.estado === 'pendiente');
          const pend = pendientesArr.reduce((acc, c) => acc + c.cantidad_porciones, 0);
          const oldestPending = pendientesArr.length > 0 ? pendientesArr.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0].created_at : null;
          return { id: pz.id, nombre: pz.nombre, entregada: entr, enHorno: pz.cocinando ? pend : 0, enEspera: pz.cocinando ? 0 : pend, oldestPending: oldestPending };
      }).filter(Boolean);
      const totalEnHorno = detalle.reduce((acc, d) => acc + (d?.enHorno || 0), 0);
      const totalEnEspera = detalle.reduce((acc, d) => acc + (d?.enEspera || 0), 0);
      const totalPendienteGeneral = totalEnHorno + totalEnEspera;
      return { nombre: nombreReal, detalle, totalPendienteGeneral, totalEnHorno, totalEnEspera };
  }).sort((a, b) => b.totalPendienteGeneral - a.totalPendienteGeneral);

  const ranking = useMemo(() => { return pizzas.map(p => { const vals = valoraciones.filter(v => v.pizza_id === p.id); const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b.rating, 0) / vals.length) : 0; const orders = pedidos.filter(ped => ped.pizza_id === p.id).reduce((acc, c) => acc + c.cantidad_porciones, 0); return { ...p, avg: parseFloat(avg.toFixed(1)), count: vals.length, totalOrders: orders }; }).sort((a, b) => b.avg - a.avg); }, [pizzas, valoraciones, pedidos]);

  const allUsersList = useMemo(() => { const map = new Map(); invitadosDB.forEach(u => map.set(u.nombre.toLowerCase(), { ...u, source: 'db', origen: u.origen || 'admin' })); pedidos.forEach(p => {  const key = p.invitado_nombre.toLowerCase(); if (!map.has(key)) map.set(key, { id: null, nombre: p.invitado_nombre, bloqueado: false, source: 'ped', totalOrders: p.cantidad_porciones });  else { const existing = map.get(key); map.set(key, { ...existing, totalOrders: (existing.totalOrders || 0) + p.cantidad_porciones }); } }); invitadosDB.forEach(u => { const key = u.nombre.toLowerCase(); if(map.has(key)) { const existing = map.get(key); map.set(key, { ...existing, source: 'db', id: u.id, origen: u.origen || 'admin' }); }}); return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre)); }, [invitadosDB, pedidos]);

  // ACTIONS
  const eliminarUsuario = async (nombre: string, userDB: any) => { if(!confirm(`¿ELIMINAR a ${nombre}?`)) return; await supabase.from('pedidos').delete().eq('invitado_nombre', nombre); if(userDB?.id) { await supabase.from('lista_invitados').delete().eq('id', userDB.id); } cargarDatos(); };
  const eliminarPedidosGusto = async (nom: string, pid: string) => { 
      if(confirm(`¿Borrar pendientes?`)) { 
          const ids = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nom.toLowerCase() && p.pizza_id === pid && p.estado === 'pendiente').map(p => p.id); 
          if(ids.length) await supabase.from('pedidos').delete().in('id', ids); 
          cargarDatos(); 
      } 
  };
  const entregar = async (p: any) => { if(!confirm(`¿Salió ${p.nombre}?`)) return; let n = p.target; const ids=[]; for(const pd of p.pedidosPendientes){ if(n<=0) break; ids.push(pd.id); n-=pd.cantidad_porciones; } if(ids.length) { await supabase.from('pedidos').update({ estado: 'entregado' }).in('id', ids); await supabase.from('menu_pizzas').update({ cocinando: false, cocinando_inicio: null }).eq('id', p.id); cargarDatos(); } };
  
  const updateP = async (id: string, field: string, val: any) => { 
      if (field === 'activa') { 
          await supabase.from('menu_pizzas').update({ activa: val }).eq('id', id); 
          setPizzas(prev => prev.map(p => p.id === id ? { ...p, activa: val } : p)); 
      } else { 
          handleLocalEdit(id, field, val); 
      } 
  };
  
  const addP = async () => { 
      if(!newPizzaName) return; 
      const { data: pizzaData } = await supabase.from('menu_pizzas').insert([{ nombre: newPizzaName, descripcion: newPizzaDesc, stock: 0, imagen_url: newPizzaImg, tiempo_coccion: newPizzaTime, categoria: newPizzaCat, activa: true, porciones_individuales: newPizzaPortions }]).select().single();
      
      if(pizzaData && newPizzaIngredients.length > 0) {
          const rows = newPizzaIngredients.map(r => ({
              pizza_id: pizzaData.id,
              ingrediente_id: r.ingrediente_id,
              cantidad_requerida: r.cantidad
          }));
          await supabase.from('recetas').insert(rows);
      }
      setNewPizzaName(''); setNewPizzaDesc(''); setNewPizzaImg(''); setNewPizzaIngredients([]); 
      await actualizarStockGlobal(); 
  };
  
  const delP = async (id: string) => { if(confirm('¿Borrar?')) await supabase.from('menu_pizzas').delete().eq('id', id); cargarDatos(); };
  const changePass = async () => { if(!newPass) return; await supabase.from('configuracion_dia').update({password_admin: newPass}).eq('id', config.id); alert('OK'); setNewPass(''); };
  const addU = async () => { if(!newGuestName) return; const { error } = await supabase.from('lista_invitados').insert([{ nombre: newGuestName }]); if(error) alert('Error'); else { setNewGuestName(''); cargarDatos(); } };
  const toggleB = async (u: any) => { let uid = u.id; if(!uid) { const { data } = await supabase.from('lista_invitados').insert([{ nombre: u.nombre }]).select().single(); if(data) uid = data.id; else return; } await supabase.from('lista_invitados').update({ bloqueado: !u.bloqueado }).eq('id', uid); cargarDatos(); };
  const guardarMotivo = async (nombre: string, u: any) => { const motivo = tempMotivos[nombre]; if (motivo === undefined) return; let uid = u?.id; if (!uid) { const { data, error } = await supabase.from('lista_invitados').insert([{ nombre: nombre, motivo_bloqueo: motivo, bloqueado: true }]).select().single(); if (error || !data) { alert("Error al guardar usuario."); return; } } else { await supabase.from('lista_invitados').update({ motivo_bloqueo: motivo }).eq('id', uid); } alert("Motivo guardado"); cargarDatos(); };
  const resetU = async (nom: string) => { if(!confirm(`¿Reset pedidos de ${nom}?`)) return; const userExists = invitadosDB.some(u => u.nombre.toLowerCase() === nom.toLowerCase()); if (!userExists) { await supabase.from('lista_invitados').insert([{ nombre: nom, origen: 'guest' }]); } const ids = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nom.toLowerCase()).map(p => p.id); if(ids.length) await supabase.from('pedidos').delete().in('id', ids); cargarDatos(); };
  const resetAllOrders = async () => { const promptText = prompt('Escribe "BORRAR TODO" para confirmar'); if (promptText?.toUpperCase() !== "BORRAR TODO") return; const { error } = await supabase.from('pedidos').delete().neq('id', '00000000-0000-0000-0000-000000000000'); if(error) alert("Error: " + error.message); else { alert("Pedidos eliminados."); cargarDatos(); } };
  const delVal = async (id: string) => { if(confirm("¿Borrar reseña?")) { await supabase.from('valoraciones').delete().eq('id', id); cargarDatos(); } };
  const delValPizza = async (pid: string) => { if(confirm("¿Borrar reseñas de este item?")) { await supabase.from('valoraciones').delete().eq('pizza_id', pid); cargarDatos(); } };
  const delAllVal = async () => { if(prompt("Escribe BORRAR") === 'BORRAR') { const { data } = await supabase.from('valoraciones').select('id'); const ids = data?.map(v => v.id) || []; if(ids.length) await supabase.from('valoraciones').delete().in('id', ids); cargarDatos(); } };

  // --- INGREDIENTES ACTIONS (MEJORADO) ---
  const addIng = async () => { 
      if(!newIngName) return; 
      const qtyNum = newIngQty === '' ? 0 : Number(newIngQty); 
      
      // BUSCAR POR NOMBRE DIRECTAMENTE
      const existing = ingredientes.find(i => i.nombre.toLowerCase() === newIngName.toLowerCase());
      
      if (existing) {
          await supabase.from('ingredientes').update({ cantidad_disponible: existing.cantidad_disponible + qtyNum }).eq('id', existing.id);
      } else {
          await supabase.from('ingredientes').insert([{ nombre: newIngName, cantidad_disponible: qtyNum, unidad: newIngUnit }]); 
      }
      
      setNewIngName(''); setNewIngQty(''); 
      await actualizarStockGlobal();
      cargarDatos();
  };

  const startEditIng = (ing: any) => {
      setEditingIngId(ing.id);
      setEditIngForm({ nombre: ing.nombre, cantidad: ing.cantidad_disponible, unidad: ing.unidad || 'g' });
  };

  const cancelEditIng = () => {
      setEditingIngId(null);
  };

  const saveEditIng = async (id: string) => {
      const qty = Number(editIngForm.cantidad);
      await supabase.from('ingredientes').update({ nombre: editIngForm.nombre, cantidad_disponible: qty, unidad: editIngForm.unidad }).eq('id', id);
      setEditingIngId(null);
      await actualizarStockGlobal();
      cargarDatos();
  };

  const delIng = async (id: string) => { if(confirm('¿Borrar ingrediente?')) await supabase.from('ingredientes').delete().eq('id', id); await actualizarStockGlobal(); cargarDatos(); };
  
  // --- ADD INGREDIENT TO NEW PIZZA (MEMORY) ---
  const addToNewPizzaRecipe = () => {
      if(!newPizzaSelectedIng) return;
      const [ingId, name] = newPizzaSelectedIng.split('|');
      const qty = Number(newPizzaRecipeQty);
      if(qty <= 0) return;
      setNewPizzaIngredients(prev => [...prev, { ingrediente_id: ingId, nombre: name, cantidad: qty }]);
      setNewPizzaSelectedIng(''); setNewPizzaRecipeQty(1);
  };
  const removeFromNewPizzaRecipe = (idx: number) => {
      setNewPizzaIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  // --- ADD INGREDIENT TO EXISTING PIZZA (LOCAL EDIT) ---
  const addToExistingPizza = (pizzaId: string, ingId: string, name: string, qty: any, currentRecipe: any[]) => {
      const q = Number(qty);
      if(q <= 0) return;
      const newRecipe = [...currentRecipe, { ingrediente_id: ingId, cantidad_requerida: q, nombre: name }];
      updateLocalRecipe(pizzaId, newRecipe);
  };
  const removeFromExistingPizza = (pizzaId: string, idx: number, currentRecipe: any[]) => {
      const newRecipe = currentRecipe.filter((_, i) => i !== idx);
      updateLocalRecipe(pizzaId, newRecipe);
  };

  if (!autenticado) return (
    <div className={`min-h-screen flex items-center justify-center p-4 pb-40 ${base.bg}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-xl ${base.card}`}>
        <div className="flex justify-center mb-6"><img src="/logo.png" alt="Logo" className="h-48 w-auto object-contain drop-shadow-xl" /></div>
        <form onSubmit={ingresar} className="flex flex-col gap-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full p-4 rounded-xl border outline-none ${base.input}`} placeholder="Contraseña..." autoFocus />
            <button type="submit" className={`w-full ${currentTheme.color} text-white font-bold py-4 rounded-xl hover:opacity-90 transition`}>ENTRAR</button>
        </form>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
            <button onClick={() => window.location.href='/'} className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${base.buttonSec}`}>
                <Users size={20} /> MODO INVITADOS
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans pb-28 w-full ${base.bg}`}>
      <div className={`w-full h-40 rounded-b-[40px] bg-gradient-to-br ${currentTheme.gradient} shadow-xl absolute top-0 left-0 z-0`}></div>
      <div className={`fixed top-4 left-4 right-4 z-50 rounded-2xl p-2 flex justify-between items-center shadow-lg backdrop-blur-md border ${base.bar}`}>
          <div className="flex items-center gap-3 pl-2">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
              <div className="leading-tight"><h1 className="font-bold text-sm">Modo Pizzaiolo</h1><p className="text-[10px] opacity-70 flex items-center gap-1"><Users size={10} className="text-green-500 animate-pulse"/> {onlineUsers} / {config.total_invitados}</p></div>
          </div>
          <div className="flex gap-2 relative pr-1">
              <button onClick={() => setShowThemeSelector(!showThemeSelector)} className={`p-2 rounded-full border ${base.buttonSec}`}><Palette size={16}/></button>
              {showThemeSelector && (<div className="absolute top-12 right-0 bg-black/90 backdrop-blur p-2 rounded-xl flex gap-2 animate-in fade-in z-50 border border-white/10 shadow-xl">{THEMES.map(t => (<button key={t.name} onClick={() => selectTheme(t)} className={`w-6 h-6 rounded-full ${t.color} border-2 border-white ring-2 ring-transparent hover:scale-110 transition-transform`}></button>))}</div>)}
              <button onClick={toggleDarkMode} className={`p-2 rounded-full border ${base.buttonSec}`}>{isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}</button>
              {view === 'cocina' && (<><button onClick={() => setOrden(o => o === 'estado' ? 'nombre' : 'estado')} className={`p-2 rounded-full border flex items-center gap-1 ${base.buttonSec}`}>{orden === 'estado' ? <ArrowUpNarrowWide size={16}/> : <ArrowDownAZ size={16}/>}</button><button onClick={() => setIsCompact(!isCompact)} className={`p-2 rounded-full border flex items-center gap-1 ${base.buttonSec}`}>{isCompact ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}</button></>)}
              <button onClick={() => window.location.href='/'} className={`p-2 rounded-full border ${base.buttonSec} ml-1`}><LogOut size={16} /></button>
          </div>
      </div>
      <div className="relative z-10 pt-24 px-4 pb-36">
        {view === 'cocina' && (
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`p-3 rounded-2xl border ${base.metric}`}><h4 className={`text-[10px] font-bold uppercase mb-2 text-center border-b pb-1 ${base.divider} ${base.subtext}`}>ENTERAS</h4><div className="grid grid-cols-2 gap-2"><div className="text-center"><p className={`text-[9px] uppercase font-bold ${base.subtext}`}>En Curso</p><p className="text-xl font-bold">{stats.pizzasIncompletas}</p></div><div className="text-center"><p className={`text-[9px] uppercase font-bold ${base.subtext}`}>Entregadas</p><p className="text-xl font-bold">{stats.totalPizzasEntregadas}</p></div></div></div>
                <div className={`p-3 rounded-2xl border flex flex-col justify-center items-center ${base.metric}`}>
                    <h4 className={`text-[10px] font-bold uppercase mb-2 text-center w-full border-b pb-1 ${base.divider} ${base.subtext}`}>PORCIONES PEDIDAS</h4>
                    <p className="text-3xl font-bold">{stats.totalPendientes}</p>
                </div>
            </div>
        )}
        <main className="max-w-4xl mx-auto space-y-4 w-full">
            {view === 'cocina' && (<div className="grid gap-3">{metricas.map(p => (<div key={p.id} className={`${base.card} rounded-3xl border relative overflow-hidden transition-all ${p.cocinando ? 'border-red-600/50 shadow-lg' : ''} ${isCompact ? 'p-3' : 'p-5'}`}>{!isCompact && p.cocinando && (<div className="absolute -right-10 -bottom-10 text-red-600/20"><Flame size={150} /></div>)}<div className="flex justify-between items-start mb-2 relative z-10"><div><h3 className={`font-bold flex items-center gap-2 ${isCompact ? 'text-base' : 'text-xl'}`}>{p.nombre}{p.cocinando && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">EN HORNO</span>}</h3><p className={`text-xs ${base.subtext} flex items-center gap-1 mt-1`}><Clock size={12}/> Pendientes: {p.totalPendientes}</p><p className={`text-[10px] mt-1 font-mono ${p.stockRestante === 0 ? 'text-red-500 font-bold' : base.subtext}`}>STOCK: {p.stockRestante} u</p></div><div className="flex flex-col items-center gap-1">{p.cocinando && p.cocinando_inicio && <CookingTimer start={p.cocinando_inicio} duration={p.tiempo_coccion || 60} />}<button onClick={() => toggleCocinando(p)} className={`rounded-xl transition-all flex items-center justify-center ${p.cocinando ? 'bg-red-600 text-white shadow-lg scale-105' : base.buttonSec} ${isCompact ? 'p-2' : 'p-3'}`}><Flame size={isCompact ? 16 : 20} className={p.cocinando ? 'animate-bounce' : ''} /></button></div></div><div className={`relative ${isDarkMode ? 'bg-black' : 'bg-gray-300'} rounded-full overflow-hidden z-10 mb-3 ${isCompact ? 'h-2' : 'h-4'}`}><div className="absolute inset-0 flex justify-between px-[1px] z-20">{[...Array(p.target)].map((_, i) => <div key={i} className={`w-[1px] h-full ${isDarkMode ? 'bg-white/10' : 'bg-white/50'}`}></div>)}</div><div className={`absolute h-full ${p.cocinando ? 'bg-red-600' : currentTheme.color} transition-all duration-700`} style={{ width: `${p.percent}%` }}></div></div>{p.completas > 0 ? (<button onClick={() => entregar(p)} className={`w-full ${currentTheme.color} text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 ${isCompact ? 'py-2 text-sm' : 'py-3'}`}><CheckCircle size={isCompact ? 16 : 20} /> ¡LISTA! ({p.completas})</button>) : (<div className={`w-full text-center text-xs ${base.subtext} font-mono border rounded-xl ${isDarkMode ? 'border-neutral-800' : 'border-gray-200'} ${isCompact ? 'py-1' : 'py-2'}`}>Faltan {p.faltan} porc.</div>)}</div>))}</div>)}
            {view === 'pedidos' && (
                <div className="space-y-4">
                    <div className={`p-4 rounded-3xl border mb-6 shadow-sm flex items-center justify-center ${base.card}`}><h2 className={`text-sm font-bold uppercase tracking-widest ${base.textHead}`}>Pedidos Activos</h2></div>
                    {pedidosAgrupados.length === 0 ? <p className={`text-center ${base.subtext}`}>Sin pedidos.</p> : pedidosAgrupados.map((u: any, i: number) => { 
                        return (<div key={i} className={`${base.card} p-4 rounded-2xl border relative`}><div className={`flex justify-between border-b pb-2 mb-3 pr-10 ${base.divider}`}><h3 className="font-bold flex items-center gap-2 capitalize text-lg"><User size={18}/> {u.nombre}{u.totalEnHorno > 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">EN HORNO</span>}{u.totalEnEspera > 0 && <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">ESPERANDO</span>}</h3></div><div className="space-y-2">{u.detalle.map((d: any, k: number) => (<div key={k} className={`flex justify-between items-center text-sm p-2 rounded-lg border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}><div className="flex items-center"><span>{d.nombre}</span>{d.oldestPending && <Timer startTime={d.oldestPending} />}</div><div className="flex items-center gap-2 text-xs font-bold">{d.enHorno > 0 && (<span className="text-red-500 flex items-center gap-1"><Flame size={12}/> {d.enHorno}</span>)}{d.enEspera > 0 && (<span className="text-yellow-500 flex items-center gap-1"><Clock size={12}/> {d.enEspera}</span>)}{d.entregada > 0 && (<span className="text-green-500 flex items-center gap-1"><CheckCircle size={12}/> {d.entregada}</span>)}<button onClick={(e) => { e.stopPropagation(); eliminarPedidosGusto(u.nombre, d.id); }} className="p-1 ml-2 bg-red-900/20 text-red-500 rounded hover:bg-red-900/40 border border-red-900/30"><XCircle size={14} /></button></div></div>))}</div></div>); 
                    })}
                </div>
            )}
            
            {view === 'ingredientes' && (
                <div className="space-y-6">
                    {/* ZONA AGREGAR */}
                    <div className={`p-6 rounded-3xl border ${base.card}`}>
                        <h3 className={`font-bold mb-4 flex items-center gap-2 ${base.subtext}`}><Plus size={18}/> Agregar Stock / Nuevo</h3>
                        
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                {/* INPUT CON DATALIST (REEMPLAZO SELECTOR HIBRIDO) */}
                                <div className="flex-1 relative">
                                    <input 
                                        list="ingredientes-list"
                                        className={`w-full p-3 rounded-xl border outline-none ${base.input}`} 
                                        placeholder="Nombre del producto..." 
                                        value={newIngName} 
                                        onChange={e => setNewIngName(e.target.value)} 
                                    />
                                    <datalist id="ingredientes-list">
                                        {ingredientes.map(i => <option key={i.id} value={i.nombre} />)}
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
                                    onChange={e => setNewIngQty(e.target.value)} 
                                />
                                <select 
                                    className={`w-24 p-3 rounded-xl border outline-none bg-transparent ${base.input}`} 
                                    value={newIngUnit} 
                                    onChange={e => setNewIngUnit(e.target.value)}
                                >
                                    <option value="u" className="text-black">u</option>
                                    <option value="g" className="text-black">g</option>
                                    <option value="kg" className="text-black">kg</option>
                                    <option value="ml" className="text-black">ml</option>
                                    <option value="L" className="text-black">L</option>
                                </select>
                                <button onClick={addIng} className={`${currentTheme.color} text-white font-bold px-6 rounded-xl shadow-lg active:scale-95 transition-transform flex-1`}>
                                    {ingredientes.some(i => i.nombre.toLowerCase() === newIngName.toLowerCase()) ? 'SUMAR' : 'CREAR'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* LISTA FIJA ABAJO */}
                    <div className="grid gap-2 pb-20">
                        {ingredientes.map(ing => {
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
                                                onChange={e => setEditIngForm({...editIngForm, nombre: e.target.value})} 
                                                className={`p-2 rounded-lg border text-sm ${base.input}`}
                                            />
                                            <div className="flex gap-2">
                                                <input 
                                                    type="number" 
                                                    value={editIngForm.cantidad} 
                                                    onChange={e => setEditIngForm({...editIngForm, cantidad: e.target.value})} 
                                                    className={`w-24 p-2 rounded-lg border text-center ${base.input}`}
                                                />
                                                <select 
                                                    value={editIngForm.unidad} 
                                                    onChange={e => setEditIngForm({...editIngForm, unidad: e.target.value})} 
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
            )}

            {view === 'menu' && (
                <div className="space-y-6">
                    <div className={`${base.card} p-5 rounded-3xl border flex flex-col gap-3 shadow-sm`}>
                        <label className={`text-xs font-bold uppercase tracking-wider opacity-60 ${base.subtext}`}>CATEGORIAS A MOSTRAR:</label>
                        <div className="flex flex-wrap gap-2">
                             <button onClick={async () => {
                                 const isAll = activeCategories.includes('Todas');
                                 const newVal = isAll ? ['General'] : ['Todas'];
                                 setConfig({...config, categoria_activa: JSON.stringify(newVal)});
                                 await supabase.from('configuracion_dia').update({ categoria_activa: JSON.stringify(newVal) }).eq('id', config.id);
                             }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${activeCategories.includes('Todas') ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-100 dark:bg-white/5 border-transparent text-gray-500'}`}>
                                 {activeCategories.includes('Todas') ? <CheckSquare size={14}/> : <Square size={14}/>} Todas
                             </button>
                             {uniqueCategories.map(cat => {
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
                            <button onClick={addP} disabled={uploading} className={`${currentTheme.color} text-white font-bold px-6 py-2 rounded-xl shadow-lg active:scale-95 transition-all text-sm`}>CREAR</button>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            <input className={`w-full text-2xl font-bold bg-transparent outline-none placeholder-opacity-30 ${isDarkMode ? 'placeholder-white' : 'placeholder-black'}`} placeholder="Nombre del plato..." value={newPizzaName} onChange={e => setNewPizzaName(e.target.value)} />
                            
                            <div className="flex gap-4">
                                <label className={`flex-shrink-0 cursor-pointer w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed ${base.uploadBox} flex items-center justify-center transition-colors group relative`}>
                                    {newPizzaImg ? <img src={newPizzaImg} className="w-full h-full object-cover"/> : <ImageIcon size={24} className="opacity-30"/>}
                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"><UploadCloud size={20}/></div>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} disabled={uploading}/>
                                </label>
                                <textarea className={`flex-1 p-0 bg-transparent text-sm leading-relaxed outline-none resize-none h-24 placeholder-opacity-40 ${isDarkMode ? 'placeholder-white' : 'placeholder-black'}`} placeholder="Descripción..." value={newPizzaDesc} onChange={e => setNewPizzaDesc(e.target.value)} />
                            </div>

                            {/* INGREDIENTES SELECTOR */}
                            <div className={`${base.innerCard} p-3 rounded-2xl`}>
                                <div className="flex flex-wrap gap-2 mb-3">
                                     {newPizzaIngredients.map((ing, i) => (
                                         <span key={i} className="text-xs bg-white shadow-sm dark:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold text-black dark:text-white">
                                             {ing.nombre} <span className="opacity-50 text-[10px]">{ing.cantidad}</span> <button onClick={() => removeFromNewPizzaRecipe(i)}><X size={12}/></button>
                                         </span>
                                     ))}
                                </div>
                                <div className="flex gap-2">
                                    <select className={`flex-1 p-2 text-sm rounded-xl font-bold outline-none bg-white dark:bg-black/20 text-black dark:text-white`} value={newPizzaSelectedIng} onChange={e => setNewPizzaSelectedIng(e.target.value)}>
                                        <option value="">+ Ingrediente</option>
                                        {ingredientes.map(i => <option key={i.id} value={`${i.id}|${i.nombre}`}>{i.nombre} (Disp: {i.cantidad_disponible})</option>)}
                                    </select>
                                    <input type="number" className={`w-20 p-2 text-sm rounded-xl text-center font-bold outline-none bg-white dark:bg-black/20 text-black dark:text-white`} value={newPizzaRecipeQty} onChange={e => setNewPizzaRecipeQty(Number(e.target.value) || '')} placeholder="Cant" />
                                    <button onClick={addToNewPizzaRecipe} className="bg-neutral-800 dark:bg-white text-white dark:text-black px-4 rounded-xl text-sm font-bold shadow-sm">OK</button>
                                </div>
                            </div>

                            {/* GRID DE DATOS */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                                <div className={`${base.innerCard} p-3 rounded-2xl flex flex-col items-center justify-center text-center`}>
                                    <span className="text-[10px] uppercase font-bold opacity-50 tracking-wider mb-1">Categoria</span>
                                    <input list="categories" className="w-full text-center font-bold bg-transparent outline-none text-sm" value={newPizzaCat} onChange={e => setNewPizzaCat(e.target.value)} />
                                    <datalist id="categories">{uniqueCategories.map(c => <option key={c} value={c}/>)}</datalist>
                                </div>
                                <div className={`${base.innerCard} p-3 rounded-2xl flex flex-col items-center justify-center text-center`}>
                                    <span className="text-[10px] uppercase font-bold opacity-50 tracking-wider mb-1">Porciones</span>
                                    <input type="number" className="w-full text-center font-bold bg-transparent outline-none text-sm" value={newPizzaPortions} onChange={e => setNewPizzaPortions(Number(e.target.value))} />
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
                    
                    <div className="space-y-4">
                        {pizzas.map((p: any) => {
                        const isEdited = !!edits[p.id];
                        const display = { ...p, ...edits[p.id] }; 
                        const isNewRecipe = !!edits[p.id]?.local_recipe;
                        const currentRecipe = isNewRecipe ? edits[p.id].local_recipe : recetas.filter(r => r.pizza_id === p.id).map(r => ({...r, nombre: ingredientes.find(i => i.id === r.ingrediente_id)?.nombre || '?'}));
                        const dynamicStock = calcularStockDinamico(currentRecipe, ingredientes);

                        return (
                        <div key={p.id} className={`p-5 rounded-3xl border flex flex-col gap-4 relative overflow-hidden transition-all ${base.card} ${isEdited ? 'border-yellow-500/50' : ''}`}>
                            {/* HEADER */}
                            <div className="flex justify-between items-start">
                                <input value={display.nombre} onChange={e => updateP(p.id, 'nombre', e.target.value)} className="bg-transparent font-bold text-2xl outline-none w-full border-b border-transparent focus:border-white/20 pb-1" />
                                <div className="flex gap-2 ml-4">
                                    {isEdited && (
                                        <>
                                            <button onClick={() => savePizzaChanges(p.id)} className="p-2 bg-yellow-500 text-black rounded-xl animate-pulse shadow-lg hover:scale-105 transition-transform"><Save size={18}/></button>
                                            <button onClick={() => cancelChanges(p.id)} className="p-2 bg-red-500 text-white rounded-xl shadow-lg hover:scale-105 transition-transform"><X size={18}/></button>
                                        </>
                                    )}
                                    <button onClick={() => updateP(p.id, 'activa', !p.activa)} className={`p-2 rounded-xl transition-colors ${p.activa ? 'bg-white/10 hover:bg-white/20' : 'bg-black/50 text-neutral-500'}`}>{p.activa ? <Eye size={18}/> : <EyeOff size={18}/>}</button>
                                    <button onClick={() => delP(p.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={18}/></button>
                                </div>
                            </div>

                            {/* BODY */}
                            <div className="flex gap-4">
                                <label className="cursor-pointer relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-900 group flex-shrink-0 shadow-inner">
                                    {display.imagen_url ? <img src={display.imagen_url} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-neutral-600"><ImageIcon size={20}/></div>}
                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"><UploadCloud size={16}/></div>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, p.id)}/>
                                </label>
                                <textarea value={display.descripcion || ''} onChange={e => updateP(p.id, 'descripcion', e.target.value)} className={`flex-1 p-0 bg-transparent text-sm leading-relaxed outline-none resize-none h-20 opacity-80 placeholder-opacity-30 ${isDarkMode ? 'placeholder-white' : 'placeholder-black'}`} placeholder="Descripción..." />
                            </div>
                            
                            {/* RECETAS EN EDICION */}
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
                                    <select className={`flex-1 p-1.5 text-xs rounded-lg font-bold outline-none bg-white dark:bg-black/20 text-black dark:text-white`} value={tempRecipeIng[p.id] || ''} onChange={e => setTempRecipeIng({...tempRecipeIng, [p.id]: e.target.value})}>
                                        <option value="">+ Ingrediente</option>
                                        {ingredientes.map(i => <option key={i.id} value={`${i.id}|${i.nombre}`}>{i.nombre} (Disp: {Math.max(0, i.cantidad_disponible - (reservedState[i.id] || 0))})</option>)}
                                    </select>
                                    <input type="number" placeholder="Cant" className={`w-16 p-1.5 text-xs rounded-lg text-center font-bold outline-none bg-white dark:bg-black/20 text-black dark:text-white`} value={tempRecipeQty[p.id] || ''} onChange={e => setTempRecipeQty({...tempRecipeQty, [p.id]: Number(e.target.value) || ''})} />
                                    <button onClick={() => {
                                        if(!tempRecipeIng[p.id]) return;
                                        const [ingId, name] = tempRecipeIng[p.id].split('|');
                                        addToExistingPizza(p.id, ingId, name, tempRecipeQty[p.id] || 0, currentRecipe);
                                        setTempRecipeIng({...tempRecipeIng, [p.id]: ''}); // Reset select
                                        setTempRecipeQty({...tempRecipeQty, [p.id]: ''});
                                    }} className="bg-neutral-800 dark:bg-white text-white dark:text-black px-3 rounded-lg text-xs font-bold">OK</button>
                                </div>
                            </div>

                            {/* GRID STATS */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className={`${base.innerCard} p-2 rounded-2xl flex flex-col items-center justify-center text-center`}>
                                    <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider mb-1">Categoria</span>
                                    <input list="categories" value={display.categoria || ''} onChange={e => updateP(p.id, 'categoria', e.target.value)} className={`w-full text-center bg-transparent outline-none text-sm font-bold`} />
                                </div>
                                <div className={`${base.innerCard} p-2 rounded-2xl flex flex-col items-center justify-center text-center`}>
                                    <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider mb-1">Porciones</span>
                                    <input type="number" value={display.porciones_individuales || ''} onChange={e => updateP(p.id, 'porciones_individuales', e.target.value ? parseInt(e.target.value) : null)} className={`w-full text-center bg-transparent outline-none text-sm font-bold`} />
                                </div>
                                
                                <div className={`${base.innerCard} p-2 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden text-center`}>
                                    <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider mb-1">Stock</span>
                                    {currentRecipe.length > 0 ? (
                                        <div className="flex items-center gap-1 font-bold text-xl"><Calculator size={14} className="opacity-30"/> {dynamicStock}</div>
                                    ) : (
                                        <input type="number" value={display.stock || 0} onChange={e => updateP(p.id, 'stock', parseInt(e.target.value))} className={`w-full text-center bg-transparent outline-none text-sm font-bold`} />
                                    )}
                                </div>

                                <div className={`${base.innerCard} p-2 rounded-2xl flex flex-col items-center justify-center text-center`}>
                                    <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider mb-1">Timer</span>
                                    <TimeControl value={display.tiempo_coccion || 60} onChange={val => updateP(p.id, 'tiempo_coccion', val)} isDarkMode={isDarkMode} />
                                </div>
                            </div>
                        </div>
                    );})}</div>
                </div>
            )}
            {view === 'ranking' && (
                <div className="space-y-6">
                    <div className={`p-6 rounded-3xl ${base.card} mb-6 shadow-sm flex justify-between items-center`}><h3 className={`font-bold uppercase tracking-widest text-sm ${base.textHead}`}>Ranking & Feedback</h3><button onClick={delAllVal} className="text-[10px] bg-red-900/30 text-red-500 px-3 py-1 rounded-full border border-red-900/50 hover:bg-red-900/50 transition-colors">RESET ALL</button></div>
                    <div className="grid gap-3">{ranking.map((p: any) => (<div key={p.id} className={`p-3 rounded-2xl border flex justify-between items-center ${base.card}`}><div className="flex items-center gap-3"><div className="text-center w-12"><div className="text-xl font-bold text-yellow-500 flex justify-center items-center gap-0.5">{p.avg} <Star size={12} fill="currentColor"/></div><div className={`text-[9px] ${base.subtext}`}>{p.count} votes</div></div><div><div className="font-bold text-sm">{p.nombre}</div><div className={`text-[10px] ${base.subtext}`}>{p.totalOrders} porciones</div></div></div><button onClick={() => delValPizza(p.id)} className="p-2 text-neutral-500 hover:text-red-500 transition-colors" title="Reset item"><RotateCcw size={16} /></button></div>))}</div>
                </div>
            )}
            {view === 'usuarios' && (
                <div className="space-y-6">
                    <div className={`p-6 rounded-3xl border ${base.card}`}><h3 className={`font-bold mb-4 flex items-center gap-2 ${base.subtext}`}><Users size={18}/> Usuarios</h3><div className="flex gap-2"><input className={`w-full p-4 rounded-2xl border outline-none ${base.input}`} placeholder="Nombre..." value={newGuestName} onChange={e => setNewGuestName(e.target.value)} /><button onClick={addU} className={`${currentTheme.color} text-white font-bold px-6 rounded-2xl`}>CREAR</button></div></div>
                    <div className="space-y-2">
                        {allUsersList.map(u => (
                            <div key={u.nombre} className={`p-4 rounded-2xl border flex flex-col gap-2 ${u.bloqueado ? base.blocked : base.card}`}>
                                <div className="flex justify-between items-center"><div className="flex items-center gap-2 flex-1 min-w-0">{u.source === 'db' && u.origen !== 'guest' ? (<UserCheck size={16} className="text-blue-500 flex-shrink-0" />) : (<User size={16} className="text-orange-400 flex-shrink-0" />)}<span className={`font-bold truncate ${u.bloqueado ? 'text-red-500 line-through' : ''}`}>{u.nombre}</span>{u.source === 'ped' && <span className="text-[9px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded border border-orange-500/20 flex-shrink-0">Guest</span>}</div><div className="flex gap-2 items-center flex-shrink-0"><span className="text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-white px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600">{u.totalOrders || 0}</span><button onClick={() => resetU(u.nombre)} className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl hover:bg-yellow-500/20"><RotateCcw size={16}/></button><button onClick={() => toggleB(u)} className={`p-2 rounded-xl ${u.bloqueado ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{u.bloqueado ? <CheckCircle size={16}/> : <Ban size={16}/>}</button><button onClick={() => eliminarUsuario(u.nombre, u.source === 'db' ? u : null)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16}/></button></div></div>
                                {u.bloqueado && (<div className="flex gap-2 mt-2"><input className={`w-full p-2 rounded-lg text-sm outline-none border ${base.input} text-red-400`} placeholder="Motivo..." value={tempMotivos[u.nombre] !== undefined ? tempMotivos[u.nombre] : (u.motivo_bloqueo || '')} onChange={(e) => setTempMotivos({ ...tempMotivos, [u.nombre]: e.target.value })} /><button onClick={() => guardarMotivo(u.nombre, u)} className="p-2 bg-neutral-800 text-white rounded-lg border border-white/10 hover:bg-neutral-700"><Save size={16}/></button></div>)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {view === 'config' && (
              <div className={`p-6 rounded-3xl border space-y-6 ${base.card}`}>
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${base.subtext}`}><Settings size={18}/> Ajustes Globales</h3>
                <div className={`border-b pb-4 ${base.divider}`}><label className={`text-sm font-bold flex items-center gap-2 mb-2 ${base.subtext}`}><Users size={16}/> Total Comensales (Lista)</label><div className="flex gap-2"><input type="number" placeholder="10" value={config.total_invitados || ''} onChange={e => setConfig({...config, total_invitados: parseInt(e.target.value)})} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} /><button onClick={async () => { await supabase.from('configuracion_dia').update({ total_invitados: config.total_invitados }).eq('id', config.id); alert('Guardado'); }} className={`font-bold px-4 rounded-xl ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>OK</button></div></div>
                <div className={`border-b pb-4 ${base.divider}`}>
                    <label className={`text-sm font-bold flex items-center gap-2 mb-2 ${base.subtext}`}><MessageSquare size={16}/> Mensaje Bienvenida</label>
                    <div className="flex gap-2">
                        <textarea 
                            placeholder="Mensaje personalizado..." 
                            value={config.mensaje_bienvenida || ''} 
                            onChange={e => setConfig({...config, mensaje_bienvenida: e.target.value})} 
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
                <div className={`border-b pb-4 ${base.divider}`}><label className={`text-sm font-bold flex items-center gap-2 mb-2 ${base.subtext}`}><Hourglass size={16}/> Minutos Recordatorio Calificación</label><div className="flex gap-2"><input type="number" placeholder="10" value={config.tiempo_recordatorio_minutos || ''} onChange={e => setConfig({...config, tiempo_recordatorio_minutos: parseInt(e.target.value)})} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} /><button onClick={async () => { await supabase.from('configuracion_dia').update({ tiempo_recordatorio_minutos: config.tiempo_recordatorio_minutos }).eq('id', config.id); alert('Guardado'); }} className={`font-bold px-4 rounded-xl ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>OK</button></div></div>
                <div className="flex justify-between items-center"><label className={`text-sm ${base.subtext}`}>Modo Estricto</label><button onClick={async () => { const n = !config.modo_estricto; setConfig({...config, modo_estricto: n}); await supabase.from('configuracion_dia').update({ modo_estricto: n }).eq('id', config.id); }} className={`w-12 h-6 rounded-full transition-colors relative ${config.modo_estricto ? 'bg-green-600' : 'bg-gray-400'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${config.modo_estricto ? 'left-7' : 'left-1'}`}></div></button></div>
                <div className="border-t pt-4 border-gray-200 dark:border-neutral-800"><button onClick={resetAllOrders} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Trash2 size={18}/> RESETEAR TODOS LOS PEDIDOS</button></div>
                <div className={`border-t pt-4 ${base.divider}`}><label className={`text-sm font-bold flex items-center gap-2 mb-2 ${base.subtext}`}><KeyRound size={16}/> Clave Invitados</label><div className="flex gap-2"><input type="text" placeholder="Ej: pizza2024" value={config.password_invitados || ''} onChange={e => setConfig({...config, password_invitados: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} /><button onClick={async () => { await supabase.from('configuracion_dia').update({ password_invitados: config.password_invitados }).eq('id', config.id); alert('Guardado'); }} className={`font-bold px-4 rounded-xl ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>OK</button></div></div>
                <div className={`border-t pt-4 ${base.divider}`}><label className={`text-sm ${base.subtext} mb-2 block`}>Contraseña Admin</label><div className="flex flex-col gap-3"><input type="password" placeholder="Nueva..." value={newPass} onChange={e => setNewPass(e.target.value)} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} /><input type="password" placeholder="Confirmar..." value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} /><button onClick={changePass} className={`w-full ${currentTheme.color} text-white font-bold py-3 rounded-xl`}>GUARDAR</button></div></div>
              </div>
            )}
        </main>
      </div>

      <div className={`fixed bottom-4 left-4 right-4 z-50 rounded-full p-3 flex justify-around items-center ${base.bar}`}>
          <button onClick={() => setView('cocina')} className={`flex flex-col items-center gap-1 ${view === 'cocina' ? currentTheme.text : base.subtext}`}><LayoutDashboard size={20} /><span className="text-[8px] uppercase font-bold">Cocina</span></button>
          <button onClick={() => setView('pedidos')} className={`flex flex-col items-center gap-1 ${view === 'pedidos' ? currentTheme.text : base.subtext}`}><List size={20} /><span className="text-[8px] uppercase font-bold">Pedidos</span></button>
          <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-1 ${view === 'menu' ? currentTheme.text : base.subtext}`}><ChefHat size={20} /><span className="text-[8px] uppercase font-bold">Menú</span></button>
          <button onClick={() => setView('ranking')} className={`flex flex-col items-center gap-1 ${view === 'ranking' ? currentTheme.text : base.subtext}`}><BarChart3 size={20} /><span className="text-[8px] uppercase font-bold">Rank</span></button>
          <button onClick={() => setView('usuarios')} className={`flex flex-col items-center gap-1 ${view === 'usuarios' ? currentTheme.text : base.subtext}`}><Users size={20} /><span className="text-[8px] uppercase font-bold">Usuarios</span></button>
          <button onClick={() => setView('ingredientes')} className={`flex flex-col items-center gap-1 ${view === 'ingredientes' ? currentTheme.text : base.subtext}`}><ShoppingBag size={20} /><span className="text-[8px] uppercase font-bold">Invent.</span></button>
          <button onClick={() => setView('config')} className={`flex flex-col items-center gap-1 ${view === 'config' ? currentTheme.text : base.subtext}`}><Settings size={20} /><span className="text-[8px] uppercase font-bold">Ajustes</span></button>
      </div>
    </div>
  );
}
