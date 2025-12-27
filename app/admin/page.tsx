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
      setElapsed(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
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
  
  const [newPizzaName, setNewPizzaName] = useState('');
  const [newPizzaDesc, setNewPizzaDesc] = useState('');
  const [newPizzaStock, setNewPizzaStock] = useState(5);
  const [newGuestName, setNewGuestName] = useState('');
  const [tempMotivos, setTempMotivos] = useState<Record<string, string>>({});
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(THEMES[1]);

  const base = isDarkMode ? {
      bg: "bg-neutral-950 text-white",
      card: "bg-neutral-900 border-neutral-800",
      input: "bg-black border-neutral-700 text-white placeholder-neutral-600",
      subtext: "text-neutral-500",
      buttonSec: "bg-neutral-800 text-neutral-400 border-white/10",
      bar: "bg-neutral-900/50 backdrop-blur-md border-white/10 text-white border"
  } : {
      bg: "bg-gray-100 text-gray-900",
      card: "bg-white border-gray-200 shadow-sm",
      input: "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
      subtext: "text-gray-500",
      buttonSec: "bg-white text-gray-600 border-gray-300",
      bar: "bg-white/50 backdrop-blur-md border-gray-300 shadow-lg text-gray-900 border"
  };

  useEffect(() => {
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
    if (dPed) setPedidos(dPed);
    const { data: dI } = await supabase.from('lista_invitados').select('*').order('nombre'); if (dI) setInvitadosDB(dI);
    const { data: dV } = await supabase.from('valoraciones').select('*').gte('created_at', iso); if (dV) setValoraciones(dV);
    const { data: dC } = await supabase.from('configuracion_dia').select('*').single(); if (dC) setConfig(dC);
  };

  const ingresar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { data } = await supabase.from('configuracion_dia').select('*').single();
    if (data && data.password_admin === password) { setAutenticado(true); setConfig(data); } else { alert('Incorrecto'); }
  };

  const togglerCocinando = async (id: string, estado: boolean) => { await supabase.from('menu_pizzas').update({ cocinando: estado }).eq('id', id); };
  const eliminarPedido = async (id: string) => { await supabase.from('pedidos').delete().eq('id', id); };
  const entregarPedido = async (id: string) => { await supabase.from('pedidos').update({ estado: 'entregado' }).eq('id', id); };
  const togglePizzaActiva = async (id: string, act: boolean) => { await supabase.from('menu_pizzas').update({ activa: act }).eq('id', id); };
  
  const agregarPizza = async () => {
    if(!newPizzaName) return;
    await supabase.from('menu_pizzas').insert([{ nombre: newPizzaName, descripcion: newPizzaDesc, stock: newPizzaStock, activa: true }]);
    setNewPizzaName(''); setNewPizzaDesc('');
  };

  const eliminarPizzaTotal = async (id: string) => { if(confirm('¿Eliminar pizza del menú?')) await supabase.from('menu_pizzas').delete().eq('id', id); };

  const toggleBloqueo = async (id: string, bl: boolean) => {
    const motivo = tempMotivos[id] || '';
    await supabase.from('lista_invitados').update({ bloqueado: bl, motivo_bloqueo: motivo }).eq('id', id);
  };

  const agregarInvitado = async () => {
    if(!newGuestName) return;
    await supabase.from('lista_invitados').insert([{ nombre: newGuestName, bloqueado: false }]);
    setNewGuestName('');
  };

  const rankingData = useMemo(() => {
    return pizzas.map(p => {
      const pRats = valoraciones.filter(v => v.pizza_id === p.id);
      const avg = pRats.length > 0 ? (pRats.reduce((a, b) => a + b.rating, 0) / pRats.length).toFixed(1) : '0.0';
      return { ...p, avg, count: pRats.length, rats: pRats };
    }).sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));
  }, [pizzas, valoraciones]);

  const pedidosAgrupados = useMemo(() => {
    const nombres = Array.from(new Set(pedidos.map(p => p.invitado_nombre.toLowerCase())));
    return nombres.map(nombre => {
      const susPedidos = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre);
      const detalle = pizzas.map(pz => {
        const peds = susPedidos.filter(p => p.pizza_id === pz.id);
        if (peds.length === 0) return null;
        const pen = peds.filter(p => p.estado === 'pendiente');
        const ent = peds.filter(p => p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0);
        return { 
          nombre: pz.nombre, 
          entregado: ent, 
          pendiente: pen.reduce((acc, c) => acc + c.cantidad_porciones, 0),
          oldestPending: pen.length > 0 ? pen[0].created_at : null 
        };
      }).filter(Boolean);
      return { nombre: susPedidos[0].invitado_nombre, detalle };
    });
  }, [pedidos, pizzas]);

  if (!autenticado) return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${base.bg}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-xl ${base.card}`}>
        <h2 className="text-2xl font-bold mb-6 text-center">Panel Admin</h2>
        <form onSubmit={ingresar} className="flex flex-col gap-4">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full p-4 rounded-xl border outline-none ${base.input}`} placeholder="Contraseña..." autoFocus />
          <button type="submit" className={`w-full bg-cyan-600 text-white font-bold py-4 rounded-xl`}>ENTRAR</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans pb-28 w-full ${base.bg}`}>
      
      {/* HEADER NAV */}
      <div className={`fixed top-4 left-4 right-4 z-50 rounded-2xl p-2 flex justify-between items-center shadow-lg backdrop-blur-md border ${base.bar}`}>
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
              <button onClick={() => setView('cocina')} className={`p-2 rounded-xl ${view === 'cocina' ? 'bg-cyan-600 text-white' : base.buttonSec}`}><ChefHat size={18}/></button>
              <button onClick={() => setView('pedidos')} className={`p-2 rounded-xl ${view === 'pedidos' ? 'bg-cyan-600 text-white' : base.buttonSec}`}><List size={18}/></button>
              <button onClick={() => setView('menu')} className={`p-2 rounded-xl ${view === 'menu' ? 'bg-cyan-600 text-white' : base.buttonSec}`}><Pizza size={18}/></button>
              <button onClick={() => setView('usuarios')} className={`p-2 rounded-xl ${view === 'usuarios' ? 'bg-cyan-600 text-white' : base.buttonSec}`}><Users size={18}/></button>
              <button onClick={() => setView('ranking')} className={`p-2 rounded-xl ${view === 'ranking' ? 'bg-cyan-600 text-white' : base.buttonSec}`}><BarChart3 size={18}/></button>
              <button onClick={() => setView('config')} className={`p-2 rounded-xl ${view === 'config' ? 'bg-cyan-600 text-white' : base.buttonSec}`}><Settings size={18}/></button>
          </div>
          <button onClick={() => window.location.href='/'} className={`p-2 rounded-xl ${base.buttonSec}`}><LogOut size={18}/></button>
      </div>

      <div className="pt-24 px-4 max-w-4xl mx-auto">
        
        {/* VISTA COCINA */}
        {view === 'cocina' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pizzas.filter(p => p.activa).map(p => {
              const pen = pedidos.filter(ped => ped.pizza_id === p.id && ped.estado === 'pendiente');
              const cant = pen.reduce((a, b) => a + b.cantidad_porciones, 0);
              return (
                <div key={p.id} className={`${base.card} p-5 rounded-3xl border relative overflow-hidden ${p.cocinando ? 'ring-2 ring-red-500' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{p.nombre}</h3>
                      <p className="text-3xl font-black text-cyan-500">{cant}</p>
                    </div>
                    <button onClick={() => togglerCocinando(p.id, !p.cocinando)} className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${p.cocinando ? 'bg-red-600 text-white animate-pulse' : base.buttonSec}`}>
                      <Flame size={16}/> {p.cocinando ? 'EN HORNO' : 'SUBIR'}
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {pen.map(ped => (
                      <div key={ped.id} className="flex justify-between items-center bg-black/10 dark:bg-white/5 p-2 rounded-lg text-sm">
                        <span className="capitalize">{ped.invitado_nombre}</span>
                        <div className="flex gap-2">
                          <button onClick={() => entregarPedido(ped.id)} className="text-green-500"><CheckCircle size={18}/></button>
                          <button onClick={() => eliminarPedido(ped.id)} className="text-red-500"><XCircle size={18}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VISTA PEDIDOS (CON TIMER) */}
        {view === 'pedidos' && (
          <div className="space-y-4">
            {pedidosAgrupados.map((u, i) => (
              <div key={i} className={`${base.card} p-4 rounded-2xl border`}>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2 border-b pb-2"><User size={18}/> {u.nombre}</h3>
                <div className="space-y-2">
                  {u.detalle.map((d: any, k: number) => (
                    <div key={k} className="flex justify-between items-center text-sm p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                      <div className="flex items-center">
                        <span className="font-medium">{d.nombre}</span>
                        {d.oldestPending && <Timer startTime={d.oldestPending} />}
                      </div>
                      <div className="flex gap-3 font-bold text-xs">
                        {d.pendiente > 0 && <span className="text-orange-500 flex items-center gap-1"><Clock size={12}/> {d.pendiente}</span>}
                        {d.entregado > 0 && <span className="text-green-500 flex items-center gap-1"><CheckCircle size={12}/> {d.entregado}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VISTA MENU */}
        {view === 'menu' && (
          <div className="space-y-6">
             <div className={`${base.card} p-6 rounded-3xl border`}>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18}/> Nueva Pizza</h3>
                <div className="flex flex-col gap-3">
                  <input value={newPizzaName} onChange={e => setNewPizzaName(e.target.value)} className={`p-3 rounded-xl border outline-none ${base.input}`} placeholder="Nombre..." />
                  <input value={newPizzaDesc} onChange={e => setNewPizzaDesc(e.target.value)} className={`p-3 rounded-xl border outline-none ${base.input}`} placeholder="Descripción..." />
                  <button onClick={agregarPizza} className="bg-cyan-600 text-white font-bold p-3 rounded-xl">AGREGAR</button>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pizzas.map(p => (
                  <div key={p.id} className={`${base.card} p-4 rounded-2xl border flex justify-between items-center`}>
                    <div>
                      <h4 className="font-bold">{p.nombre}</h4>
                      <p className="text-xs opacity-50">{p.descripcion}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => togglePizzaActiva(p.id, !p.activa)} className={p.activa ? 'text-green-500' : 'text-neutral-500'}>{p.activa ? <Eye size={20}/> : <EyeOff size={20}/>}</button>
                      <button onClick={() => eliminarPizzaTotal(p.id)} className="text-red-500"><Trash2 size={20}/></button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* VISTA USUARIOS */}
        {view === 'usuarios' && (
          <div className="space-y-6">
            <div className={`${base.card} p-6 rounded-3xl border`}>
                <h3 className="font-bold mb-4">Agregar Invitado</h3>
                <div className="flex gap-2">
                  <input value={newGuestName} onChange={e => setNewGuestName(e.target.value)} className={`flex-1 p-3 rounded-xl border outline-none ${base.input}`} placeholder="Nombre..." />
                  <button onClick={agregarInvitado} className="bg-cyan-600 text-white font-bold px-6 rounded-xl">OK</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitadosDB.map(inv => (
                <div key={inv.id} className={`${base.card} p-4 rounded-2xl border flex flex-col gap-3`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold capitalize">{inv.nombre}</span>
                    <button onClick={() => toggleBloqueo(inv.id, !inv.bloqueado)} className={`p-2 rounded-lg ${inv.bloqueado ? 'bg-red-600 text-white' : base.buttonSec}`}>
                      <Ban size={16}/>
                    </button>
                  </div>
                  {inv.bloqueado && (
                    <input 
                      placeholder="Motivo del bloqueo..." 
                      className={`p-2 text-xs rounded-lg border outline-none ${base.input}`}
                      value={tempMotivos[inv.id] || inv.motivo_bloqueo || ''}
                      onChange={e => setTempMotivos({...tempMotivos, [inv.id]: e.target.value})}
                      onBlur={() => toggleBloqueo(inv.id, true)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA RANKING */}
        {view === 'ranking' && (
          <div className="space-y-4">
            {rankingData.map((p, i) => (
              <div key={p.id} className={`${base.card} p-4 rounded-2xl border flex justify-between items-center`}>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black opacity-20">#{i+1}</span>
                  <div>
                    <h4 className="font-bold">{p.nombre}</h4>
                    <p className="text-xs opacity-50">{p.count} opiniones</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 font-bold text-xl">
                  <Star fill="currentColor" size={20}/> {p.avg}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VISTA CONFIG */}
        {view === 'config' && (
          <div className={`${base.card} p-6 rounded-3xl border space-y-6`}>
              <div>
                <label className="text-sm font-bold opacity-50 block mb-2">Password Invitados</label>
                <input 
                  value={config.password_invitados} 
                  onChange={e => setConfig({...config, password_invitados: e.target.value})} 
                  className={`w-full p-3 rounded-xl border outline-none ${base.input}`}
                />
              </div>
              <div>
                <label className="text-sm font-bold opacity-50 block mb-2">Porciones por Pizza</label>
                <input 
                  type="number"
                  value={config.porciones_por_pizza} 
                  onChange={e => setConfig({...config, porciones_por_pizza: parseInt(e.target.value)})} 
                  className={`w-full p-3 rounded-xl border outline-none ${base.input}`}
                />
              </div>
              <button 
                onClick={async () => {
                  await supabase.from('configuracion_dia').update(config).eq('id', config.id);
                  alert('Guardado');
                }}
                className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
              >
                <Save size={20}/> GUARDAR CAMBIOS
              </button>
          </div>
        )}

      </div>
    </div>
  );
}
