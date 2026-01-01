'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, LogOut, LayoutDashboard, List, ChefHat, BarChart3, ShoppingBag, Settings, 
  Palette, Sun, Moon, ArrowUpNarrowWide, ArrowDownAZ, Maximize2, Minimize2, ShieldAlert,
  Flame, Clock, CheckCircle, Hourglass, Eye, EyeOff, X, Layers, Trash2, Plus, Copy
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

// --- HELPERS ---
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
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'cocina' | 'pedidos' | 'menu' | 'ingredientes' | 'usuarios' | 'config' | 'ranking' | 'logs'>('cocina');
  const [sessionDuration, setSessionDuration] = useState(24 * 60 * 60 * 1000); 

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
  const [onlineGuestList, setOnlineGuestList] = useState<string[]>([]);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
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
    
  // RECETAS & INVENTARIO
  const [newPizzaIngredients, setNewPizzaIngredients] = useState<{ingrediente_id: string, nombre: string, cantidad: number}[]>([]);
  const [newPizzaSelectedIng, setNewPizzaSelectedIng] = useState('');
  const [newPizzaRecipeQty, setNewPizzaRecipeQty] = useState<string | number>('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMode, setBulkMode] = useState<'SET' | 'REMOVE'>('SET');
  const [bulkIngId, setBulkIngId] = useState('');
  const [bulkQty, setBulkQty] = useState<string | number>('');
  const [bulkSelectedPizzas, setBulkSelectedPizzas] = useState<string[]>([]);
  const [newIngName, setNewIngName] = useState('');
  const [newIngQty, setNewIngQty] = useState<string | number>('');
  const [newIngUnit, setNewIngUnit] = useState('g');
  const [newIngCat, setNewIngCat] = useState('General');
  const [editingIngId, setEditingIngId] = useState<string | null>(null);
  const [editIngForm, setEditIngForm] = useState<{nombre: string, cantidad: number | string, unidad: string, categoria: string}>({nombre:'', cantidad:0, unidad:'g', categoria: 'General'});
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

  const base = isDarkMode ? { bg: "bg-neutral-950 text-white", card: "bg-neutral-900 border-neutral-800", input: "bg-black border-neutral-700 text-white placeholder-neutral-600", header: "bg-neutral-900/90 border-neutral-800", subtext: "text-neutral-500", textHead: "text-neutral-300", buttonSec: "bg-neutral-800 text-neutral-400 hover:text-white border-white/10", buttonIcon: "bg-neutral-800 text-neutral-400 hover:text-white", divider: "border-neutral-800", metric: "bg-neutral-900 border-neutral-800", blocked: "bg-red-900/10 border-red-900/30", bar: "bg-neutral-900/50 backdrop-blur-md border-white/10 shadow-lg text-white border", innerCard: "bg-neutral-800 border-neutral-700 text-white", uploadBox: "bg-neutral-800 border-neutral-600 hover:bg-neutral-700" } : { bg: "bg-gray-100 text-gray-900", card: "bg-white border-gray-200 shadow-sm", input: "bg-white border-gray-300 text-gray-900 placeholder-gray-400", header: "bg-white/90 border-gray-200", subtext: "text-gray-500", textHead: "text-gray-800", buttonSec: "bg-white text-gray-600 hover:text-black border-gray-300", buttonIcon: "bg-gray-200 text-gray-600 hover:text-black", divider: "border-gray-200", metric: "bg-white border-gray-200 shadow-sm", blocked: "bg-red-50 border-red-200", bar: "bg-white/50 backdrop-blur-md border-gray-300 shadow-lg text-gray-900 border", innerCard: "bg-neutral-100 border-neutral-200 text-gray-900", uploadBox: "bg-neutral-100 border-neutral-300 hover:bg-neutral-200" };

  useEffect(() => { const session = localStorage.getItem('vito-admin-session'); if (session) { try { const parsed = JSON.parse(session); if (Date.now() < parsed.expiry) setAutenticado(true); else localStorage.removeItem('vito-admin-session'); } catch (e) { localStorage.removeItem('vito-admin-session'); } } }, []);
  useEffect(() => { if (autenticado) { cargarDatos(); const channel = supabase.channel('admin-realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => cargarDatos()).subscribe(); return () => { supabase.removeChannel(channel); }; } }, [autenticado]);
  useEffect(() => { if (autenticado && 'serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').then((registration) => { registration.update(); Notification.requestPermission(); }).catch(err => console.log('Admin SW failed', err)); } }, [autenticado]);
  useEffect(() => { if (!autenticado) return; const presenceChannel = supabase.channel('online-users', { config: { presence: { key: 'admin' }, }, }); presenceChannel.on('presence', { event: 'sync' }, () => { const state = presenceChannel.presenceState(); const allPresences = Object.values(state).flat() as any[]; const guests = allPresences.filter((p: any) => p.role === 'guest'); setOnlineUsers(guests.length); setOnlineGuestList(guests.map((g: any) => g.name || 'Invitado sin nombre').filter((n: string) => n)); }).subscribe(async (status) => { if (status === 'SUBSCRIBED') await presenceChannel.track({ online_at: new Date().toISOString(), role: 'admin' }); }); return () => { supabase.removeChannel(presenceChannel); }; }, [autenticado]);

  const stockEstimadoNueva = useMemo(() => calcularStockDinamico(newPizzaIngredients, ingredientes), [newPizzaIngredients, ingredientes]);
  const activeCategories: string[] = useMemo(() => { try { const parsed = JSON.parse(config.categoria_activa); if (parsed === 'Todas' || (Array.isArray(parsed) && parsed.length === 0)) return []; return Array.isArray(parsed) ? parsed : ['General']; } catch { return ['General']; } }, [config.categoria_activa]);
  const uniqueCategories = useMemo(() => { const cats = new Set<string>(); pizzas.forEach(p => { if(p.categoria) cats.add(p.categoria.trim()); }); return Array.from(cats).sort(); }, [pizzas]);

  const toggleDarkMode = () => { setIsDarkMode(!isDarkMode); localStorage.setItem('vito-dark-mode', String(!isDarkMode)); };
  const toggleOrden = () => { const n = orden === 'estado' ? 'nombre' : 'estado'; setOrden(n); localStorage.setItem('vito-orden', n); };
  const toggleCompact = () => { setIsCompact(!isCompact); localStorage.setItem('vito-compact', String(!isCompact)); };
  const selectTheme = (t: any) => { setCurrentTheme(t); localStorage.setItem('vito-theme', t.name); setShowThemeSelector(false); window.dispatchEvent(new Event('storage')); };

  const ingresar = async (e?: React.FormEvent) => { if (e) e.preventDefault(); let { data } = await supabase.from('configuracion_dia').select('*').single(); if (!data) { const { data: n } = await supabase.from('configuracion_dia').insert([{ password_admin: 'admin' }]).select().single(); data = n; } if (data && data.password_admin === password) { setAutenticado(true); setConfig(data); const expiry = Date.now() + sessionDuration; localStorage.setItem('vito-admin-session', JSON.stringify({ expiry })); cargarDatos(); } else alert('Incorrecto'); };
  const logout = () => { localStorage.removeItem('vito-admin-session'); window.location.href = '/'; };
  const refreshLogsOnly = async () => { const { data } = await supabase.from('access_logs').select('*').order('created_at', { ascending: false }).limit(100); if (data) setLogs(data); };
  const sendAdminNotification = async (title: string, body: string) => { if ('serviceWorker' in navigator && navigator.serviceWorker.ready) { try { const registration = await navigator.serviceWorker.ready; registration.showNotification(title, { body, icon: '/icon.png' } as any); return; } catch (e) {} } if (Notification.permission === 'granted') new Notification(title, { body, icon: '/icon.png' }); };

  const handleLocalEdit = (id: string, field: string, value: any) => { setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } })); };
  const updateLocalRecipe = (pizzaId: string, newRecipeList: any[]) => { handleLocalEdit(pizzaId, 'local_recipe', newRecipeList); };
  const handleImageUpload = async (event: any, pizzaId: string | null = null) => { /* ... código original ... */ }; 
  const actualizarStockGlobal = async () => { /* ... código original ... */ };
  const cargarDatos = async () => { /* ... código original ... */ };

  // --- FUNCION MEJORADA: ELIMINAR Y RESTAURAR INVENTARIO ---
  const eliminarUnidad = async (nombre: string, pizzaId: string) => {
      // 1. Encontrar el pedido (Prioridad: Pendiente -> Horno -> Entregado)
      const userOrders = pedidos.filter(p => p.invitado_nombre === nombre && p.pizza_id === pizzaId);
      let candidate = userOrders.find(p => p.estado === 'pendiente');
      if (!candidate) candidate = userOrders.find(p => p.estado === 'cocinando');
      if (!candidate) candidate = userOrders.find(p => p.estado === 'entregado');

      if (candidate) {
          // 2. Confirmación básica
          if (!confirm(`¿Eliminar 1 unidad (${candidate.estado}) de ${nombre}?`)) return;
          
          // 3. Confirmación de devolución de stock
          const devolverStock = confirm("¿Devolver los ingredientes al Inventario?");

          if (devolverStock) {
              const pizza = pizzas.find(p => p.id === pizzaId);
              const porcionesTotal = pizza?.porciones_individuales || config.porciones_por_pizza || 1;
              const recetaPizza = recetas.filter(r => r.pizza_id === pizzaId);

              if (recetaPizza.length > 0) {
                  const fraccion = candidate.cantidad_porciones / porcionesTotal;
                  
                  // Actualizar ingredientes
                  const updates = recetaPizza.map(async (item: any) => {
                      const ing = ingredientes.find(i => i.id === item.ingrediente_id);
                      if (ing) {
                          const devolver = item.cantidad_requerida * fraccion;
                          await supabase.from('ingredientes')
                              .update({ cantidad_disponible: ing.cantidad_disponible + devolver })
                              .eq('id', ing.id);
                      }
                  });
                  await Promise.all(updates);
                  alert("Ingredientes devueltos.");
              }
          }

          // 4. Borrar el pedido
          await supabase.from('pedidos').delete().eq('id', candidate.id);
          setPedidos(prev => prev.filter(p => p.id !== candidate!.id)); // UI Optimista
          cargarDatos();
          await actualizarStockGlobal();
      } else {
          alert("No se encontraron pedidos de este usuario para esta comida.");
      }
  };

  // --- FUNCION DUPLICAR PIZZA ---
  const duplicateP = async (pizza: any) => {
      const confirmText = `¿Duplicar "${pizza.nombre}"? \nSe copiará la información y la receta.`;
      if (!confirm(confirmText)) return;
      try {
          const { data: newPizza, error: errP } = await supabase.from('menu_pizzas').insert([{
              nombre: `${pizza.nombre} (Copia)`, descripcion: pizza.descripcion, imagen_url: pizza.imagen_url, tiempo_coccion: pizza.tiempo_coccion, categoria: pizza.categoria, porciones_individuales: pizza.porciones_individuales, tipo: pizza.tipo, stock: 0, activa: false 
          }]).select().single();
          if (errP || !newPizza) throw new Error("Error creando la pizza copia");
          const sourceRecipe = recetas.filter(r => r.pizza_id === pizza.id);
          if (sourceRecipe.length > 0) {
              const newRecipeRows = sourceRecipe.map(r => ({ pizza_id: newPizza.id, ingrediente_id: r.ingrediente_id, cantidad_requerida: r.cantidad_requerida }));
              await supabase.from('recetas').insert(newRecipeRows);
          }
          alert("¡Duplicada con éxito! La copia está inactiva."); cargarDatos();
      } catch (e: any) { alert("Error al duplicar: " + e.message); }
  };

  const updateP = async (id: string, field: string, val: any) => { if (field === 'activa') { await supabase.from('menu_pizzas').update({ activa: val }).eq('id', id); setPizzas(prev => prev.map(p => p.id === id ? { ...p, activa: val } : p)); } else { handleLocalEdit(id, field, val); } };
  const addP = async () => { /* ... código original ... */ };
  const delP = async (id: string) => { /* ... código original ... */ };
  const savePizzaChanges = async (id: string) => { /* ... código original ... */ };
  const cancelChanges = (id: string) => { setEdits(prev => { const newEdits = { ...prev }; delete newEdits[id]; return newEdits; }); };
  const changePass = async () => { if(!newPass) return; await supabase.from('configuracion_dia').update({password_admin: newPass}).eq('id', config.id); alert('OK'); setNewPass(''); };
  const toggleCategory = async (cat: string) => { const current = new Set(activeCategories); if (current.has(cat)) current.delete(cat); else current.add(cat); const newArr = Array.from(current); setConfig({...config, categoria_activa: JSON.stringify(newArr)}); await supabase.from('configuracion_dia').update({ categoria_activa: JSON.stringify(newArr) }).eq('id', config.id); };
  const addU = async () => { /* ... */ }; const toggleB = async (u: any) => { /* ... */ }; const guardarMotivo = async (nombre: string, u: any) => { /* ... */ }; const resetAllOrders = async () => { /* ... */ }; const addIng = async () => { /* ... */ }; const startEditIng = (ing: any) => { /* ... */ }; const cancelEditIng = () => { /* ... */ }; const saveEditIng = async (id: string) => { /* ... */ }; const delIng = async (id: string) => { /* ... */ }; const addToNewPizzaRecipe = () => { /* ... */ }; const removeFromNewPizzaRecipe = (idx: number) => { /* ... */ }; const addToExistingPizza = (pizzaId: string, ingId: string, name: string, qty: any, currentRecipe: any[]) => { /* ... */ }; const removeFromExistingPizza = (pizzaId: string, idx: number, currentRecipe: any[]) => { /* ... */ }; const garantizarPersistenciaUsuario = async (nom: string) => { /* ... */ }; const eliminarPedidosGusto = async (nom: string, pid: string) => { /* ... */ }; const resetU = async (nom: string) => { /* ... */ }; const saveBulkIngredient = async () => { /* ... */ }; const toggleBulkPizza = (pid: string) => { /* ... */ }; const updateLogName = async (id: string, newName: string) => { /* ... */ }; const eliminarUsuario = async (nombre: string, userDB: any) => { /* ... */ }; const quickUpdateStock = async (id: string, current: number, add: number) => { /* ... */ }; const delAllVal = async () => { /* ... */ }; const delValPizza = async (pid: string) => { /* ... */ }; const moverAlHorno = async (p: any, modo: 'una' | 'todas' = 'todas') => { /* ... */ }; const entregar = async (p: any, modo: 'una' | 'todas' = 'todas', force: boolean = false) => { /* ... */ };

  const metricas = useMemo(() => { 
      let lista = pizzas.filter(p => p.activa); 
      if (activeCategories.length > 0 && !activeCategories.includes('Todas')) { 
          lista = lista.filter(p => activeCategories.includes(p.categoria || 'General') || p.cocinando || (pedidos.some(ped => ped.pizza_id === p.id)) ); 
      } 
      const listaProcesada = lista.map(pizza => { 
          const activeOrders = pedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado'); 
          const deliveredOrders = pedidos.filter(p => p.pizza_id === pizza.id && p.estado === 'entregado');
          const enEspera = activeOrders.filter(p => p.estado === 'pendiente').reduce((acc:number, c:any) => acc + c.cantidad_porciones, 0);
          const enHorno = activeOrders.filter(p => p.estado === 'cocinando').reduce((acc:number, c:any) => acc + c.cantidad_porciones, 0);
          const entregadas = deliveredOrders.reduce((acc:number, c:any) => acc + c.cantidad_porciones, 0);
          const totalPendientes = enEspera + enHorno;
          const target = pizza.porciones_individuales || config.porciones_por_pizza; 
          return { ...pizza, totalPendientes, enEspera, enHorno, entregadas, completas: Math.floor(enHorno / target), faltan: target - (enHorno % target), target, percent: ((enHorno % target) / target) * 100, pedidosPendientes: activeOrders, stockRestante: pizza.stock }; 
      }); 
      return listaProcesada.sort((a, b) => { if (a.cocinando && !b.cocinando) return -1; if (!a.cocinando && b.cocinando) return 1; if (orden === 'nombre') return a.nombre.localeCompare(b.nombre); return b.totalPendientes - a.totalPendientes; }); 
  }, [pizzas, pedidos, config, orden, activeCategories]); 

  const stats = useMemo(() => { let waiting = 0; let cooking = 0; let delivered = 0; const hungryPeople = new Set(); pedidos.forEach(p => { if (p.estado === 'pendiente') { hungryPeople.add(p.invitado_nombre.toLowerCase()); waiting += p.cantidad_porciones; } else if (p.estado === 'cocinando') { hungryPeople.add(p.invitado_nombre.toLowerCase()); cooking += p.cantidad_porciones; } else if (p.estado === 'entregado') { delivered += p.cantidad_porciones; } }); return { waiting, cooking, delivered, hungryPeople: hungryPeople.size }; }, [pedidos, pizzas]);
  const pedidosAgrupados = Array.from(new Set(pedidos.map(p => p.invitado_nombre.toLowerCase()))).map(nombre => { const susPedidos = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre); const nombreReal = susPedidos[0]?.invitado_nombre || nombre; const detalle = pizzas.map(pz => { const ped = susPedidos.filter(p => p.pizza_id === pz.id); if (ped.length === 0) return null; const entr = ped.filter(p => p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0); const pendientesArr = ped.filter(p => p.estado === 'pendiente'); const pend = pendientesArr.reduce((acc, c) => acc + c.cantidad_porciones, 0); const oldestPending = pendientesArr.length > 0 ? pendientesArr.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0].created_at : null; const enHorno = ped.filter(p => p.estado === 'cocinando').reduce((acc, c) => acc + c.cantidad_porciones, 0); return { id: pz.id, nombre: pz.nombre, entregada: entr, enHorno, enEspera: pend, oldestPending: oldestPending }; }).filter(Boolean); const totalEnHorno = detalle.reduce((acc, d) => acc + (d?.enHorno || 0), 0); const totalEnEspera = detalle.reduce((acc, d) => acc + (d?.enEspera || 0), 0); const totalPendienteGeneral = totalEnHorno + totalEnEspera; return { nombre: nombreReal, detalle, totalPendienteGeneral, totalEnHorno, totalEnEspera }; }).sort((a, b) => b.totalPendienteGeneral - a.totalPendienteGeneral);
  const ranking = useMemo(() => { return pizzas.map(p => { const vals = valoraciones.filter(v => v.pizza_id === p.id); const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b.rating, 0) / vals.length) : 0; const orders = pedidos.filter(ped => ped.pizza_id === p.id).reduce((acc, c) => acc + c.cantidad_porciones, 0); return { ...p, avg: parseFloat(avg.toFixed(1)), count: vals.length, totalOrders: orders }; }).sort((a, b) => b.avg - a.avg); }, [pizzas, valoraciones, pedidos]);
  const allUsersList = useMemo(() => { const orderCounts: Record<string, number> = {}; pedidos.forEach(p => { const k = p.invitado_nombre.toLowerCase(); orderCounts[k] = (orderCounts[k] || 0) + p.cantidad_porciones; }); const map = new Map(); invitadosDB.forEach(u => { const k = u.nombre.toLowerCase(); const isWebOrigin = u.origen === 'web'; map.set(k, { ...u, totalOrders: orderCounts[k] || 0, source: isWebOrigin ? 'ped' : 'db', origen: u.origen || 'admin' }); }); Object.keys(orderCounts).forEach(key => { if (!map.has(key)) { const realName = pedidos.find(p => p.invitado_nombre.toLowerCase() === key)?.invitado_nombre || key; map.set(key, { id: null, nombre: realName, bloqueado: false, source: 'ped', totalOrders: orderCounts[key], origen: 'web' }); } }); return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre)); }, [invitadosDB, pedidos]);

  if (!autenticado) return (
    <div className={`min-h-screen flex items-center justify-center p-4 pb-40 ${base.bg}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-xl ${base.card}`}>
        <div className="flex justify-center mb-6"><img src="/logo.png" alt="Logo" className="h-48 w-auto object-contain drop-shadow-xl" /></div>
        <form onSubmit={ingresar} className="flex flex-col gap-4">
            <div className="relative"><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className={`w-full p-4 rounded-xl border outline-none ${base.input}`} placeholder="Contraseña..." autoFocus /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={24} /> : <Eye size={24} />}</button></div>
            <button type="submit" className={`w-full ${currentTheme.color} text-white font-bold py-4 rounded-xl hover:opacity-90 transition`}>ENTRAR</button>
        </form>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10"><button onClick={() => window.location.href='/'} className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${base.buttonSec}`}><Users size={20} /> MODO INVITADOS</button></div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans pb-28 w-full ${base.bg}`}>
      <div className={`w-full h-40 rounded-b-[40px] bg-gradient-to-br ${currentTheme.gradient} shadow-xl absolute top-0 left-0 z-0`}></div>
      <div className={`fixed top-4 left-4 right-4 z-50 rounded-2xl p-2 flex justify-between items-center shadow-lg backdrop-blur-md border ${base.bar}`}>
          <div className="flex items-center gap-3 pl-2 cursor-pointer active:scale-95 transition-transform" onClick={() => setShowOnlineModal(true)}>
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
              <div className="leading-tight"><h1 className="font-bold text-sm">Modo Pizzaiolo</h1><p className="text-[10px] opacity-70 flex items-center gap-1"><Users size={10} className="text-green-500 animate-pulse"/> {onlineUsers} / {config.total_invitados}</p></div>
          </div>
          <div className="flex gap-2 relative pr-1">
              {view === 'menu' && <button onClick={() => setShowBulkModal(true)} className={`p-2 rounded-full border ${base.buttonSec} text-blue-500 border-blue-500/30 bg-blue-500/10`} title="Edición Masiva"><Layers size={16}/></button>}
              <button onClick={() => setShowThemeSelector(!showThemeSelector)} className={`p-2 rounded-full border ${base.buttonSec}`}><Palette size={16}/></button>
              {showThemeSelector && (<div className="absolute top-12 right-0 bg-black/90 backdrop-blur p-2 rounded-xl flex gap-2 animate-in fade-in z-50 border border-white/10 shadow-xl">{THEMES.map(t => (<button key={t.name} onClick={() => selectTheme(t)} className={`w-6 h-6 rounded-full ${t.color} border-2 border-white ring-2 ring-transparent hover:scale-110 transition-transform`}></button>))}</div>)}
              <button onClick={toggleDarkMode} className={`p-2 rounded-full border ${base.buttonSec}`}>{isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}</button>
              {view === 'cocina' && (<><button onClick={() => setOrden(o => o === 'estado' ? 'nombre' : 'estado')} className={`p-2 rounded-full border flex items-center gap-1 ${base.buttonSec}`}>{orden === 'estado' ? <ArrowUpNarrowWide size={16}/> : <ArrowDownAZ size={16}/>}</button><button onClick={() => setIsCompact(!isCompact)} className={`p-2 rounded-full border flex items-center gap-1 ${base.buttonSec}`}>{isCompact ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}</button></>)}
              <button onClick={logout} className={`p-2 rounded-full border ${base.buttonSec} ml-1 bg-red-500/10 border-red-500/30 text-red-500`}><LogOut size={16} /></button>
          </div>
      </div>
      
      {showOnlineModal && (<div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowOnlineModal(false)}><div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${base.card} relative`} onClick={e => e.stopPropagation()}><button onClick={() => setShowOnlineModal(false)} className="absolute top-4 right-4 text-gray-500"><X size={20}/></button><h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Users size={20} className="text-green-500"/> En Línea ({onlineUsers})</h3><div className="max-h-60 overflow-y-auto space-y-2">{onlineGuestList.length > 0 ? onlineGuestList.map((u, i) => (<div key={i} className={`p-3 rounded-xl border ${base.innerCard} flex items-center gap-2`}><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span className="font-medium text-sm">{u}</span></div>)) : <p className="text-sm opacity-50 text-center py-4">Nadie por aquí...</p>}</div></div></div>)}
      {showBulkModal && (<div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowBulkModal(false)}><div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border ${base.card} flex flex-col max-h-[90vh]`} onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold flex items-center gap-2"><Layers size={24} className="text-blue-500"/> Edición Masiva</h3><button onClick={() => setShowBulkModal(false)}><X size={24} className="opacity-50 hover:opacity-100"/></button></div><div className="flex gap-2 mb-4 bg-neutral-800/50 p-1 rounded-xl border border-white/5"><button onClick={() => setBulkMode('SET')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${bulkMode === 'SET' ? 'bg-blue-600 text-white shadow' : 'opacity-60 hover:opacity-100'}`}><Plus size={16}/> Fijar / Añadir</button><button onClick={() => setBulkMode('REMOVE')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${bulkMode === 'REMOVE' ? 'bg-red-600 text-white shadow' : 'opacity-60 hover:opacity-100'}`}><Trash2 size={16}/> Eliminar</button></div><div className="space-y-4 mb-4 overflow-y-auto flex-1 pr-2"><div className="grid grid-cols-2 gap-4"><div className={`col-span-2 ${bulkMode === 'SET' ? 'md:col-span-1' : ''}`}><label className="text-xs font-bold uppercase opacity-60 mb-1 block">Ingrediente a {bulkMode === 'SET' ? 'Aplicar' : 'Borrar'}</label><select value={bulkIngId} onChange={(e) => setBulkIngId(e.target.value)} className={`w-full p-3 rounded-xl border outline-none ${base.input}`}><option value="">Seleccionar...</option>{ingredientes.map(ing => (<option key={ing.id} value={ing.id}>{ing.nombre} ({ing.cantidad_disponible} {ing.unidad})</option>))}</select></div>{bulkMode === 'SET' && (<div className="col-span-2 md:col-span-1 animate-in fade-in"><label className="text-xs font-bold uppercase opacity-60 mb-1 block">Cantidad Nueva</label><input type="number" value={bulkQty} onChange={(e) => setBulkQty(e.target.value)} placeholder="0" className={`w-full p-3 rounded-xl border outline-none ${base.input}`} /></div>)}</div><div><div className="flex justify-between items-end mb-2 border-b border-gray-700 pb-2"><label className="text-xs font-bold uppercase opacity-60">Seleccionar Pizzas ({bulkSelectedPizzas.length})</label><div className="flex gap-2"><button onClick={() => setBulkSelectedPizzas(pizzas.map(p => p.id))} className="text-[10px] underline text-blue-400">Todas</button><button onClick={() => setBulkSelectedPizzas([])} className="text-[10px] underline text-red-400">Ninguna</button></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{pizzas.map(p => (<div key={p.id} onClick={() => toggleBulkPizza(p.id)} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${bulkSelectedPizzas.includes(p.id) ? 'bg-blue-500/20 border-blue-500' : base.innerCard}`}><div className={`w-5 h-5 rounded border flex items-center justify-center ${bulkSelectedPizzas.includes(p.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>{bulkSelectedPizzas.includes(p.id) && <CheckCircle size={14} className="text-white"/>}</div><span className="text-sm font-medium truncate">{p.nombre}</span></div>))}</div></div></div><button onClick={saveBulkIngredient} className={`w-full py-3 font-bold rounded-xl shadow-lg transition-all active:scale-95 text-white ${bulkMode === 'SET' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-red-600 hover:bg-red-500'}`}>{bulkMode === 'SET' ? 'APLICAR CAMBIOS' : 'ELIMINAR SELECCIÓN'}</button></div></div>)}

      <div className="relative z-10 pt-24 px-4 pb-36">
        {view === 'cocina' && (<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4"><div className={`p-3 rounded-2xl border flex flex-col items-center justify-center ${base.metric}`}><div className="flex items-center gap-1 mb-1 opacity-60"><Flame size={16}/><span className="text-[10px] font-bold uppercase">En Horno</span></div><p className="text-2xl font-black">{stats.cooking}</p></div><div className={`p-3 rounded-2xl border flex flex-col items-center justify-center ${base.metric}`}><div className="flex items-center gap-1 mb-1 opacity-60"><Hourglass size={16}/><span className="text-[10px] font-bold uppercase">En Cola</span></div><p className="text-2xl font-black">{stats.waiting}</p></div><div className={`p-3 rounded-2xl border flex flex-col items-center justify-center ${base.metric}`}><div className="flex items-center gap-1 mb-1 opacity-60"><CheckCircle size={16}/><span className="text-[10px] font-bold uppercase">Entregado</span></div><p className="text-2xl font-black">{stats.delivered}</p></div><div className={`p-3 rounded-2xl border flex flex-col items-center justify-center ${base.metric}`}><div className="flex items-center gap-1 mb-1 opacity-60"><Users size={16}/><span className="text-[10px] font-bold uppercase">Esperando</span></div><p className="text-2xl font-black">{stats.hungryPeople}</p></div></div>)}
        <main className="max-w-4xl mx-auto space-y-4 w-full">
            {view === 'cocina' && <KitchenView metricas={metricas} base={base} isCompact={isCompact} isDarkMode={isDarkMode} currentTheme={currentTheme} toggleCocinando={moverAlHorno} entregar={entregar} />}
            {view === 'pedidos' && <OrdersView pedidosAgrupados={pedidosAgrupados} base={base} isDarkMode={isDarkMode} eliminarPedidosGusto={eliminarPedidosGusto} resetAllOrders={resetAllOrders} eliminarUnidad={eliminarUnidad} />}
            {view === 'ingredientes' && <InventoryView base={base} currentTheme={currentTheme} ingredients={ingredientes} newIngName={newIngName} setNewIngName={setNewIngName} newIngQty={newIngQty} setNewIngQty={setNewIngQty} newIngUnit={newIngUnit} setNewIngUnit={setNewIngUnit} newIngCat={newIngCat} setNewIngCat={setNewIngCat} addIng={addIng} editingIngId={editingIngId} editIngForm={editIngForm} setEditIngForm={setEditIngForm} saveEditIng={saveEditIng} cancelEditIng={cancelEditIng} delIng={delIng} startEditIng={startEditIng} reservedState={reservedState} quickUpdateStock={quickUpdateStock} />}
            {view === 'menu' && <MenuView base={base} config={config} setConfig={setConfig} activeCategories={activeCategories} uniqueCategories={uniqueCategories} toggleCategory={toggleCategory} currentTheme={currentTheme} addP={addP} uploading={uploading} newPizzaName={newPizzaName} setNewPizzaName={setNewPizzaName} isDarkMode={isDarkMode} handleImageUpload={handleImageUpload} newPizzaImg={newPizzaImg} newPizzaDesc={newPizzaDesc} setNewPizzaDesc={setNewPizzaDesc} newPizzaIngredients={newPizzaIngredients} removeFromNewPizzaRecipe={removeFromNewPizzaRecipe} newPizzaSelectedIng={newPizzaSelectedIng} setNewPizzaSelectedIng={setNewPizzaSelectedIng} ingredients={ingredientes} newPizzaRecipeQty={newPizzaRecipeQty} setNewPizzaRecipeQty={setNewPizzaRecipeQty} addToNewPizzaRecipe={addToNewPizzaRecipe} newPizzaCat={newPizzaCat} setNewPizzaCat={setNewPizzaCat} newPizzaPortions={newPizzaPortions} setNewPizzaPortions={setNewPizzaPortions} stockEstimadoNueva={stockEstimadoNueva} newPizzaTime={newPizzaTime} setNewPizzaTime={setNewPizzaTime} pizzas={pizzas} edits={edits} recetas={recetas} updateP={updateP} savePizzaChanges={savePizzaChanges} cancelChanges={cancelChanges} delP={delP} duplicateP={duplicateP} tempRecipeIng={tempRecipeIng} setTempRecipeIng={setTempRecipeIng} tempRecipeQty={tempRecipeQty} setTempRecipeQty={setTempRecipeQty} addToExistingPizza={addToExistingPizza} removeFromExistingPizza={removeFromExistingPizza} reservedState={reservedState} calcularStockDinamico={calcularStockDinamico} updateLocalRecipe={updateLocalRecipe} newPizzaType={newPizzaType} setNewPizzaType={setNewPizzaType} />}
            {view === 'ranking' && <RankingView base={base} delAllVal={delAllVal} ranking={ranking} delValPizza={delValPizza} />}
            {view === 'usuarios' && <UsersView base={base} newGuestName={newGuestName} setNewGuestName={setNewGuestName} addU={addU} allUsersList={allUsersList} resetU={resetU} toggleB={toggleB} eliminarUsuario={eliminarUsuario} tempMotivos={tempMotivos} setTempMotivos={setTempMotivos} guardarMotivo={guardarMotivo} currentTheme={currentTheme} resetAllOrders={resetAllOrders} />}
            {view === 'config' && <ConfigView base={base} config={config} setConfig={setConfig} isDarkMode={isDarkMode} resetAllOrders={resetAllOrders} newPass={newPass} setNewPass={setNewPass} confirmPass={confirmPass} setConfirmPass={setConfirmPass} changePass={changePass} currentTheme={currentTheme} sessionDuration={sessionDuration} setSessionDuration={setSessionDuration} />}
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