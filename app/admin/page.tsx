'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Pizza, Settings, Trash2, ChefHat, Eye, EyeOff, CheckCircle, 
  Clock, Flame, LogOut, List, User, ArrowDownAZ, ArrowUpNarrowWide, 
  Maximize2, Minimize2, Users, Ban, RotateCcw, KeyRound, Plus, 
  ArrowRight, LayoutDashboard, XCircle, Sun, Moon 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const THEMES = [
  { name: 'Carbone', color: 'bg-neutral-600', text: 'text-neutral-400' },
  { name: 'Turquesa', color: 'bg-cyan-600', text: 'text-cyan-400' },
  { name: 'Pistacho', color: 'bg-lime-600', text: 'text-lime-400' },
  { name: 'Fuego', color: 'bg-red-600', text: 'text-red-500' },
  { name: 'Violeta', color: 'bg-violet-600', text: 'text-violet-400' },
];

export default function AdminPage() {
  // --- ESTADOS ---
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'cocina' | 'pedidos' | 'menu' | 'usuarios' | 'config'>('cocina');
  
  const [pedidos, setPedidos] = useState<any[]>([]); 
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [invitadosDB, setInvitadosDB] = useState<any[]>([]); 
  const [config, setConfig] = useState<any>({ porciones_por_pizza: 4, total_invitados: 10, password_invitados: '' });
  const [invitadosCount, setInvitadosCount] = useState(0);

  const prevPedidosCount = useRef(0);
  
  // Inputs Formularios
  const [newPizzaName, setNewPizzaName] = useState('');
  const [newPizzaDesc, setNewPizzaDesc] = useState('');
  const [newPizzaStock, setNewPizzaStock] = useState(5);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  // UI
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [orden, setOrden] = useState<'estado' | 'nombre'>('estado');
  const [isCompact, setIsCompact] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --- ESTILOS DINÁMICOS (CLARO / OSCURO) ---
  const base = isDarkMode ? {
      bg: "bg-neutral-950",
      text: "text-white",
      textSec: "text-neutral-400",
      subtext: "text-neutral-500",
      card: "bg-neutral-900 border-neutral-800",
      input: "bg-black border-neutral-700 text-white placeholder-neutral-600",
      header: "bg-neutral-900/90 border-neutral-800",
      nav: "bg-neutral-900/90 border-neutral-800",
      buttonSec: "bg-neutral-800 text-neutral-400 hover:text-white border-white/10",
      buttonIcon: "bg-neutral-800 text-neutral-400 hover:text-white",
      divider: "border-neutral-800",
      metricCard: "bg-neutral-900 border-neutral-800",
      tableRow: "bg-neutral-900 border-neutral-800",
      blocked: "bg-red-900/10 border-red-900/30"
  } : {
      bg: "bg-gray-100",
      text: "text-gray-900",
      textSec: "text-gray-600",
      subtext: "text-gray-500",
      card: "bg-white border-gray-200 shadow-sm",
      input: "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
      header: "bg-white/90 border-gray-200",
      nav: "bg-white/90 border-gray-200",
      buttonSec: "bg-gray-200 text-gray-600 hover:text-black border-black/5",
      buttonIcon: "bg-gray-200 text-gray-600 hover:text-black",
      divider: "border-gray-200",
      metricCard: "bg-white border-gray-200 shadow-sm",
      tableRow: "bg-white border-gray-200 shadow-sm",
      blocked: "bg-red-50 border-red-200"
  };

  // --- EFECTOS ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('vito-theme');
    if (savedTheme) {
      const found = THEMES.find(t => t.name === savedTheme);
      if (found) setCurrentTheme(found);
    }
    
    const savedMode = localStorage.getItem('vito-dark-mode');
    if (savedMode !== null) setIsDarkMode(savedMode === 'true');

    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
       Notification.requestPermission();
    }

    if (autenticado) {
      cargarDatos();
      const channel = supabase.channel('admin-realtime')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => cargarDatos())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [autenticado]);

  const toggleDarkMode = () => {
      const newVal = !isDarkMode;
      setIsDarkMode(newVal);
      localStorage.setItem('vito-dark-mode', String(newVal));
  };

  // --- FUNCIONES ---
  const ingresar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let { data } = await supabase.from('configuracion_dia').select('*').single();
    
    if (!data) {
        const { data: newData } = await supabase.from('configuracion_dia').insert([{ password_admin: 'admin', porciones_por_pizza: 4, total_invitados: 10 }]).select().single();
        data = newData;
    }

    if (data && data.password_admin === password) {
      setAutenticado(true); 
      setConfig(data); 
      cargarDatos();
    } else { 
      alert('Contraseña incorrecta'); 
    }
  };

  const irAInvitados = () => {
      window.location.href = '/';
  };

  const cargarDatos = async () => {
    const now = new Date();
    const corte = new Date(now);
    if (now.getHours() < 6) {
        corte.setDate(corte.getDate() - 1);
    }
    corte.setHours(6, 0, 0, 0);
    const corteISO = corte.toISOString();

    const { data: dPizzas } = await supabase.from('menu_pizzas').select('*').order('created_at');
    if (dPizzas) setPizzas(dPizzas);

    const { data: dPedidos } = await supabase.from('pedidos').select('*').gte('created_at', corteISO).order('created_at', { ascending: true });
    if (dPedidos) {
        setPedidos(dPedidos);
        setInvitadosCount(new Set(dPedidos.map(p => p.invitado_nombre.toLowerCase())).size);

        if (prevPedidosCount.current > 0 && dPedidos.length > prevPedidosCount.current) {
            enviarNotificacion("¡NUEVO PEDIDO!", "Alguien quiere pizza 🍕");
        }
        prevPedidosCount.current = dPedidos.length;
    }

    const { data: dInvitados } = await supabase.from('lista_invitados').select('*').order('nombre');
    if (dInvitados) setInvitadosDB(dInvitados);

    const { data: dConfig } = await supabase.from('configuracion_dia').select('*').single();
    if (dConfig) setConfig(dConfig);
  };

  const enviarNotificacion = (titulo: string, cuerpo: string) => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
             new Notification(titulo, { body: cuerpo, icon: '/icon.png' });
          } catch (e) { console.error(e); }
          
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(e => {});
      }
  };

  // --- LÓGICA MÉTRICAS ---
  const metricas = useMemo(() => {
      const lista = pizzas.filter(p => p.activa).map(pizza => {
        const pendientes = pedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado');
        const totalPendientes = pendientes.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
        const target = pizza.porciones_individuales || config.porciones_por_pizza;
        
        const totalStockPorciones = (pizza.stock || 0) * target;
        const totalPedidosGusto = pedidos.filter(p => p.pizza_id === pizza.id).reduce((acc, c) => acc + c.cantidad_porciones, 0);
        const stockRestante = totalStockPorciones - totalPedidosGusto;

        return {
          ...pizza,
          totalPendientes,
          completas: Math.floor(totalPendientes / target),
          faltan: target - (totalPendientes % target),
          target,
          percent: ((totalPendientes % target) / target) * 100,
          pedidosPendientes: pendientes,
          stockRestante: stockRestante < 0 ? 0 : stockRestante
        };
      });

      // ORDENAMIENTO: 1. Horno, 2. Con Stock, 3. Agotadas (Abajo), 4. Alfabetico
      return lista.sort((a, b) => {
          if (orden === 'estado') {
              // Primero las que se cocinan
              if (a.cocinando && !b.cocinando) return -1;
              if (!a.cocinando && b.cocinando) return 1;
              
              // Luego las que tienen stock
              const aStock = a.stockRestante > 0;
              const bStock = b.stockRestante > 0;
              if (aStock && !bStock) return -1;
              if (!aStock && bStock) return 1;

              return a.nombre.localeCompare(b.nombre);
          } else {
              return a.nombre.localeCompare(b.nombre);
          }
      });
  }, [pizzas, pedidos, config, orden]);

  // --- ESTADISTICAS GLOBALES ---
  const stats = useMemo(() => {
      // Porciones Pedidas (Pendientes)
      const totalPendientes = metricas.reduce((acc, m) => acc + m.totalPendientes, 0);
      
      // Pizzas en Curso (Variedades)
      const pizzasIncompletas = metricas.filter(m => m.faltan < m.target && m.totalPendientes > 0).length;
      
      // Pizzas Entregadas (Enteras)
      let totalPizzasEntregadas = 0;
      pizzas.forEach(pz => {
          const porcionesEntregadas = pedidos.filter(p => p.pizza_id === pz.id && p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0);
          const target = pz.porciones_individuales || config.porciones_por_pizza;
          totalPizzasEntregadas += Math.floor(porcionesEntregadas / target);
      });

      // Stock Total (En Porciones)
      const totalStockPorciones = pizzas.reduce((acc, p) => acc + ((p.stock || 0) * (p.porciones_individuales || config.porciones_por_pizza)), 0);

      return { totalPendientes, pizzasIncompletas, totalPizzasEntregadas, totalStockPorciones };
  }, [metricas, pizzas, pedidos, config]);

  const pedidosAgrupados = Array.from(new Set(pedidos.map(p => p.invitado_nombre.toLowerCase()))).map(nombre => {
      const susPedidos = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre);
      const nombreReal = susPedidos[0]?.invitado_nombre || nombre;
      const detalle = pizzas.map(pz => {
          const pedidosDePizza = susPedidos.filter(p => p.pizza_id === pz.id);
          if (pedidosDePizza.length === 0) return null;
          
          const cantEntregada = pedidosDePizza.filter(p => p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0);
          const cantPendiente = pedidosDePizza.filter(p => p.estado === 'pendiente').reduce((acc, c) => acc + c.cantidad_porciones, 0);
          
          return { 
              id: pz.id, 
              nombre: pz.nombre, 
              entregada: cantEntregada, 
              enHorno: pz.cocinando ? cantPendiente : 0, 
              enEspera: pz.cocinando ? 0 : cantPendiente 
          };
      }).filter(Boolean);

      const totalPendienteGeneral = detalle.reduce((acc, d) => acc + (d?.enHorno || 0) + (d?.enEspera || 0), 0);
      return { nombre: nombreReal, detalle, totalPendienteGeneral };
  }).sort((a, b) => b.totalPendienteGeneral - a.totalPendienteGeneral);

  // --- ACCIONES ---
  const eliminarUsuario = async (nombre: string, userDB: any) => {
      if(confirm(`¿Estás seguro de ELIMINAR a ${nombre}?`)) {
          if(userDB) {
              await supabase.from('lista_invitados').delete().eq('id', userDB.id);
          }
          const ids = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre.toLowerCase()).map(p => p.id);
          if (ids.length > 0) {
              await supabase.from('pedidos').delete().in('id', ids);
          }
          cargarDatos();
      }
  };

  // --- FIX: ELIMINAR PEDIDOS DE UN GUSTO ---
  const eliminarPedidosGusto = async (nombre: string, pizzaId: string, nombrePizza: string) => {
      if(confirm(`¿Borrar pedidos PEDIDOS (no entregados) de ${nombrePizza} para ${nombre}?`)) {
          // Buscamos pedidos que coincidan en nombre, pizza y estado pendiente
          const ids = pedidos.filter(p => 
              p.invitado_nombre.toLowerCase() === nombre.toLowerCase() && 
              p.pizza_id === pizzaId && 
              p.estado === 'pendiente'
          ).map(p => p.id);
          
          if(ids.length > 0) {
              await supabase.from('pedidos').delete().in('id', ids);
              cargarDatos();
          } else {
              alert(`No se encontraron pedidos pendientes de ${nombrePizza} para borrar.`);
          }
      }
  };

  const toggleCocinando = async (p: any) => {
      if (!p.cocinando && p.totalPendientes < p.target) {
          alert(`⚠️ Faltan ${p.target - p.totalPendientes} porciones para 1 pizza.`);
          return;
      }
      await supabase.from('menu_pizzas').update({ cocinando: !p.cocinando }).eq('id', p.id);
      setPizzas(prev => prev.map(item => item.id === p.id ? { ...item, cocinando: !p.cocinando } : item));
  };

  const entregarPizza = async (p: any) => {
      if (!confirm(`¿Salió 1 ${p.nombre}?`)) return;
      let porciones = p.target;
      const ids = [];
      for (const ped of p.pedidosPendientes) {
          if (porciones <= 0) break;
          ids.push(ped.id);
          porciones -= ped.cantidad_porciones;
      }
      if (ids.length > 0) {
          await supabase.from('pedidos').update({ estado: 'entregado' }).in('id', ids);
          await supabase.from('menu_pizzas').update({ cocinando: false }).eq('id', p.id);
          cargarDatos();
      }
  };

  const updatePizzaConfig = async (id: string, f: string, v: any) => {
      setPizzas(pizzas.map(p => p.id === id ? { ...p, [f]: v } : p));
      await supabase.from('menu_pizzas').update({[f]: v}).eq('id', id);
  };

  const addPizza = async () => { 
      if(!newPizzaName) return; 
      await supabase.from('menu_pizzas').insert([{ 
          nombre: newPizzaName, 
          descripcion: newPizzaDesc, 
          stock: newPizzaStock, 
          activa: true 
      }]); 
      setNewPizzaName(''); 
      setNewPizzaDesc(''); 
      setNewPizzaStock(5); 
      cargarDatos(); 
  };

  const deletePizza = async (id: string) => { 
      if(confirm('¿Borrar?')) await supabase.from('menu_pizzas').delete().eq('id', id); 
      cargarDatos(); 
  };
  
  const changePassword = async () => { 
      if (newPass !== confirmPass) { alert("Las contraseñas no coinciden"); return; }
      if (!newPass) { alert("La contraseña no puede estar vacía"); return; }
      await supabase.from('configuracion_dia').update({password_admin: newPass}).eq('id', config.id); 
      alert('Contraseña actualizada correctamente'); 
      setNewPass(''); setConfirmPass('');
  };
  
  const selectTheme = (theme: any) => { 
      setCurrentTheme(theme); 
      localStorage.setItem('vito-theme', theme.name); 
      window.dispatchEvent(new Event('storage')); 
  };

  const bloquearNombre = async (nombre: string, userDB: any) => {
      let userId = userDB?.id;
      if (!userDB) {
          const { data, error } = await supabase.from('lista_invitados').insert([{ nombre: nombre }]).select().single();
          if (error) { alert("Error al registrar usuario"); return; }
          userId = data.id;
      }

      if (userDB && userDB.bloqueado) {
          await supabase.from('lista_invitados').update({ bloqueado: false, motivo_bloqueo: '' }).eq('id', userId);
      } else {
          const motivo = prompt("Motivo del bloqueo (opcional):", "Acceso denegado");
          if (motivo === null) return; 
          await supabase.from('lista_invitados').update({ bloqueado: true, motivo_bloqueo: motivo }).eq('id', userId);
      }
      cargarDatos();
  };

  const resetUsuario = async (nombre: string) => {
      if (confirm(`¿RESET de ${nombre}? Se borrarán SOLO sus pedidos.`)) {
          const ids = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre.toLowerCase()).map(p => p.id);
          if (ids.length > 0) await supabase.from('pedidos').delete().in('id', ids);
          cargarDatos();
      }
  };

  // --- LOGIN ---
  if (!autenticado) return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans overflow-hidden ${base.bg}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${base.card}`}>
        <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Logo" className="h-32 w-auto object-contain drop-shadow-lg" />
        </div>
        <p className={`text-center mb-6 font-bold tracking-widest text-xs uppercase ${base.subtext}`}>Acceso Pizzaiolo</p>
        <form onSubmit={ingresar} className="flex flex-col gap-4">
            <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className={`w-full p-4 rounded-xl border outline-none ${base.input}`} 
                placeholder="Contraseña..." 
                autoFocus 
            />
            <button type="submit" className={`w-full ${currentTheme.color} text-white font-bold py-4 rounded-xl`}>
                ENTRAR
            </button>
        </form>
        <div className={`mt-8 text-center pt-6 border-t ${base.divider}`}>
            <button onClick={irAInvitados} className={`text-sm flex items-center justify-center gap-2 w-full py-3 ${base.textSec} hover:${base.text}`}>
                <ArrowRight size={16}/> Ir a modo Invitados
            </button>
        </div>
      </div>
    </div>
  );

  // --- DASHBOARD ---
  return (
    <div className={`min-h-screen font-sans pb-24 overflow-x-hidden w-full ${base.bg} ${base.text}`}>
      
      {/* HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-4 py-3 flex justify-between items-center shadow-md ${base.header}`}>
        <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <div>
                <h1 className={`font-bold text-lg tracking-tight leading-none ${currentTheme.text}`}>Il Forno Admin</h1>
                <p className={`text-[10px] ${base.subtext}`}>{invitadosCount} / {config.total_invitados} comensales</p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="flex gap-2">
                <button onClick={toggleDarkMode} className={`p-2 rounded-full border transition-colors ${base.buttonSec}`}>
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className={`flex gap-2 p-1.5 rounded-full border ${base.input}`}>
                    {THEMES.map(t => (
                        <button key={t.name} onClick={() => selectTheme(t)} className={`w-4 h-4 rounded-full ${t.color} ${currentTheme.name === t.name ? 'ring-2 ring-white scale-110' : 'opacity-40'}`}></button>
                    ))}
                </div>
            </div>
            <button onClick={irAInvitados} className={`p-2 rounded-full ${base.buttonIcon}`}>
                <LogOut size={18} />
            </button>
        </div>
      </header>

      {/* DASHBOARD Y MÉTRICAS */}
      {view === 'cocina' && (
        <>
            <div className={`px-4 py-2 border-t flex justify-between items-center animate-in slide-in-from-top-2 sticky top-14 z-40 backdrop-blur-sm ${base.header}`}>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${base.subtext}`}>
                    {isCompact ? 'Vista Compacta' : 'Vista Detallada'}
                </span>
                <div className="flex gap-2">
                    <button onClick={() => setOrden(orden === 'estado' ? 'nombre' : 'estado')} className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold border ${base.buttonSec}`}>
                        {orden === 'estado' ? <ArrowUpNarrowWide size={14} /> : <ArrowDownAZ size={14} />} 
                        {orden === 'estado' ? 'Prioridad' : 'Nombre'}
                    </button>
                    <button onClick={() => setIsCompact(!isCompact)} className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-xs font-bold transition-colors ${base.buttonSec}`}>
                        {isCompact ? <Maximize2 size={14} /> : <Minimize2 size={14} />} 
                        {isCompact ? 'Expandir' : 'Compactar'}
                    </button>
                </div>
            </div>
            
            {/* NUEVO DASHBOARD AGRUPADO (Números Dinámicos) */}
            <div className="grid grid-cols-2 gap-4 px-4 mt-4">
                {/* GRUPO 1: PIZZAS ENTERAS */}
                <div className={`p-3 rounded-2xl border ${base.metricCard}`}>
                    <h4 className={`text-[10px] font-bold uppercase mb-2 text-center border-b pb-1 ${base.divider} ${base.subtext}`}>PIZZAS (Enteras)</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="text-center">
                            <p className={`text-[9px] uppercase font-bold ${base.subtext}`}>En Curso</p>
                            <p className={`text-xl font-bold ${base.text}`}>{stats.pizzasIncompletas}</p>
                        </div>
                        <div className="text-center">
                            <p className={`text-[9px] uppercase font-bold ${base.subtext}`}>Entregadas</p>
                            <p className={`text-xl font-bold ${base.text}`}>{stats.totalPizzasEntregadas}</p>
                        </div>
                    </div>
                </div>

                {/* GRUPO 2: PORCIONES */}
                <div className={`p-3 rounded-2xl border ${base.metricCard}`}>
                    <h4 className={`text-[10px] font-bold uppercase mb-2 text-center border-b pb-1 ${base.divider} ${base.subtext}`}>PORCIONES</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="text-center">
                            <p className={`text-[9px] uppercase font-bold ${base.subtext}`}>Pedidas</p>
                            <p className={`text-xl font-bold ${base.text}`}>{stats.totalPendientes}</p>
                        </div>
                        <div className="text-center">
                            <p className={`text-[9px] uppercase font-bold ${base.subtext}`}>En Stock</p>
                            <p className={`text-xl font-bold ${base.text}`}>{stats.totalStockPorciones}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
      )}

      <main className="p-4 max-w-4xl mx-auto space-y-6 w-full">
        {/* VISTA COCINA */}
        {view === 'cocina' && (
          <div className="grid gap-3">
            {metricas.map(p => (
              <div key={p.id} className={`rounded-3xl border relative overflow-hidden transition-all ${base.card} ${p.cocinando ? 'border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : ''} ${isCompact ? 'p-3' : 'p-5'}`}>
                {!isCompact && p.cocinando && <div className="absolute -right-10 -bottom-10 text-red-600/20"><Flame size={150} /></div>}
                
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                        <h3 className={`font-bold flex items-center gap-2 ${isCompact ? 'text-base' : 'text-xl'}`}>
                            {p.nombre}
                            {p.cocinando && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">EN HORNO</span>}
                        </h3>
                        <p className={`text-xs flex items-center gap-1 mt-1 ${base.subtext}`}>
                            <Clock size={12}/> Pedidas: {p.totalPendientes}
                        </p>
                        <p className={`text-[10px] mt-1 font-mono ${p.stockRestante === 0 ? 'text-red-500 font-bold' : base.subtext}`}>
                            Stock: {p.stockRestante} porc.
                        </p>
                    </div>
                    <button onClick={() => toggleCocinando(p)} className={`rounded-xl transition-all flex items-center justify-center ${p.cocinando ? 'bg-red-600 text-white shadow-lg scale-105' : 'bg-neutral-800 text-neutral-500 border border-neutral-700'} ${isCompact ? 'p-2' : 'p-3'}`}>
                        <Flame size={isCompact ? 16 : 20} className={p.cocinando ? 'animate-bounce' : ''} />
                    </button>
                </div>
                
                <div className={`relative rounded-full overflow-hidden border z-10 mb-3 ${isDarkMode ? 'bg-black border-white/10' : 'bg-gray-200 border-gray-300'} ${isCompact ? 'h-2' : 'h-4'}`}>
                    <div className="absolute inset-0 flex justify-between px-[1px] z-20">
                        {[...Array(p.target)].map((_, i) => <div key={i} className={`w-[1px] h-full ${isDarkMode ? 'bg-white/10' : 'bg-white/50'}`}></div>)}
                    </div>
                    <div className={`absolute h-full ${p.cocinando ? 'bg-red-600' : currentTheme.color} transition-all duration-700`} style={{ width: `${p.percent}%` }}></div>
                </div>
                
                {p.completas > 0 ? (
                    <button onClick={() => entregarPizza(p)} className={`w-full ${currentTheme.color} text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition active:scale-95 ${isCompact ? 'py-2 text-sm' : 'py-3'}`}>
                        <CheckCircle size={isCompact ? 16 : 20} /> ¡PIZZA LISTA! ({p.completas})
                    </button>
                ) : (
                    <div className={`w-full text-center text-xs font-mono border rounded-xl ${isDarkMode ? 'border-neutral-800 text-neutral-500' : 'border-gray-200 text-gray-400'} ${isCompact ? 'py-1' : 'py-2'}`}>
                        Faltan {p.faltan} porc.
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* VISTA PEDIDOS */}
        {view === 'pedidos' && (
            <div className="space-y-4">
                <h2 className={`text-sm font-bold uppercase tracking-widest mb-2 ${base.subtext}`}>Estado de Pedidos</h2>
                {pedidosAgrupados.length === 0 ? <p className={`text-center ${base.subtext}`}>Sin pedidos recientes.</p> : pedidosAgrupados.map((u, i) => {
                    const userDB = invitadosDB.find(usr => usr.nombre.toLowerCase() === u.nombre.toLowerCase());
                    return (
                        <div key={i} className={`p-4 rounded-2xl border ${base.tableRow} relative`}>
                            {/* BOTÓN BORRAR USUARIO */}
                            <button onClick={() => eliminarUsuario(u.nombre, userDB)} className={`absolute top-4 right-4 p-2 rounded-lg ${base.buttonIcon} hover:text-red-500`}>
                                <Trash2 size={16} />
                            </button>
                            <div className={`flex justify-between border-b pb-2 mb-3 pr-10 ${base.divider}`}>
                                <h3 className="font-bold flex items-center gap-2 capitalize text-lg">
                                    <User size={18}/> {u.nombre} 
                                    {u.totalPendienteGeneral > 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">ESPERANDO</span>}
                                </h3>
                            </div>
                            <div className="space-y-2">{u.detalle.map((d: any, k: number) => (
                                <div key={k} className={`flex justify-between items-center text-sm p-2 rounded-lg border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                    <span className={base.text}>{d.nombre}</span>
                                    <div className="flex items-center gap-2 text-xs font-bold">
                                        {d.enHorno > 0 && (<span className="bg-red-900/50 text-red-400 border border-red-500/30 px-2 py-1 rounded flex items-center gap-1"><Flame size={12} /> {d.enHorno}</span>)}
                                        {d.enEspera > 0 && (<span className="bg-yellow-900/30 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded flex items-center gap-1"><Clock size={12} /> {d.enEspera}</span>)}
                                        {d.entregada > 0 && (<span className="bg-green-900/30 text-green-500 border border-green-500/20 px-2 py-1 rounded flex items-center gap-1 opacity-60"><CheckCircle size={12} /> {d.entregada}</span>)}
                                        
                                        {/* BOTÓN ELIMINAR PEDIDO DE GUSTO ESPECÍFICO */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); eliminarPedidosGusto(u.nombre, d.id, d.nombre); }} 
                                            className="p-1.5 ml-2 bg-red-900/20 text-red-500 rounded-lg hover:bg-red-900/40 border border-red-900/30 transition-colors"
                                            title="Borrar pedidos pendientes de este gusto"
                                        >
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}</div>
                        </div>
                    );
                })}
            </div>
        )}

        {/* VISTA MENÚ */}
        {view === 'menu' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${base.card}`}>
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${base.subtext}`}><Plus size={18}/> Agregar Nueva</h3>
                <input className={`w-full p-4 rounded-2xl border mb-2 outline-none ${base.input}`} placeholder="Nombre..." value={newPizzaName} onChange={e => setNewPizzaName(e.target.value)} />
                <textarea className={`w-full p-4 rounded-2xl border mb-4 text-sm outline-none ${base.input}`} placeholder="Ingredientes..." value={newPizzaDesc} onChange={e => setNewPizzaDesc(e.target.value)} />
                <div className="flex items-center gap-2 mb-4">
                    <span className={`text-sm ${base.subtext}`}>Stock (Pizzas):</span>
                    <input type="number" className={`p-2 rounded-xl border w-20 text-center ${base.input}`} value={newPizzaStock} onChange={e => setNewPizzaStock(parseInt(e.target.value))} />
                </div>
                <button onClick={addPizza} className={`w-full ${currentTheme.color} text-white font-bold py-4 rounded-2xl`}>AGREGAR</button>
            </div>
            <div className="space-y-4">
                {pizzas.map(p => (
                    <div key={p.id} className={`p-4 rounded-3xl border flex flex-col gap-3 ${base.card}`}>
                        <div className="flex justify-between items-start gap-3">
                            <input value={p.nombre} onChange={e => updatePizzaConfig(p.id, 'nombre', e.target.value)} className="bg-transparent font-bold text-xl outline-none w-full border-b border-transparent focus:border-neutral-500" />
                            <div className="flex gap-2">
                                <button onClick={() => updatePizzaConfig(p.id, 'activa', !p.activa)} className={`p-2 rounded-xl ${p.activa ? base.buttonSec : 'bg-black text-neutral-600'}`}>{p.activa ? <Eye size={18}/> : <EyeOff size={18}/>}</button>
                                <button onClick={() => deletePizza(p.id)} className="p-2 bg-red-900/10 text-red-500 rounded-xl"><Trash2 size={18}/></button>
                            </div>
                        </div>
                        <textarea value={p.descripcion || ''} onChange={e => updatePizzaConfig(p.id, 'descripcion', e.target.value)} className={`w-full p-2 rounded-xl text-sm outline-none resize-none h-16 ${base.input} opacity-80`} placeholder="Descripción..." />
                        <div className="flex gap-2">
                            <div className={`flex-1 flex items-center justify-between text-sm p-3 rounded-xl border ${base.input}`}>
                                <span>Corte:</span>
                                <select value={p.porciones_individuales || ''} onChange={e => updatePizzaConfig(p.id, 'porciones_individuales', e.target.value ? parseInt(e.target.value) : null)} className={`p-1 px-3 rounded-lg border outline-none ${base.input}`}>
                                    <option value="">Global ({config.porciones_por_pizza})</option>
                                    <option value="4">4</option>
                                    <option value="6">6</option>
                                    <option value="8">8</option>
                                    <option value="10">10</option>
                                </select>
                            </div>
                            <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm ${base.input}`}>
                                <span>Stock:</span>
                                <input type="number" value={p.stock || 0} onChange={e => updatePizzaConfig(p.id, 'stock', parseInt(e.target.value))} className={`p-1 w-12 text-center rounded-lg border ${base.input}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* VISTA USUARIOS */}
        {view === 'usuarios' && (
            <div className="space-y-6">
                <div className={`p-6 rounded-3xl border ${base.card}`}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${base.subtext}`}><Users size={18}/> Gestión de Comensales Activos</h3>
                    <p className={`text-xs ${base.subtext} mb-4`}>Aquí puedes bloquear el acceso o resetear pedidos de usuarios que ya han ingresado.</p>
                </div>
                <div className="space-y-2">
                    {Array.from(new Set([...pedidos.map(p => p.invitado_nombre), ...invitadosDB.map(u => u.nombre)])).map(nombre => {
                        const userDB = invitadosDB.find(u => u.nombre.toLowerCase() === nombre.toLowerCase());
                        const isBlocked = userDB?.bloqueado;
                        return (
                            <div key={nombre} className={`p-4 rounded-2xl border flex justify-between items-center ${isBlocked ? base.blocked : base.card}`}>
                                <span className={`font-bold ${isBlocked ? 'text-red-500 line-through' : base.text}`}>{nombre}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => resetUsuario(nombre)} title="Resetear Pedidos" className={`p-2 rounded-xl ${base.buttonSec} text-yellow-500`}><RotateCcw size={16}/></button>
                                    <button onClick={() => bloquearNombre(nombre, userDB)} title={isBlocked ? "Desbloquear" : "Bloquear"} className={`p-2 rounded-xl ${isBlocked ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>{isBlocked ? <CheckCircle size={16}/> : <Ban size={16}/>}</button>
                                    <button onClick={() => eliminarUsuario(nombre, userDB)} title="Eliminar Usuario" className={`p-2 rounded-xl ${base.buttonSec} hover:text-red-500`}><Trash2 size={16}/></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* VISTA CONFIGURACIÓN */}
        {view === 'config' && (
          <div className={`p-6 rounded-3xl border space-y-6 ${base.card}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${base.subtext}`}><Settings size={18}/> Ajustes Globales</h3>
            <div className="flex justify-between items-center">
                <label className={`text-sm ${base.subtext}`}>Porciones Estándar</label>
                <select value={config.porciones_por_pizza} onChange={async e => {const v = parseInt(e.target.value); setConfig({...config, porciones_por_pizza: v}); await supabase.from('configuracion_dia').update({ porciones_por_pizza: v }).eq('id', config.id);}} className={`p-3 rounded-xl border outline-none w-24 ${base.input}`}>
                    <option value="4">4</option>
                    <option value="6">6</option>
                    <option value="8">8</option>
                </select>
            </div>
            <div className="flex justify-between items-center">
                <label className={`text-sm ${base.subtext}`}>Total Invitados</label>
                <input type="number" value={config.total_invitados} onChange={async e => {const v = parseInt(e.target.value); setConfig({...config, total_invitados: v}); await supabase.from('configuracion_dia').update({ total_invitados: v }).eq('id', config.id);}} className={`p-3 rounded-xl border w-24 text-center ${base.input}`} />
            </div>
            
            <div className={`border-t pt-4 ${base.divider}`}>
                <label className={`text-sm font-bold flex items-center gap-2 mb-2 ${base.text}`}><KeyRound size={16}/> Contraseña del Día</label>
                <p className={`text-[10px] mb-2 ${base.subtext}`}>Si está vacía, el acceso es libre.</p>
                <div className="flex gap-2">
                    <input type="text" placeholder="Ej: pizza2024" value={config.password_invitados || ''} onChange={e => setConfig({...config, password_invitados: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} />
                    <button onClick={async () => { await supabase.from('configuracion_dia').update({ password_invitados: config.password_invitados }).eq('id', config.id); alert('Guardado'); }} className={`font-bold px-4 rounded-xl ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>OK</button>
                </div>
            </div>

            <div className={`border-t pt-4 ${base.divider}`}>
                <label className={`text-sm mb-2 block ${base.subtext}`}>Cambiar Contraseña Admin</label>
                <div className="flex flex-col gap-3">
                    <input type="password" placeholder="Nueva contraseña" value={newPass} onChange={e => setNewPass(e.target.value)} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} />
                    <input type="password" placeholder="Confirmar contraseña" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={`w-full p-3 rounded-xl border outline-none ${base.input}`} />
                    <button onClick={changePassword} className={`w-full font-bold py-3 rounded-xl ${isDarkMode ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}>GUARDAR</button>
                </div>
            </div>
          </div>
        )}
      </main>

      <nav className={`fixed bottom-0 w-full backdrop-blur-md border-t flex justify-around p-4 pb-8 z-50 ${base.nav}`}>
          <button onClick={() => setView('cocina')} className={`flex flex-col items-center gap-1 ${view === 'cocina' ? currentTheme.text : base.subtext}`}><LayoutDashboard size={24} /><span className="text-[9px] uppercase font-bold">Cocina</span></button>
          <button onClick={() => setView('pedidos')} className={`flex flex-col items-center gap-1 ${view === 'pedidos' ? currentTheme.text : base.subtext}`}><List size={24} /><span className="text-[9px] uppercase font-bold">Pedidos</span></button>
          <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-1 ${view === 'menu' ? currentTheme.text : base.subtext}`}><ChefHat size={24} /><span className="text-[9px] uppercase font-bold">Menú</span></button>
          <button onClick={() => setView('usuarios')} className={`flex flex-col items-center gap-1 ${view === 'usuarios' ? currentTheme.text : base.subtext}`}><Users size={24} /><span className="text-[9px] uppercase font-bold">Usuarios</span></button>
          <button onClick={() => setView('config')} className={`flex flex-col items-center gap-1 ${view === 'config' ? currentTheme.text : base.subtext}`}><Settings size={24} /><span className="text-[9px] uppercase font-bold">Ajustes</span></button>
      </nav>
    </div>
  );
}