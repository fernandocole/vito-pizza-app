'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Pizza, Settings, Plus, Trash2, ChefHat, Eye, EyeOff, CheckCircle, 
  Clock, Flame, LogOut, List, User, Bell, ArrowRight, ArrowDownAZ, 
  ArrowUpNarrowWide, Maximize2, Minimize2, Users, Ban, RotateCcw, 
  KeyRound, LayoutDashboard, XCircle, Sun, Moon, BarChart3, Star, Palette, Save, UserCheck 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- COMPONENTE INTERNO PARA EL CRONÓMETRO ---
const Timer = ({ startTime }: { startTime: string }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setElapsed(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono text-[10px] bg-neutral-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/5 ml-2 text-neutral-500 dark:text-neutral-400">{elapsed}</span>;
};

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
    if (autenticado) {
      cargarDatos();
      const channel = supabase.channel('admin-realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => cargarDatos()).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [autenticado]);

  const cargarDatos = async () => {
    const now = new Date(); if (now.getHours() < 6) now.setDate(now.getDate() - 1); now.setHours(6, 0, 0, 0); const iso = now.toISOString();
    const { data: dP } = await supabase.from('menu_pizzas').select('*').order('created_at'); if (dP) setPizzas(dP);
    const { data: dPed } = await supabase.from('pedidos').select('*').gte('created_at', iso).order('created_at', { ascending: true });
    if (dPed) { setPedidos(dPed); setInvitadosCount(new Set(dPed.map(p => p.invitado_nombre.toLowerCase())).size); }
    const { data: dI } = await supabase.from('lista_invitados').select('*').order('nombre'); if (dI) setInvitadosDB(dI);
    const { data: dC } = await supabase.from('configuracion_dia').select('*').single(); if (dC) setConfig(dC);
  };

  // --- LÓGICA DE PEDIDOS AGRUPADOS CON TIEMPO ---
  const pedidosAgrupados = useMemo(() => {
    return Array.from(new Set(pedidos.map(p => p.invitado_nombre.toLowerCase()))).map(nombre => {
      const susPedidos = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre);
      const nombreReal = susPedidos[0]?.invitado_nombre || nombre;
      
      const detalle = pizzas.map(pz => {
        const pedsDeEstaPizza = susPedidos.filter(p => p.pizza_id === pz.id);
        if (pedsDeEstaPizza.length === 0) return null;

        const entregadas = pedsDeEstaPizza.filter(p => p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0);
        const pendientes = pedsDeEstaPizza.filter(p => p.estado === 'pendiente');
        const cantPendientes = pendientes.reduce((acc, c) => acc + c.cantidad_porciones, 0);

        // El pedido más antiguo de esta pizza para este usuario que aún no se entregó
        const oldestPending = pendientes.length > 0 ? pendientes[0].created_at : null;

        return { 
          id: pz.id, 
          nombre: pz.nombre, 
          entregada: entregadas, 
          pendiente: cantPendientes, 
          enHorno: pz.cocinando && cantPendientes > 0,
          oldestPending 
        };
      }).filter(Boolean);

      const totalPendiente = detalle.reduce((acc, d) => acc + (d?.pendiente || 0), 0);
      const algunEnHorno = detalle.some(d => d?.enHorno);

      return { nombre: nombreReal, detalle, totalPendiente, algunEnHorno };
    }).sort((a, b) => b.totalPendiente - a.totalPendiente);
  }, [pedidos, pizzas]);

  const ingresar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { data } = await supabase.from('configuracion_dia').select('*').single();
    if (data && data.password_admin === password) { setAutenticado(true); setConfig(data); } else { alert('Incorrecto'); }
  };

  const eliminarUsuario = async (nombre: string) => { 
    if(!confirm(`¿ELIMINAR a ${nombre}?`)) return;
    await supabase.from('pedidos').delete().eq('invitado_nombre', nombre); 
    cargarDatos(); 
  };

  const entregar = async (p: any) => { 
    // Lógica para entregar pizza desde la pestaña Cocina...
  };

  if (!autenticado) return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${base.bg}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-xl ${base.card}`}>
        <form onSubmit={ingresar} className="flex flex-col gap-4">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full p-4 rounded-xl border outline-none ${base.input}`} placeholder="Contraseña..." autoFocus />
          <button type="submit" className={`w-full ${currentTheme.color} text-white font-bold py-4 rounded-xl`}>ENTRAR</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans pb-28 w-full ${base.bg}`}>
      
      {/* HEADER */}
      <div className={`fixed top-4 left-4 right-4 z-50 rounded-2xl p-2 flex justify-between items-center shadow-lg backdrop-blur-md border ${base.bar}`}>
          <div className="flex items-center gap-3 pl-2">
              <h1 className="font-bold text-sm">Modo Pizzaiolo</h1>
          </div>
          <div className="flex gap-2">
              <button onClick={() => setView('cocina')} className={`p-2 rounded-xl ${view === 'cocina' ? currentTheme.color + ' text-white' : base.buttonSec}`}><LayoutDashboard size={18}/></button>
              <button onClick={() => setView('pedidos')} className={`p-2 rounded-xl ${view === 'pedidos' ? currentTheme.color + ' text-white' : base.buttonSec}`}><List size={18}/></button>
              <button onClick={() => window.location.href='/'} className={`p-2 rounded-xl ${base.buttonSec}`}><LogOut size={18} /></button>
          </div>
      </div>

      <div className="relative z-10 pt-24 px-4 max-w-4xl mx-auto">
        {view === 'pedidos' && (
          <div className="space-y-4">
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-2 ${base.subtext}`}>Pedidos por Comensal</h2>
            {pedidosAgrupados.map((u, i) => (
              <div key={i} className={`${base.card} p-4 rounded-2xl border relative`}>
                <button onClick={() => eliminarUsuario(u.nombre)} className={`absolute top-4 right-4 p-2 rounded-lg ${base.buttonIcon} hover:text-red-500`}><Trash2 size={16} /></button>
                <div className={`flex justify-between border-b pb-2 mb-3 pr-10 ${base.divider}`}>
                    <h3 className="font-bold flex items-center gap-2 capitalize text-lg">
                        <User size={18}/> {u.nombre}
                        {u.algunEnHorno && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">EN HORNO</span>}
                    </h3>
                </div>
                <div className="space-y-2">
                    {u.detalle.map((d: any, k: number) => (
                        <div key={k} className={`flex justify-between items-center text-sm p-2 rounded-lg border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center">
                              <span className="font-medium">{d.nombre}</span>
                              {/* AQUÍ EL CRONÓMETRO: Solo si hay pendientes */}
                              {d.oldestPending && <Timer startTime={d.oldestPending} />}
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold">
                                {d.pendiente > 0 && (
                                    <span className={`${d.enHorno ? 'text-red-500' : 'text-orange-500'} flex items-center gap-1`}>
                                      {d.enHorno ? <Flame size={12}/> : <Clock size={12}/>} 
                                      {d.pendiente}
                                    </span>
                                )}
                                {d.entregada > 0 && (
                                    <span className="text-green-500 flex items-center gap-1">
                                      <CheckCircle size={12}/> {d.entregada}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* El resto de las vistas (Cocina, Menú, etc.) se mantienen igual... */}
      </div>
    </div>
  );
}
