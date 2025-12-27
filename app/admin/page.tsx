'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Pizza, Settings, Plus, Trash2, ChefHat, Eye, EyeOff, CheckCircle, 
  Clock, Flame, LogOut, List, User, Bell, ArrowRight, ArrowDownAZ, 
  ArrowUpNarrowWide, Maximize2, Minimize2, Users, Ban, RotateCcw, 
  KeyRound, LayoutDashboard, XCircle, Sun, Moon, BarChart3, Star, MessageSquare, Palette, Save 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const THEMES = [
  { name: 'Carbone', color: 'bg-neutral-600', gradient: 'from-neutral-700 to-neutral-900', text: 'text-neutral-400' },
  { name: 'Turquesa', color: 'bg-cyan-600', gradient: 'from-cyan-600 to-teal-900', text: 'text-cyan-400' },
  { name: 'Pistacho', color: 'bg-lime-600', gradient: 'from-lime-600 to-green-900', text: 'text-lime-400' },
  { name: 'Fuego', color: 'bg-red-600', gradient: 'from-red-600 to-rose-900', text: 'text-red-500' },
  { name: 'Violeta', color: 'bg-violet-600', gradient: 'from-violet-600 to-purple-900', text: 'text-violet-400' },
];

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'cocina' | 'pedidos' | 'menu' | 'usuarios' | 'config' | 'ranking'>('cocina');
  
  const [pedidos, setPedidos] = useState<any[]>([]); 
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [invitadosDB, setInvitadosDB] = useState<any[]>([]); 
  const [valoraciones, setValoraciones] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ porciones_por_pizza: 4, total_invitados: 10, password_invitados: '' });
  const [invitadosCount, setInvitadosCount] = useState(0);
  const prevPedidosCount = useRef(0);
  
  const [newPizzaName, setNewPizzaName] = useState('');
  const [newPizzaDesc, setNewPizzaDesc] = useState('');
  const [newPizzaStock, setNewPizzaStock] = useState(5);
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
      buttonSec: "bg-neutral-800 text-neutral-400 hover:text-white border-white/10",
      buttonIcon: "bg-neutral-800 text-neutral-400 hover:text-white", 
      divider: "border-neutral-800",
      metric: "bg-neutral-900 border-neutral-800",
      blocked: "bg-red-900/10 border-red-900/30",
      bar: "bg-neutral-900/50 backdrop-blur-md border-white/10 shadow-lg text-white border"
  } : {
      bg: "bg-gray-100 text-gray-900",
      card: "bg-white border-gray-200 shadow-sm",
      input: "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
      header: "bg-white/90 border-gray-200",
      subtext: "text-gray-500",
      buttonSec: "bg-white text-gray-600 hover:text-black border-gray-300",
      buttonIcon: "bg-gray-200 text-gray-600 hover:text-black",
      divider: "border-gray-200",
      metric: "bg-white border-gray-200 shadow-sm",
      blocked: "bg-red-50 border-red-200",
      bar: "bg-white/50 backdrop-blur-md border-gray-300 shadow-lg text-gray-900 border"
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
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') Notification.requestPermission();
    if (autenticado) {
      cargarDatos();
      const channel = supabase.channel('admin-realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => cargarDatos()).subscribe();
      return () => { supabase.removeChannel(channel); };
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
    const { data: dP } = await supabase.from('menu_pizzas').select('*').order('created_at'); if (dP) setPizzas(dP);
    const { data: dPed } = await supabase.from('pedidos').select('*').gte('created_at', iso).order('created_at', { ascending: true });
    if (dPed) { setPedidos(dPed); setInvitadosCount(new Set(dPed.map(p => p.invitado_nombre.toLowerCase())).size); if (prevPedidosCount.current > 0 && dPed.length > prevPedidosCount.current) new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{}); prevPedidosCount.current = dPed.length; }
    const { data: dI } = await supabase.from('lista_invitados').select('*').order('nombre'); if (dI) setInvitadosDB(dI);
    const { data: dC } = await supabase.from('configuracion_dia').select('*').single(); if (dC) setConfig(dC);
    const { data: dV } = await supabase.from('valoraciones').select('*').gte('created_at', iso).order('created_at', { ascending: false }); if (dV) setValoraciones(dV);
  };

  const metricas = useMemo(() => {
      const lista = pizzas.filter(p => p.activa).map(pizza => {
        const pendientes = pedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado');
        const totalPendientes = pendientes.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
        const target = pizza.porciones_individuales || config.porciones_por_pizza;
        const totalStock = (pizza.stock || 0) * target;
        const pedidosTotales = pedidos.filter(p => p.pizza_id === pizza.id).reduce((acc, c) => acc + c.cantidad_porciones, 0);
        return { ...pizza, totalPendientes, completas: Math.floor(totalPendientes / target), faltan: target - (totalPendientes % target), target, percent: ((totalPendientes % target) / target) * 100, pedidosPendientes: pendientes, stockRestante: Math.max(0, totalStock - pedidosTotales) };
      });
      return lista.sort((a, b) => {
          if (orden === 'estado') {
              if (a.cocinando && !b.cocinando) return -1; if (!a.cocinando && b.cocinando) return 1;
              if (a.totalPendientes > 0 && b.totalPendientes === 0) return -1; if (a.totalPendientes === 0 && b.totalPendientes > 0) return 1;
              return a.nombre.localeCompare(b.nombre);
          }
          return a.nombre.localeCompare(b.nombre);
      });
  }, [pizzas, pedidos, config, orden]);

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
          const ped = susPedidos.filter(p => p.pizza_id === pz.id); if (ped.length === 0) return null;
          const entr = ped.filter(p => p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0);
          const pend = ped.filter(p => p.estado === 'pendiente').reduce((acc, c) => acc + c.cantidad_porciones, 0);
          return { id: pz.id, nombre: pz.nombre, entregada: entr, enHorno: pz.cocinando ? pend : 0, enEspera: pz.cocinando ? 0 : pend };
      }).filter(Boolean);
      
      // NUEVO: Calcular totales para badges
      const totalEnHorno = detalle.reduce((acc, d) => acc + (d?.enHorno || 0), 0);
      const totalEnEspera = detalle.reduce((acc, d) => acc + (d?.enEspera || 0), 0);
      const totalPendienteGeneral = totalEnHorno + totalEnEspera; // Para el sort

      return { nombre: nombreReal, detalle, totalPendienteGeneral, totalEnHorno, totalEnEspera };
  }).sort((a, b) => b.totalPendienteGeneral - a.totalPendienteGeneral);

  const ranking = useMemo(() => {
      return pizzas.map(p => {
          const vals = valoraciones.filter(v => v.pizza_id === p.id);
          const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b.rating, 0) / vals.length) : 0;
          const orders = pedidos.filter(ped => ped.pizza_id === p.id).reduce((acc, c) => acc + c.cantidad_porciones, 0);
          return { ...p, avg: parseFloat(avg.toFixed(1)), count: vals.length, totalOrders: orders };
      }).sort((a, b) => b.avg - a.avg);
  }, [pizzas, valoraciones, pedidos]);

  const allUsersList = useMemo(() => {
      const map = new Map();
      invitadosDB.forEach(u => map.set(u.nombre.toLowerCase(), { ...u, source: 'db' }));
      pedidos.forEach(p => { if (!map.has(p.invitado_nombre.toLowerCase())) map.set(p.invitado_nombre.toLowerCase(), { id: null, nombre: p.invitado_nombre, bloqueado: false, source: 'ped' }); });
      return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [invitadosDB, pedidos]);

  const eliminarUsuario = async (nombre: string, userDB: any) => { if(confirm(`¿ELIMINAR a ${nombre}?`)) { if(userDB?.id) await supabase.from('lista_invitados').delete().eq('id', userDB.id); const ids = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre.toLowerCase()).map(p => p.id); if(ids.length) await supabase.from('pedidos').delete().in('id', ids); cargarDatos(); } };
  const eliminarPedidosGusto = async (nom: string, pid: string) => { if(confirm(`¿Borrar pendientes?`)) { const ids = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nom.toLowerCase() && p.pizza_id === pid && p.estado === 'pendiente').map(p => p.id); if(ids.length) await supabase.from('pedidos').delete().in('id', ids); cargarDatos(); } };
  const toggleCocinando = async (p: any) => { if(!p.cocinando && p.totalPendientes < p.target) { alert("Falta para 1 pizza"); return; } await supabase.from('menu_pizzas').update({ cocinando: !p.cocinando }).eq('id', p.id); setPizzas(prev => prev.map(i => i.id === p.id ? { ...i, cocinando: !p.cocinando } : i)); };
  const entregar = async (p: any) => { if(!confirm(`¿Salió ${p.nombre}?`)) return; let n = p.target; const ids=[]; for(const pd of p.pedidosPendientes){ if(n<=0) break; ids.push(pd.id); n-=pd.cantidad_porciones; } if(ids.length) { await supabase.from('pedidos').update({ estado: 'entregado' }).in('id', ids); await supabase.from('menu_pizzas').update({ cocinando: false }).eq('id', p.id); cargarDatos(); } };
  const updateP = async (id: string, f: string, v: any) => { setPizzas(p => p.map(i => i.id === id ? { ...i, [f]: v } : i)); await supabase.from('menu_pizzas').update({[f]: v}).eq('id', id); };
  const addP = async () => { if(!newPizzaName) return; await supabase.from('menu_pizzas').insert([{ nombre: newPizzaName, descripcion: newPizzaDesc, stock: newPizzaStock, activa: true }]); setNewPizzaName(''); setNewPizzaDesc(''); setNewPizzaStock(5); cargarDatos(); };
  const delP = async (id: string) => { if(confirm('¿Borrar?')) await supabase.from('menu_pizzas').delete().eq('id', id); cargarDatos(); };
  const changePass = async () => { if(!newPass) return; await supabase.from('configuracion_dia').update({password_admin: newPass}).eq('id', config.id); alert('OK'); setNewPass(''); };
  const addU = async () => { if(!newGuestName) return; const { error } = await supabase.from('lista_invitados').insert([{ nombre: newGuestName }]); if(error) alert('Error'); else { setNewGuestName(''); cargarDatos(); } };
  const toggleB = async (u: any) => { let uid = u.id; if(!uid) { const { data } = await supabase.from('lista_invitados').insert([{ nombre: u.nombre }]).select().single(); if(data) uid = data.id; else return; } await supabase.from('lista_invitados').update({ bloqueado: !u.bloqueado }).eq('id', uid); cargarDatos(); };
  
  const guardarMotivo = async (nombre: string, u: any) => {
      const motivo = tempMotivos[nombre];
      if (motivo === undefined) return; 

      let uid = u?.id;
      if (!uid) {
          const { data, error } = await supabase.from('lista_invitados').insert([{ nombre: nombre, motivo_bloqueo: motivo, bloqueado: true }]).select().single();
          if (error || !data) { alert("Error al guardar usuario."); return; }
      } else {
          await supabase.from('lista_invitados').update({ motivo_bloqueo: motivo }).eq('id', uid);
      }
      alert("Motivo guardado correctamente");
      cargarDatos();
  };

  const resetU = async (nom: string) => { if(confirm(`¿Reset pedidos de ${nom}?`)) { const ids = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nom.toLowerCase()).map(p => p.id); if(ids.length) await supabase.from('pedidos').delete().in('id', ids); cargarDatos(); } };
  const delVal = async (id: string) => { if(confirm("¿Borrar reseña?")) { await supabase.from('valoraciones').delete().eq('id', id); cargarDatos(); } };
  const delValPizza = async (pid: string) => { if(confirm("¿Borrar reseñas de esta pizza?")) { await supabase.from('valoraciones').delete().eq('pizza_id', pid); cargarDatos(); } };
  const delAllVal = async () => { if(prompt("Escribe BORRAR") === 'BORRAR') { const { data } = await supabase.from('valoraciones').select('id'); const ids = data?.map(v => v.id) || []; if(ids.length) await supabase.from('valoraciones').delete().in('id', ids); cargarDatos(); } };

  if (!autenticado) return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${base.bg}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-xl ${base.card}`}>
        <div className="flex justify-center mb-6"><img src="/logo.png" alt="Logo" className="h-48 w-auto object-contain drop-shadow-xl" /></div>
        <form onSubmit={ingresar} className="flex flex-col gap-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full p-4 rounded-xl border outline-none ${base.input}`} placeholder="Contraseña..." autoFocus />
            <button type="submit" className={`w-full ${currentTheme.color} text-white font-bold py-4 rounded-xl hover:opacity-90 transition`}>ENTRAR</button>
        </form>
        <div className={`mt-8 text-center pt-6 border-t ${base.divider}`}><button onClick={() => window.location.href='/'} className={`text-sm hover:underline flex items-center justify-center gap-2 w-full py-3 ${base.subtext}`}><ArrowRight size={16}/> Ir a Invitados</button></div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans pb-28 w-full ${base.bg}`}>
      
      <div className={`w-full h-40 rounded-b-[40px] bg-gradient-to-br ${currentTheme.gradient} shadow-xl absolute top-0 left-0 z-0`}></div>

      <div className={`fixed top-4 left-4 right-4 z-50 rounded-2xl p-2 flex justify-between items-center shadow-lg backdrop-blur-md border ${base.bar}`}>
          <div className="flex items-center gap-3 pl-2">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
              <div className="leading-tight">
                  <h1 className="font-bold text-sm">Modo Pizzaiolo</h1>
                  <p className="text-[10px] opacity-70">{invitadosCount} / {config.total_invitados} comensales</p>
              </div>
          </div>

          <div className="flex gap-2 relative pr-1">
              <button onClick={() => setShowThemeSelector(!showThemeSelector)} className={`p-2 rounded-full border ${base.buttonSec}`}><Palette size={16}/></button>
              {showThemeSelector && (
                  <div className="absolute top-12 right-0 bg-black/90 backdrop-blur p-2 rounded-xl flex gap-2 animate-in fade-in z-50 border border-white/10 shadow-xl">
                      {THEMES.map(t => (<button key={t.name} onClick={() => selectTheme(t)} className={`w-6 h-6 rounded-full ${t.color} border-2 border-white ring-2 ring-transparent hover:scale-110 transition-transform`}></button>))}
                  </div>
              )}
              <button onClick={toggleDarkMode} className={`p-2 rounded-full border ${base.buttonSec}`}>{isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}</button>
              {view === 'cocina' && (<><button onClick={toggleOrden} className={`p-2 rounded-full border flex items-center gap-1 ${base.buttonSec}`}>{orden === 'estado' ? <ArrowUpNarrowWide size={16}/> : <ArrowDownAZ size={16}/>}</button><button onClick={toggleCompact} className={`p-2 rounded-full border flex items-center gap-1 ${base.buttonSec}`}>{isCompact ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}</button></>)}
              <button onClick={() => window.location.href='/'} className={`p-2 rounded-full border ${base.buttonSec} ml-1`}><LogOut size={16} /></button>
          </div>
      </div>

      <div className="relative z-10 pt-24 px-4">
        {view === 'cocina' && (
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`p-3 rounded-2xl border ${base.metric}`}><h4 className={`text-[10px] font-bold uppercase mb-2 text-center border-b pb-1 ${base.divider} ${base.subtext}`}>PIZZAS (Enteras)</h4><div className="grid grid-cols-2 gap-2"><div className="text-center"><p className={`text-[9px] uppercase font-bold ${base.subtext}`}>En Curso</p><p className="text-xl font-bold">{stats.pizzasIncompletas}</p></div><div className="text-center"><p className={`text-[9px] uppercase font-bold ${base.subtext}`}>Entregadas</p><p className="text-xl font-bold">{stats.totalPizzasEntregadas}</p></div></div></div>
                <div className={`p-3 rounded-2xl border ${base.metric}`}><h4 className={`text-[10px] font-bold uppercase mb-2 text-center border-b pb-1 ${base.divider} ${base.subtext}`}>PORCIONES</h4><div className="grid grid-cols-2 gap-2"><div className="text-center"><p className={`text-[9px] uppercase font-bold ${base.subtext}`}>Pedidas</p><p className="text-xl font-bold">{stats.totalPendientes}</p></div><div className="text-center"><p className={`text-[9px] uppercase font-bold ${base.subtext}`}>En Stock</p><p className="text-xl font-bold">{stats.totalStockPorciones}</p></div></div></div>
            </div>
        )}

        <main className="max-w-4xl mx-auto space-y-4 w-full">
            {view === 'cocina' && (<div className="grid gap-3">{metricas.map(p => (<div key={p.id} className={`${base.card} rounded-3xl border relative overflow-hidden transition-all ${p.cocinando ? 'border-red-600/50 shadow-lg' : ''} ${isCompact ? 'p-3' : 'p-5'}`}>{!isCompact && p.cocinando && (<div className="absolute -right-10 -bottom-10 text-red-600/20"><Flame size={150} /></div>)}<div className="flex justify-between items-start mb-2 relative z-10"><div><h3 className={`font-bold flex items-center gap-2 ${isCompact ? 'text-base' : 'text-xl'}`}>{p.nombre}{p.cocinando && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">EN HORNO</span>}</h3><p className={`text-xs ${base.subtext} flex items-center gap-1 mt-1`}><Clock size={12}/> Pendientes: {p.totalPendientes}</p><p className={`text-[10px] mt-1 font-mono ${p.stockRestante === 0 ? 'text-red-500 font-bold' : base.subtext}`}>Stock: {p.stockRestante} porc.</p></div><button onClick={() => toggleCocinando(p)} className={`rounded-xl transition-all flex items-center justify-center ${p.cocinando ? 'bg-red-600 text-white shadow-lg scale-105' : base.buttonSec} ${isCompact ? 'p-2' : 'p-3'}`}><Flame size={isCompact ? 16 : 20} className={p.cocinando ? 'animate-bounce' : ''} /></button></div><div className={`relative ${isDarkMode ? 'bg-black' : 'bg-gray-300'} rounded-full overflow-hidden z-10 mb-3 ${isCompact ? 'h-2' : 'h-4'}`}><div className="absolute inset-0 flex justify-between px-[1px] z-20">{[...Array(p.target)].map((_, i) => <div key={i} className={`w-[1px] h-full ${isDarkMode ? 'bg-white/10' : 'bg-white/50'}`}></div>)}</div><div className={`absolute h-full ${p.cocinando ? 'bg-red-600' : currentTheme.color} transition-all duration-700`} style={{ width: `${p.percent}%` }}></div></div>{p.completas > 0 ? (<button onClick={() => entregar(p)} className={`w-full ${currentTheme.color} text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 ${isCompact ? 'py-2 text-sm' : 'py-3'}`}><CheckCircle size={isCompact ? 16 : 20} /> ¡PIZZA LISTA! ({p.completas})</button>) : (<div className={`w-full text-center text-xs ${base.subtext} font-mono border rounded-xl ${isDarkMode ? 'border-neutral-800' : 'border-gray-200'} ${isCompact ? 'py-1' : 'py-2'}`}>Faltan {p.faltan} porc.</div>)}</div>))}</div>)}
            
            {view === 'pedidos' && (
                <div className="space-y-4">
                    <h2 className={`text-sm font-bold uppercase tracking-widest mb-2 ${base.subtext}`}>Pedidos Activos</h2>
                    {pedidosAgrupados.length === 0 ? <p className={`text-center ${base.subtext}`}>Sin pedidos.</p> : pedidosAgrupados.map((u, i) => { 
                        const userDB = invitadosDB.find(x => x.nombre.toLowerCase() === u.nombre.toLowerCase()); 
                        return (
                            <div key={i} className={`${base.card} p-4 rounded-2xl border relative`}>
                                <button onClick={() => eliminarUsuario(u.nombre, userDB)} className={`absolute top-4 right-4 p-2 rounded-lg ${base.buttonIcon} hover:text-red-500`}><Trash2 size={16} /></button>
                                <div className={`flex justify-between border-b pb-2 mb-3 pr-10 ${base.divider}`}>
                                    <h3 className="font-bold flex items-center gap-2 capitalize text-lg">
                                        <User size={18}/> {u.nombre}
                                        {/* BADGES DE ESTADO CORREGIDOS */}
                                        {u.totalEnHorno > 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">EN HORNO</span>}
                                        {u.totalEnEspera > 0 && <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">ESPERANDO</span>}
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    {u.detalle.map((d: any, k: number) => (
                                        <div key={k} className={`flex justify-between items-center text-sm p-2 rounded-lg border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                            <span>{d.nombre}</span>
                                            <div className="flex items-center gap-2 text-xs font-bold">
                                                {d.enHorno > 0 && (<span className="text-red-500 flex items-center gap-1"><Flame size={12}/> {d.enHorno}</span>)}
                                                {d.enEspera > 0 && (<span className="text-yellow-500 flex items-center gap-1"><Clock size={12}/> {d.enEspera}</span>)}
                                                {d.entregada > 0 && (<span className="text-green-500 flex items-center gap-1"><CheckCircle size={12}/> {d.entregada}</span>)}
                                                <button onClick={(e) => { e.stopPropagation(); eliminarPedidosGusto(u.nombre, d.id); }} className="p-1 ml-2 bg-red-900/20 text-red-500 rounded hover:bg-red-900/40 border border-red-900/30"><XCircle size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ); 
                    })}
                </div>
            )}

            {view === 'menu' && (<div className="space-y-6"><div className={`p-6 rounded-3xl border ${base.card}`}><h3 className={`font-bold mb-4 flex items-center gap-2 ${base.subtext}`}><Plus size={18}/> Nueva Pizza</h3><input className={`w-full p-4 rounded-2xl border mb-2 outline-none ${base.input}`} placeholder="Nombre..." value={newPizzaName} onChange={e => setNewPizzaName(e.target.value)} /><textarea className={`w-full p-4 rounded-2xl border mb-4 text-sm outline-none ${base.input}`} placeholder="Ingredientes..." value={newPizzaDesc} onChange={e => setNewPizzaDesc(e.target.value)} /><div className="flex items-center gap-2 mb-4"><span className={`text-sm ${base.subtext}`}>Stock:</span><input type="number" className={`p-2 rounded-xl border w-20 text-center ${base.input}`} value={newPizzaStock} onChange={e => setNewPizzaStock(parseInt(e.target.value))} /></div><button onClick={addP} className={`w-full ${currentTheme.color} text-white font-bold py-4 rounded-2xl`}>AGREGAR</button></div><div className="space-y-4">{pizzas.map(p => (<div key={p.id} className={`p-4 rounded-3xl border flex flex-col gap-3 ${base.card}`}><div className="flex justify-between items-start gap-3"><input value={p.nombre} onChange={e => updateP(p.id, 'nombre', e.target.value)} className="bg-transparent font-bold text-xl outline-none w-full border-b border-transparent focus:border-gray-500" /><div className="flex gap-2"><button onClick={() => updateP(p.id, 'activa', !p.activa)} className={`p-2 rounded-xl ${p.activa ? base.buttonSec : 'bg-black text-neutral-600'}`}>{p.activa ? <Eye size={18}/> : <EyeOff size={18}/>}</button><button onClick={() => delP(p.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-xl"><Trash2 size={18}/></button></div></div><textarea value={p.descripcion || ''} onChange={e => updateP(p.id, 'descripcion', e.target.value)} className={`w-full p-2 rounded-xl text-sm outline-none resize-none h-16 ${base.input} opacity-80`} /><div className="flex gap-2"><div className={`flex-1 flex items-center justify-between text-sm p-3 rounded-xl border ${base.input}`}><span>Corte:</span><select value={p.porciones_individuales || ''} onChange={e => updateP(p.id, 'porciones_individuales', e.target.value ? parseInt(e.target.value) : null)} className={`p-1 px-3 rounded-lg border outline-none ${base.input}`}><option value="">Global ({config.porciones_por_pizza})</option><option value="4">4</option><option value="6">6</option><option value="8">8</option><option value="10">10</option></select></div><div className={`flex items-center gap-2 p-3 rounded-xl border text-sm ${base.input}`}><span>Stock:</span><input type="number" value={p.stock || 0} onChange={e => updateP(p.id, 'stock', parseInt(e.target.value))} className={`p-1 w-12 text-center rounded-lg border ${base.input}`} /></div></div></div>))}</div></div>)}

            {view === 'ranking' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className={`font-bold uppercase tracking-widest text-sm ${base.subtext}`}>Ranking & Feedback</h3>
                        <button onClick={delAllVal} className="text-[10px] bg-red-900/30 text-red-500 px-3 py-1 rounded-full border border-red-900/50 hover:bg-red-900/50 transition-colors">RESET ALL</button>
                    </div>
                    <div className="grid gap-3">
                        {ranking.map(p => (
                            <div key={p.id} className={`p-3 rounded-2xl border flex justify-between items-center ${base.card}`}>
                                <div className="flex items-center gap-3">
                                    <div className="text-center w-12"><div className="text-xl font-bold text-yellow-500 flex justify-center items-center gap-0.5">{p.avg} <Star size={12} fill="currentColor"/></div><div className={`text-[9px] ${base.subtext}`}>{p.count} votes</div></div>
                                    <div><div className="font-bold text-sm">{p.nombre}</div><div className={`text-[10px] ${base.subtext}`}>{p.totalOrders} porciones</div></div>
                                </div>
                                <button onClick={() => delValPizza(p.id)} className="p-2 text-neutral-500 hover:text-red-500 transition-colors" title="Reset pizza"><RotateCcw size={16} /></button>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4 mt-6">
                        <h3 className={`font-bold text-sm uppercase tracking-widest ${base.subtext}`}>Últimos Comentarios</h3>
                        {valoraciones.length === 0 ? <p className={`text-center text-xs ${base.subtext}`}>Sin valoraciones.</p> : valoraciones.map((v, i) => (
                            <div key={i} className={`p-4 rounded-2xl border ${base.card} relative group`}>
                                <button onClick={() => delVal(v.id)} className="absolute top-4 right-4 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                <div className="flex justify-between mb-2 pr-6"><span className="font-bold text-sm flex items-center gap-2"><User size={14}/> {v.invitado_nombre}</span><span className="text-xs text-yellow-500 font-bold flex items-center gap-1">{v.rating} <Star size={10} fill="currentColor"/></span></div>
                                <div className="text-xs mb-2 bg-black/20 p-1 px-2 rounded w-max border border-white/5 text-neutral-400">{pizzas.find(p => p.id === v.pizza_id)?.nombre || 'Pizza'}</div>
                                {v.comentario && <p className="text-sm italic opacity-80">"{v.comentario}"</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'usuarios' && (
                <div className="space-y-6">
                    <div className={`p-6 rounded-3xl border ${base.card}`}>
                        <h3 className={`font-bold mb-4 flex items-center gap-2 ${base.subtext}`}><Users size={18}/> Usuarios</h3>
                        <div className="flex gap-2"><input className={`w-full p-4 rounded-2xl border outline-none ${base.input}`} placeholder="Nombre..." value={newGuestName} onChange={e => setNewGuestName(e.target.value)} /><button onClick={addU} className={`${currentTheme.color} text-white font-bold px-6 rounded-2xl`}>CREAR</button></div>
                    </div>
                    <div className="space-y-2">
                        {allUsersList.map(u => (
                            <div key={u.nombre} className={`p-4 rounded-2xl border flex flex-col gap-2 ${u.bloqueado ? base.blocked : base.card}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2"><span className={`font-bold ${u.bloqueado ? 'text-red-500 line-through' : ''}`}>{u.nombre}</span>{u.origen === 'pedido' && <span className="text-[10px] bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/30">Guest</span>}</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => resetU(u.nombre)} className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl"><RotateCcw size={16}/></button>
                                        <button onClick={() => toggleB(u)} className={`p-2 rounded-xl ${u.bloqueado ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{u.bloqueado ? <CheckCircle size={16}/> : <Ban size={16}/>}</button>
                                        <button onClick={() => eliminarUsuario(u.nombre, u.origen === 'db' ? u : null)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                {u.bloqueado && (
                                    <div className="flex gap-2 mt-2">
                                        <input 
                                            className={`w-full p-2 rounded-lg text-sm outline-none border ${base.input} text-red-400`} 
                                            placeholder="Motivo..." 
                                            value={tempMotivos[u.nombre] !== undefined ? tempMotivos[u.nombre] : (u.motivo_bloqueo || '')} 
                                            onChange={(e) => setTempMotivos({ ...tempMotivos, [u.nombre]: e.target.value })}
                                        />
                                        <button 
                                            onClick={() => guardarMotivo(u.nombre, u)} 
                                            className="p-2 bg-neutral-800 text-white rounded-lg border border-white/10 hover:bg-neutral-700"
                                        >
                                            <Save size={16}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'config' && (
              <div className={`p-6 rounded-3xl border space-y-6 ${base.card}`}>
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${base.subtext}`}><Settings size={18}/> Ajustes Globales</h3>
                <div className="flex justify-between items-center"><label className={`text-sm ${base.subtext}`}>Modo Estricto</label><button onClick={async () => { const n = !config.modo_estricto; setConfig({...config, modo_estricto: n}); await supabase.from('configuracion_dia').update({ modo_estricto: n }).eq('id', config.id); }} className={`w-12 h-6 rounded-full transition-colors relative ${config.modo_estricto ? 'bg-green-600' : 'bg-gray-400'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${config.modo_estricto ? 'left-7' : 'left-1'}`}></div></button></div>
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
          <button onClick={() => setView('config')} className={`flex flex-col items-center gap-1 ${view === 'config' ? currentTheme.text : base.subtext}`}><Settings size={20} /><span className="text-[8px] uppercase font-bold">Ajustes</span></button>
      </div>
    </div>
  );
}