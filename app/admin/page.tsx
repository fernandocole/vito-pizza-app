'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, LogOut, LayoutDashboard, List, ChefHat, BarChart3, ShoppingBag, Settings, 
  Palette, Sun, Moon, ArrowUpNarrowWide, ArrowDownAZ, Maximize2, Minimize2, ShieldAlert
} from 'lucide-react';

// Imports de Vistas
import { KitchenView } from '../components/admin/views/KitchenView';
import { OrdersView } from '../components/admin/views/OrdersView';
import { InventoryView } from '../components/admin/views/InventoryView';
import { MenuView } from '../components/admin/views/MenuView';
import { RankingView } from '../components/admin/views/RankingView';
import { UsersView } from '../components/admin/views/UsersView';
import { ConfigView } from '../components/admin/views/ConfigView';
import { LogsView } from '../components/admin/views/LogsView';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- HELPERS (Fuera del componente) ---
const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.readAsDataURL(file);
        reader.onload = (event) => { const img = new Image(); img.src = event.target?.result as string; img.onload = () => { const canvas = document.createElement('canvas'); const MAX_WIDTH = 1600; const MAX_HEIGHT = 1600; let width = img.width; let height = img.height; if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } } canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx?.drawImage(img, 0, 0, width, height); canvas.toBlob((blob) => { if(blob) resolve(blob); else reject(new Error('Canvas error')); }, 'image/jpeg', 0.8); }; }; reader.onerror = (error) => reject(error);
    });
};

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
  const [view, setView] = useState<'cocina' | 'pedidos' | 'menu' | 'ingredientes' | 'usuarios' | 'config' | 'ranking' | 'logs'>('cocina');
    
  // DATOS
  const [pedidos, setPedidos] = useState<any[]>([]); 
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [recetas, setRecetas] = useState<any[]>([]);
  const [reservedState, setReservedState] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<any[]>([]);
    
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
  const [newPizzaPortions, setNewPizzaPortions] = useState(4); 
  const [newPizzaType, setNewPizzaType] = useState<'pizza' | 'burger' | 'other'>('pizza');
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

  // --- EFECTOS ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('vito-theme');
    if (savedTheme) setCurrentTheme(THEMES.find(t => t.name === savedTheme) || THEMES[0]);
    const savedMode = localStorage.getItem('vito-dark-mode');
    if (savedMode !== null) setIsDarkMode(savedMode === 'true');
    const savedOrden = localStorage.getItem('vito-orden');
    if (savedOrden) setOrden(savedOrden as any);
    const savedCompact = localStorage.getItem('vito-compact');
    if (savedCompact) setIsCompact(savedCompact === 'true');

    if (autenticado) {
      cargarDatos();
      const channel = supabase.channel('admin-realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => cargarDatos()).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [autenticado]);

  useEffect(() => {
    if (autenticado && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(() => {
                console.log('Admin SW registered');
                Notification.requestPermission();
            })
            .catch(err => console.log('Admin SW failed', err));
    }
  }, [autenticado]);

  useEffect(() => {
    if (!autenticado) return;
    const presenceChannel = supabase.channel('online-users', { config: { presence: { key: 'admin' }, }, });
    presenceChannel.on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const allPresences = Object.values(state).flat() as any[];
        const count = allPresences.filter((p: any) => p.role === 'guest').length;
        setOnlineUsers(count);
    }).subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
            await presenceChannel.track({ online_at: new Date().toISOString(), role: 'admin' });
        }
    });
    return () => { supabase.removeChannel(presenceChannel); };
  }, [autenticado]);

  // --- MEMOS DE BASE (Requeridos por funciones) ---
  const stockEstimadoNueva = useMemo(() => { return calcularStockDinamico(newPizzaIngredients, ingredientes); }, [newPizzaIngredients, ingredientes]);
  
  const activeCategories: string[] = useMemo(() => { 
      try { 
          const parsed = JSON.parse(config.categoria_activa); 
          if (parsed === 'Todas' || (Array.isArray(parsed) && parsed.length === 0)) return []; 
          return Array.isArray(parsed) ? parsed : ['General']; 
      } catch { return ['General']; } 
  }, [config.categoria_activa]);

  const uniqueCategories = useMemo(() => { 
      const cats = new Set<string>(); 
      pizzas.forEach(p => { if(p.categoria) cats.add(p.categoria.trim()); }); 
      return Array.from(cats).sort(); 
  }, [pizzas]);

  // --- FUNCIONES Y ACCIONES (Definidas antes de usarse) ---
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

  const refreshLogsOnly = async () => {
      const { data } = await supabase.from('access_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (data) setLogs(data);
  };

  const sendAdminNotification = async (title: string, body: string) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        try {
            const registration = await navigator.serviceWorker.ready;
            registration.showNotification(title, {
                body: body,
                icon: '/icon.png',
                badge: '/icon.png',
                vibrate: [200, 100, 200]
            } as any);
            return;
        } catch (e) { console.log("SW notification failed"); }
    }
    if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon.png' });
    }
  };

  const handleLocalEdit = (id: string, field: string, value: any) => { setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } })); };
  const updateLocalRecipe = (pizzaId: string, newRecipeList: any[]) => { handleLocalEdit(pizzaId, 'local_recipe', newRecipeList); };
  
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
          if(pizzaId) handleLocalEdit(pizzaId, 'imagen_url', data.publicUrl); 
          else setNewPizzaImg(data.publicUrl); 
      } catch (error: any) { alert('Error: ' + error.message); } finally { setUploading(false); } 
  };

  const actualizarStockGlobal = async () => {
      const now = new Date(); if (now.getHours() < 6) now.setDate(now.getDate() - 1); now.setHours(6, 0, 0, 0); const iso = now.toISOString();
      const [ { data: allRecetas }, { data: allIngs }, { data: allPizzas }, { data: allPendientes }, { data: configDia } ] = await Promise.all([ supabase.from('recetas').select('*'), supabase.from('ingredientes').select('*'), supabase.from('menu_pizzas').select('*'), supabase.from('pedidos').select('*').eq('estado', 'pendiente').gte('created_at', iso), supabase.from('configuracion_dia').select('*').single() ]);
      if(!allRecetas || !allIngs || !allPizzas || !allPendientes || !configDia) return;
      const porcionesDefault = configDia.porciones_por_pizza || 8;
      const reservedStock: Record<string, number> = {};
      allPendientes.forEach((pedido: any) => { const pizza = allPizzas.find((p:any) => p.id === pedido.pizza_id); const porcionesEntera = pizza?.porciones_individuales || porcionesDefault; const fraccion = pedido.cantidad_porciones / porcionesEntera; const recetaPizza = allRecetas.filter((r: any) => r.pizza_id === pedido.pizza_id); recetaPizza.forEach((item: any) => { const cantidadNecesaria = item.cantidad_requerida * fraccion; reservedStock[item.ingrediente_id] = (reservedStock[item.ingrediente_id] || 0) + cantidadNecesaria; }); }); setReservedState(reservedStock);
      const updates = allPizzas.map(async (p) => { const pRecetas = allRecetas.filter((r: any) => r.pizza_id === p.id); let stockVirtual = 999; if (pRecetas.length > 0) { let minPizzasPosibles = Infinity; pRecetas.forEach((item: any) => { const ing = allIngs.find((i: any) => i.id === item.ingrediente_id); if (ing) { const fisico = ing.cantidad_disponible || 0; const reservado = reservedStock[ing.id] || 0; const disponibleReal = Math.max(0, fisico - reservado); const posibles = item.cantidad_requerida > 0 ? Math.floor(disponibleReal / item.cantidad_requerida) : 999; if (posibles < minPizzasPosibles) minPizzasPosibles = posibles; } else { minPizzasPosibles = 0; } }); stockVirtual = minPizzasPosibles === Infinity ? 0 : minPizzasPosibles; } else { stockVirtual = 0; } if (p.stock !== stockVirtual) { await supabase.from('menu_pizzas').update({ stock: stockVirtual }).eq('id', p.id); } }); await Promise.all(updates); const { data: refreshedPizzas } = await supabase.from('menu_pizzas').select('*').order('created_at', { ascending: true }); if(refreshedPizzas) setPizzas(refreshedPizzas);
  };

  const cargarDatos = async () => {
    const now = new Date(); if (now.getHours() < 6) now.setDate(now.getDate() - 1); now.setHours(6, 0, 0, 0); const iso = now.toISOString();
    const [piz, ing, rec, ped, inv, conf, val, logsData] = await Promise.all([
        supabase.from('menu_pizzas').select('*').order('created_at', { ascending: true }),
        supabase.from('ingredientes').select('*').order('nombre'),
        supabase.from('recetas').select('*'),
        supabase.from('pedidos').select('*').gte('created_at', iso).order('created_at', { ascending: true }),
        supabase.from('lista_invitados').select('*').order('nombre'),
        supabase.from('configuracion_dia').select('*').single(),
        supabase.from('valoraciones').select('*').gte('created_at', iso).order('created_at', { ascending: false }),
        supabase.from('access_logs').select('*').order('created_at', { ascending: false }).limit(100)
    ]);
    if(piz.data) setPizzas(piz.data);
    if(ing.data) setIngredientes(ing.data);
    if(rec.data) setRecetas(rec.data);
    if(ped.data) {
        setPedidos(ped.data); 
        setInvitadosCount(new Set(ped.data.map((p: any) => p.invitado_nombre.toLowerCase())).size); 
        if (prevPedidosCount.current > 0 && ped.data.length > prevPedidosCount.current) {
            const diff = ped.data.length - prevPedidosCount.current;
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{}); 
            sendAdminNotification("¡Nuevos Pedidos!", `Han entrado ${diff} pedidos nuevos.`);
        }
        prevPedidosCount.current = ped.data.length;
    }
    if(inv.data) setInvitadosDB(inv.data);
    if(conf.data) setConfig(conf.data);
    if(val.data) setValoraciones(val.data);
    if(logsData.data) setLogs(logsData.data);
    if(piz.data && ing.data && rec.data && ped.data) {
        actualizarStockGlobal();
    }
  };

  const toggleCategory = async (cat: string) => { 
      const current = new Set(activeCategories); 
      if (current.has(cat)) current.delete(cat); 
      else current.add(cat); 
      const newArr = Array.from(current); 
      setConfig({...config, categoria_activa: JSON.stringify(newArr)}); 
      await supabase.from('configuracion_dia').update({ categoria_activa: JSON.stringify(newArr) }).eq('id', config.id); 
  };
  
  const updateLogName = async (id: string, newName: string) => { await supabase.from('access_logs').update({ invitado_nombre: newName, is_manual_edit: true }).eq('id', id); refreshLogsOnly(); };
  const eliminarUsuario = async (nombre: string, userDB: any) => { if(!confirm(`¿ELIMINAR a ${nombre}?`)) return; await supabase.from('pedidos').delete().eq('invitado_nombre', nombre); if(userDB?.id) { await supabase.from('lista_invitados').delete().eq('id', userDB.id); } cargarDatos(); };
  const eliminarPedidosGusto = async (nom: string, pid: string) => { if(confirm(`¿Borrar pendientes?`)) { const ids = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nom.toLowerCase() && p.pizza_id === pid && p.estado === 'pendiente').map(p => p.id); if(ids.length) await supabase.from('pedidos').delete().in('id', ids); cargarDatos(); } };
  const entregar = async (p: any) => { if(!confirm(`¿Salió ${p.nombre}?`)) return; let n = p.target; const ids=[]; for(const pd of p.pedidosPendientes){ if(n<=0) break; ids.push(pd.id); n-=pd.cantidad_porciones; } if(ids.length) { await supabase.from('pedidos').update({ estado: 'entregado' }).in('id', ids); await supabase.from('menu_pizzas').update({ cocinando: false, cocinando_inicio: null }).eq('id', p.id); cargarDatos(); } };
  const updateP = async (id: string, field: string, val: any) => { if (field === 'activa') { await supabase.from('menu_pizzas').update({ activa: val }).eq('id', id); setPizzas(prev => prev.map(p => p.id === id ? { ...p, activa: val } : p)); } else { handleLocalEdit(id, field, val); } };
  
  const addP = async () => { if(!newPizzaName) return; const { data: pizzaData } = await supabase.from('menu_pizzas').insert([{ nombre: newPizzaName, descripcion: newPizzaDesc, stock: 0, imagen_url: newPizzaImg, tiempo_coccion: newPizzaTime, categoria: newPizzaCat, activa: true, porciones_individuales: newPizzaPortions, tipo: newPizzaType }]).select().single(); if(pizzaData && newPizzaIngredients.length > 0) { const rows = newPizzaIngredients.map(r => ({ pizza_id: pizzaData.id, ingrediente_id: r.ingrediente_id, cantidad_requerida: r.cantidad })); await supabase.from('recetas').insert(rows); } setNewPizzaName(''); setNewPizzaDesc(''); setNewPizzaImg(''); setNewPizzaIngredients([]); await actualizarStockGlobal(); };
  const delP = async (id: string) => { if(!confirm('¿Estás seguro?')) return; await supabase.from('recetas').delete().eq('pizza_id', id); const { error } = await supabase.from('menu_pizzas').delete().eq('id', id); if (error) { if (confirm("⛔ Tiene historial. ¿Borrar TODO?")) { await supabase.from('pedidos').delete().eq('pizza_id', id); await supabase.from('valoraciones').delete().eq('pizza_id', id); const { error: err2 } = await supabase.from('menu_pizzas').delete().eq('id', id); if(err2) alert("Error"); else cargarDatos(); } } else { cargarDatos(); } };
  const changePass = async () => { if(!newPass) return; await supabase.from('configuracion_dia').update({password_admin: newPass}).eq('id', config.id); alert('OK'); setNewPass(''); };
  const addU = async () => { if(!newGuestName) return; const { error } = await supabase.from('lista_invitados').insert([{ nombre: newGuestName }]); if(error) alert('Error'); else { setNewGuestName(''); cargarDatos(); } };
  const toggleB = async (u: any) => { let uid = u.id; if(!uid) { const { data } = await supabase.from('lista_invitados').insert([{ nombre: u.nombre }]).select().single(); if(data) uid = data.id; else return; } await supabase.from('lista_invitados').update({ bloqueado: !u.bloqueado }).eq('id', uid); cargarDatos(); };
  const guardarMotivo = async (nombre: string, u: any) => { const motivo = tempMotivos[nombre]; if (motivo === undefined) return; let uid = u?.id; if (!uid) { const { data, error } = await supabase.from('lista_invitados').insert([{ nombre: nombre, motivo_bloqueo: motivo, bloqueado: true }]).select().single(); if (error || !data) { alert("Error"); return; } } else { await supabase.from('lista_invitados').update({ motivo_bloqueo: motivo }).eq('id', uid); } alert("OK"); cargarDatos(); };
  const resetU = async (nom: string) => { if(!confirm(`¿Reset?`)) return; const ids = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nom.toLowerCase()).map(p => p.id); if(ids.length) await supabase.from('pedidos').delete().in('id', ids); cargarDatos(); };
  const resetAllOrders = async () => { const promptText = prompt('Escribe "BORRAR TODO"'); if (promptText?.toUpperCase() !== "BORRAR TODO") return; const { error } = await supabase.from('pedidos').delete().neq('id', '00000000-0000-0000-0000-000000000000'); if(!error) { alert("OK"); cargarDatos(); } };
  const delVal = async (id: string) => { if(confirm("¿Borrar?")) { await supabase.from('valoraciones').delete().eq('id', id); cargarDatos(); } };
  const delValPizza = async (pid: string) => { if(confirm("¿Borrar todas?")) { await supabase.from('valoraciones').delete().eq('pizza_id', pid); cargarDatos(); } };
  const delAllVal = async () => { if(prompt("BORRAR") === 'BORRAR') { const { data } = await supabase.from('valoraciones').select('id'); const ids = data?.map(v => v.id) || []; if(ids.length) await supabase.from('valoraciones').delete().in('id', ids); cargarDatos(); } };
  const addIng = async () => { if(!newIngName) return; const qtyNum = newIngQty === '' ? 0 : Number(newIngQty); const existing = ingredientes.find(i => i.nombre.toLowerCase() === newIngName.toLowerCase()); if (existing) { await supabase.from('ingredientes').update({ cantidad_disponible: existing.cantidad_disponible + qtyNum }).eq('id', existing.id); } else { await supabase.from('ingredientes').insert([{ nombre: newIngName, cantidad_disponible: qtyNum, unidad: newIngUnit }]); } setNewIngName(''); setNewIngQty(''); await actualizarStockGlobal(); cargarDatos(); };
  const startEditIng = (ing: any) => { setEditingIngId(ing.id); setEditIngForm({ nombre: ing.nombre, cantidad: ing.cantidad_disponible, unidad: ing.unidad || 'g' }); };
  const cancelEditIng = () => { setEditingIngId(null); };
  const saveEditIng = async (id: string) => { const qty = Number(editIngForm.cantidad); await supabase.from('ingredientes').update({ nombre: editIngForm.nombre, cantidad_disponible: qty, unidad: editIngForm.unidad }).eq('id', id); setEditingIngId(null); await actualizarStockGlobal(); cargarDatos(); };
  const delIng = async (id: string) => { if(confirm('¿Borrar?')) await supabase.from('ingredientes').delete().eq('id', id); await actualizarStockGlobal(); cargarDatos(); };
  const addToNewPizzaRecipe = () => { if(!newPizzaSelectedIng) return; const [ingId, name] = newPizzaSelectedIng.split('|'); const qty = Number(newPizzaRecipeQty); if(qty <= 0) return; setNewPizzaIngredients(prev => [...prev, { ingrediente_id: ingId, nombre: name, cantidad: qty }]); setNewPizzaSelectedIng(''); setNewPizzaRecipeQty(1); };
  const removeFromNewPizzaRecipe = (idx: number) => { setNewPizzaIngredients(prev => prev.filter((_, i) => i !== idx)); };
  const addToExistingPizza = (pizzaId: string, ingId: string, name: string, qty: any, currentRecipe: any[]) => { const q = Number(qty); if(q <= 0) return; const newRecipe = [...currentRecipe, { ingrediente_id: ingId, cantidad_requerida: q, nombre: name }]; updateLocalRecipe(pizzaId, newRecipe); };
  const removeFromExistingPizza = (pizzaId: string, idx: number, currentRecipe: any[]) => { const newRecipe = currentRecipe.filter((_, i) => i !== idx); updateLocalRecipe(pizzaId, newRecipe); };
  const savePizzaChanges = async (id: string) => { const changes = edits[id]; if (!changes) return; const { local_recipe, ...pizzaFields } = changes; if (Object.keys(pizzaFields).length > 0) { await supabase.from('menu_pizzas').update(pizzaFields).eq('id', id); } if (local_recipe) { await supabase.from('recetas').delete().eq('pizza_id', id); if (local_recipe.length > 0) { const rows = local_recipe.map((r: any) => ({ pizza_id: id, ingrediente_id: r.ingrediente_id, cantidad_requerida: r.cantidad_requerida })); await supabase.from('recetas').insert(rows); } } await cargarDatos(); await actualizarStockGlobal(); setEdits(prev => { const newEdits = { ...prev }; delete newEdits[id]; return newEdits; }); };
  const cancelChanges = (id: string) => { setEdits(prev => { const newEdits = { ...prev }; delete newEdits[id]; return newEdits; }); };
  const toggleCocinando = async (p: any) => { if(p.tipo === 'pizza' && !p.cocinando && p.totalPendientes < p.target) { alert("Falta para 1 entera"); return; } const newState = !p.cocinando; const startTime = newState ? new Date().toISOString() : null; if (newState) { const receta = recetas.filter(r => r.pizza_id === p.id); if(receta.length > 0) { for (const item of receta) { const ing = ingredientes.find(i => i.id === item.ingrediente_id); if (ing) { const nuevaCant = ing.cantidad_disponible - item.cantidad_requerida; await supabase.from('ingredientes').update({ cantidad_disponible: nuevaCant }).eq('id', ing.id); } } } } else { const receta = recetas.filter(r => r.pizza_id === p.id); if(receta.length > 0) { for (const item of receta) { const ing = ingredientes.find(i => i.id === item.ingrediente_id); if (ing) { const nuevaCant = ing.cantidad_disponible + item.cantidad_requerida; await supabase.from('ingredientes').update({ cantidad_disponible: nuevaCant }).eq('id', ing.id); } } } } await supabase.from('menu_pizzas').update({ cocinando: newState, cocinando_inicio: startTime }).eq('id', p.id); await actualizarStockGlobal(); const { data: ings } = await supabase.from('ingredientes').select('*').order('nombre'); if(ings) setIngredientes(ings); };
  
  // --- MEMOS DERIVADOS (Dependen de las funciones anteriores y estado) ---
  const metricas = useMemo(() => { 
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
  }, [pizzas, pedidos, config, orden, activeCategories]); // activeCategories ya está definido arriba

  const stats = useMemo(() => { const totalPendientes = metricas.reduce((acc, m) => acc + m.totalPendientes, 0); const pizzasIncompletas = metricas.filter(m => m.faltan < m.target && m.totalPendientes > 0).length; let totalPizzasEntregadas = 0; pizzas.forEach(pz => { const porc = pedidos.filter(p => p.pizza_id === pz.id && p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0); const t = pz.porciones_individuales || config.porciones_por_pizza; totalPizzasEntregadas += Math.floor(porc / t); }); const totalStock = pizzas.reduce((acc, p) => acc + ((p.stock || 0) * (p.porciones_individuales || config.porciones_por_pizza)), 0); return { totalPendientes, pizzasIncompletas, totalPizzasEntregadas, totalStockPorciones: totalStock }; }, [metricas, pizzas, pedidos, config]);
  const pedidosAgrupados = Array.from(new Set(pedidos.map(p => p.invitado_nombre.toLowerCase()))).map(nombre => { const susPedidos = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre); const nombreReal = susPedidos[0]?.invitado_nombre || nombre; const detalle = pizzas.map(pz => { const ped = susPedidos.filter(p => p.pizza_id === pz.id); if (ped.length === 0) return null; const entr = ped.filter(p => p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0); const pendientesArr = ped.filter(p => p.estado === 'pendiente'); const pend = pendientesArr.reduce((acc, c) => acc + c.cantidad_porciones, 0); const oldestPending = pendientesArr.length > 0 ? pendientesArr.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0].created_at : null; return { id: pz.id, nombre: pz.nombre, entregada: entr, enHorno: pz.cocinando ? pend : 0, enEspera: pz.cocinando ? 0 : pend, oldestPending: oldestPending }; }).filter(Boolean); const totalEnHorno = detalle.reduce((acc, d) => acc + (d?.enHorno || 0), 0); const totalEnEspera = detalle.reduce((acc, d) => acc + (d?.enEspera || 0), 0); const totalPendienteGeneral = totalEnHorno + totalEnEspera; return { nombre: nombreReal, detalle, totalPendienteGeneral, totalEnHorno, totalEnEspera }; }).sort((a, b) => b.totalPendienteGeneral - a.totalPendienteGeneral);
  const ranking = useMemo(() => { return pizzas.map(p => { const vals = valoraciones.filter(v => v.pizza_id === p.id); const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b.rating, 0) / vals.length) : 0; const orders = pedidos.filter(ped => ped.pizza_id === p.id).reduce((acc, c) => acc + c.cantidad_porciones, 0); return { ...p, avg: parseFloat(avg.toFixed(1)), count: vals.length, totalOrders: orders }; }).sort((a, b) => b.avg - a.avg); }, [pizzas, valoraciones, pedidos]);
  const allUsersList = useMemo(() => { const map = new Map(); invitadosDB.forEach(u => map.set(u.nombre.toLowerCase(), { ...u, source: 'db', origen: u.origen || 'admin' })); pedidos.forEach(p => {  const key = p.invitado_nombre.toLowerCase(); if (!map.has(key)) map.set(key, { id: null, nombre: p.invitado_nombre, bloqueado: false, source: 'ped', totalOrders: p.cantidad_porciones });  else { const existing = map.get(key); map.set(key, { ...existing, totalOrders: (existing.totalOrders || 0) + p.cantidad_porciones }); } }); invitadosDB.forEach(u => { const key = u.nombre.toLowerCase(); if(map.has(key)) { const existing = map.get(key); map.set(key, { ...existing, source: 'db', id: u.id, origen: u.origen || 'admin' }); }}); return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre)); }, [invitadosDB, pedidos]);

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
            {view === 'cocina' && <KitchenView metricas={metricas} base={base} isCompact={isCompact} isDarkMode={isDarkMode} currentTheme={currentTheme} toggleCocinando={toggleCocinando} entregar={entregar} />}
            {view === 'pedidos' && <OrdersView pedidosAgrupados={pedidosAgrupados} base={base} isDarkMode={isDarkMode} eliminarPedidosGusto={eliminarPedidosGusto} />}
            {view === 'ingredientes' && <InventoryView base={base} currentTheme={currentTheme} ingredients={ingredientes} newIngName={newIngName} setNewIngName={setNewIngName} newIngQty={newIngQty} setNewIngQty={setNewIngQty} newIngUnit={newIngUnit} setNewIngUnit={setNewIngUnit} addIng={addIng} editingIngId={editingIngId} editIngForm={editIngForm} setEditIngForm={setEditIngForm} saveEditIng={saveEditIng} cancelEditIng={cancelEditIng} delIng={delIng} startEditIng={startEditIng} reservedState={reservedState} />}
            {view === 'menu' && <MenuView base={base} config={config} setConfig={setConfig} activeCategories={activeCategories} uniqueCategories={uniqueCategories} toggleCategory={toggleCategory} currentTheme={currentTheme} addP={addP} uploading={uploading} newPizzaName={newPizzaName} setNewPizzaName={setNewPizzaName} isDarkMode={isDarkMode} handleImageUpload={handleImageUpload} newPizzaImg={newPizzaImg} newPizzaDesc={newPizzaDesc} setNewPizzaDesc={setNewPizzaDesc} newPizzaIngredients={newPizzaIngredients} removeFromNewPizzaRecipe={removeFromNewPizzaRecipe} newPizzaSelectedIng={newPizzaSelectedIng} setNewPizzaSelectedIng={setNewPizzaSelectedIng} ingredients={ingredientes} newPizzaRecipeQty={newPizzaRecipeQty} setNewPizzaRecipeQty={setNewPizzaRecipeQty} addToNewPizzaRecipe={addToNewPizzaRecipe} newPizzaCat={newPizzaCat} setNewPizzaCat={setNewPizzaCat} newPizzaPortions={newPizzaPortions} setNewPizzaPortions={setNewPizzaPortions} stockEstimadoNueva={stockEstimadoNueva} newPizzaTime={newPizzaTime} setNewPizzaTime={setNewPizzaTime} pizzas={pizzas} edits={edits} recetas={recetas} updateP={updateP} savePizzaChanges={savePizzaChanges} cancelChanges={cancelChanges} delP={delP} tempRecipeIng={tempRecipeIng} setTempRecipeIng={setTempRecipeIng} tempRecipeQty={tempRecipeQty} setTempRecipeQty={setTempRecipeQty} addToExistingPizza={addToExistingPizza} removeFromExistingPizza={removeFromExistingPizza} reservedState={reservedState} calcularStockDinamico={calcularStockDinamico} updateLocalRecipe={updateLocalRecipe} newPizzaType={newPizzaType} setNewPizzaType={setNewPizzaType} />}
            {view === 'ranking' && <RankingView base={base} delAllVal={delAllVal} ranking={ranking} delValPizza={delValPizza} />}
            {view === 'usuarios' && <UsersView base={base} newGuestName={newGuestName} setNewGuestName={setNewGuestName} addU={addU} allUsersList={allUsersList} resetU={resetU} toggleB={toggleB} eliminarUsuario={eliminarUsuario} tempMotivos={tempMotivos} setTempMotivos={setTempMotivos} guardarMotivo={guardarMotivo} currentTheme={currentTheme} />}
            {view === 'config' && <ConfigView base={base} config={config} setConfig={setConfig} isDarkMode={isDarkMode} resetAllOrders={resetAllOrders} newPass={newPass} setNewPass={setNewPass} confirmPass={confirmPass} setConfirmPass={setConfirmPass} changePass={changePass} currentTheme={currentTheme} />}
            {view === 'logs' && <LogsView base={base} logs={logs} isDarkMode={isDarkMode} currentTheme={currentTheme} updateLogName={updateLogName} onRefresh={refreshLogsOnly} />}
        </main>
      </div>

      <div className={`fixed bottom-4 left-4 right-4 z-50 rounded-full p-3 flex justify-around items-center ${base.bar}`}>
          <button onClick={() => setView('cocina')} className={`flex flex-col items-center gap-1 ${view === 'cocina' ? currentTheme.text : base.subtext}`}><LayoutDashboard size={20} /><span className="text-[8px] uppercase font-bold">Cocina</span></button>
          <button onClick={() => setView('pedidos')} className={`flex flex-col items-center gap-1 ${view === 'pedidos' ? currentTheme.text : base.subtext}`}><List size={20} /><span className="text-[8px] uppercase font-bold">Pedidos</span></button>
          <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-1 ${view === 'menu' ? currentTheme.text : base.subtext}`}><ChefHat size={20} /><span className="text-[8px] uppercase font-bold">Menú</span></button>
          <button onClick={() => setView('ranking')} className={`flex flex-col items-center gap-1 ${view === 'ranking' ? currentTheme.text : base.subtext}`}><BarChart3 size={20} /><span className="text-[8px] uppercase font-bold">Rank</span></button>
          <button onClick={() => setView('usuarios')} className={`flex flex-col items-center gap-1 ${view === 'usuarios' ? currentTheme.text : base.subtext}`}><Users size={20} /><span className="text-[8px] uppercase font-bold">Usuarios</span></button>
          <button onClick={() => setView('ingredientes')} className={`flex flex-col items-center gap-1 ${view === 'ingredientes' ? currentTheme.text : base.subtext}`}><ShoppingBag size={20} /><span className="text-[8px] uppercase font-bold">Invent.</span></button>
          <button onClick={() => setView('logs')} className={`flex flex-col items-center gap-1 ${view === 'logs' ? currentTheme.text : base.subtext}`}><ShieldAlert size={20} /><span className="text-[8px] uppercase font-bold">Logs</span></button>
          <button onClick={() => setView('config')} className={`flex flex-col items-center gap-1 ${view === 'config' ? currentTheme.text : base.subtext}`}><Settings size={20} /><span className="text-[8px] uppercase font-bold">Ajustes</span></button>
      </div>
    </div>
  );
}