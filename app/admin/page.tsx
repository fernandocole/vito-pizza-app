'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Pizza, Settings, Plus, Trash2, ChefHat, Eye, EyeOff, CheckCircle, Clock, Flame, LogOut, List, User, Bell, ArrowRight, ArrowDownAZ, ArrowUpNarrowWide, Maximize2, Minimize2 } from 'lucide-react';

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
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'cocina' | 'pedidos' | 'menu' | 'config'>('cocina');
  
  const [pedidos, setPedidos] = useState<any[]>([]); 
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ porciones_por_pizza: 8, total_invitados: 20 });
  const [invitadosCount, setInvitadosCount] = useState(0);

  const prevPedidosCount = useRef(0);
  const [newPizzaName, setNewPizzaName] = useState('');
  const [newPizzaDesc, setNewPizzaDesc] = useState('');
  const [newPass, setNewPass] = useState('');
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  
  const [orden, setOrden] = useState<'estado' | 'nombre'>('estado');
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('vito-theme');
    if (savedTheme) {
      const found = THEMES.find(t => t.name === savedTheme);
      if (found) setCurrentTheme(found);
    }
    
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

  const ingresar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { data } = await supabase.from('configuracion_dia').select('*').single();
    if (data && data.password_admin === password) {
      setAutenticado(true); setConfig(data); cargarDatos();
    } else { alert('Contraseña incorrecta'); }
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

    const { data: dPedidos } = await supabase
        .from('pedidos')
        .select('*')
        .gte('created_at', corteISO) 
        .order('created_at', { ascending: true });

    if (dPedidos) {
        setPedidos(dPedidos);
        setInvitadosCount(new Set(dPedidos.map(p => p.invitado_nombre.toLowerCase())).size);

        if (prevPedidosCount.current > 0 && dPedidos.length > prevPedidosCount.current) {
            enviarNotificacion("¡NUEVO PEDIDO!", "Alguien quiere pizza 🍕");
        }
        prevPedidosCount.current = dPedidos.length;
    }
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

  const metricas = useMemo(() => {
      const lista = pizzas.filter(p => p.activa).map(pizza => {
        const pendientes = pedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado');
        const totalPendientes = pendientes.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
        const target = pizza.porciones_individuales || config.porciones_por_pizza;
        return {
          ...pizza,
          totalPendientes,
          completas: Math.floor(totalPendientes / target),
          faltan: target - (totalPendientes % target),
          target,
          percent: ((totalPendientes % target) / target) * 100,
          pedidosPendientes: pendientes 
        };
      });

      return lista.sort((a, b) => {
          if (orden === 'estado') {
              if (a.cocinando && !b.cocinando) return -1;
              if (!a.cocinando && b.cocinando) return 1;
              return a.nombre.localeCompare(b.nombre);
          } else {
              return a.nombre.localeCompare(b.nombre);
          }
      });
  }, [pizzas, pedidos, config, orden]);

  const pedidosAgrupados = Array.from(new Set(pedidos.map(p => p.invitado_nombre.toLowerCase()))).map(nombre => {
      const susPedidos = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre);
      const detalle = pizzas.map(pz => {
          const count = susPedidos.filter(p => p.pizza_id === pz.id).reduce((acc, c) => acc + c.cantidad_porciones, 0);
          return count > 0 ? { nombre: pz.nombre, cant: count } : null;
      }).filter(Boolean);
      const nombreReal = susPedidos[0]?.invitado_nombre || nombre;
      return { nombre: nombreReal, detalle, total: susPedidos.reduce((acc, c) => acc + c.cantidad_porciones, 0) };
  });

  const eliminarInvitado = async (nombre: string) => {
      if(confirm(`¿Estás seguro de eliminar a ${nombre.toUpperCase()}? Se borrarán todos sus pedidos.`)) {
          const idsABorrar = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre.toLowerCase()).map(p => p.id);
          if (idsABorrar.length > 0) {
              await supabase.from('pedidos').delete().in('id', idsABorrar);
              cargarDatos();
          }
      }
  };

  const toggleCocinando = async (p: any) => {
      if (!p.cocinando) { 
          if (p.totalPendientes < p.target) {
              alert(`⚠️ No hay suficientes pedidos para una pizza entera.\nFaltan ${p.target - p.totalPendientes} porciones para arrancar.`);
              return;
          }
      }
      setPizzas(prev => prev.map(item => item.id === p.id ? { ...item, cocinando: !p.cocinando } : item));
      await supabase.from('menu_pizzas').update({ cocinando: !p.cocinando }).eq('id', p.id);
  };

  const entregarPizza = async (pizzaMetric: any) => {
      if (!confirm(`¿Confirmar que salió 1 ${pizzaMetric.nombre}?`)) return;
      let porcionesAEntregar = pizzaMetric.target;
      const idsAActualizar = [];
      for (const pedido of pizzaMetric.pedidosPendientes) {
          if (porcionesAEntregar <= 0) break;
          idsAActualizar.push(pedido.id);
          porcionesAEntregar -= pedido.cantidad_porciones;
      }
      if (idsAActualizar.length > 0) {
          await supabase.from('pedidos').update({ estado: 'entregado' }).in('id', idsAActualizar);
          await supabase.from('menu_pizzas').update({ cocinando: false }).eq('id', pizzaMetric.id);
          setPizzas(prev => prev.map(item => item.id === pizzaMetric.id ? { ...item, cocinando: false } : item));
          cargarDatos();
      }
  };

  const updatePizzaConfig = async (id: string, f: string, v: any) => {
      setPizzas(pizzas.map(p => p.id === id ? { ...p, [f]: v } : p));
      await supabase.from('menu_pizzas').update({[f]: v}).eq('id', id);
  };
  const selectTheme = (theme: any) => { setCurrentTheme(theme); localStorage.setItem('vito-theme', theme.name); window.dispatchEvent(new Event('storage')); };
  const addPizza = async () => { if(!newPizzaName) return; await supabase.from('menu_pizzas').insert([{ nombre: newPizzaName, descripcion: newPizzaDesc, activa: true }]); setNewPizzaName(''); setNewPizzaDesc(''); cargarDatos(); };
  const deletePizza = async (id: string) => { if(confirm('¿Borrar?')) await supabase.from('menu_pizzas').delete().eq('id', id); cargarDatos(); };
  const changePassword = async () => { await supabase.from('configuracion_dia').update({password_admin: newPass}).eq('id', config.id); alert('OK'); setNewPass(''); };

  if (!autenticado) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans overflow-hidden">
      <div className="w-full max-w-md bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-2xl">
        <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Logo" className="h-32 w-auto object-contain drop-shadow-lg" />
        </div>
        <h1 className="text-2xl font-bold text-center text-white mb-2">Il Forno Di Vito</h1>
        <p className="text-center text-neutral-500 mb-6">Acceso Pizzaiolo</p>
        <form onSubmit={ingresar} className="flex flex-col gap-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black text-white p-4 rounded-xl border border-neutral-700 outline-none" placeholder="Contraseña..." autoFocus />
            <button type="submit" className={`w-full ${currentTheme.color} text-white font-bold py-4 rounded-xl`}>ENTRAR</button>
        </form>
        <div className="mt-8 text-center pt-6 border-t border-neutral-800">
            <button onClick={irAInvitados} className="text-neutral-500 text-sm hover:text-white flex items-center justify-center gap-2 w-full py-3">
                <ArrowRight size={16}/> Ir a modo Invitados
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans pb-24 overflow-x-hidden w-full">
      <header className="sticky top-0 z-50 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <div>
                <h1 className={`font-bold text-lg tracking-tight leading-none`}><span className={currentTheme.text}>Il Forno Admin</span></h1>
                <p className="text-[10px] text-neutral-400">{invitadosCount} / {config.total_invitados} comensales</p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="flex gap-2 bg-black/30 p-1.5 rounded-full border border-white/5">
                {THEMES.map(t => (<button key={t.name} onClick={() => selectTheme(t)} className={`w-4 h-4 rounded-full ${t.color} ${currentTheme.name === t.name ? 'ring-2 ring-white scale-110' : 'opacity-40'}`}></button>))}
            </div>
            
            <button onClick={irAInvitados} className="bg-neutral-800 p-2 rounded-full text-neutral-400 hover:text-white">
                <LogOut size={18} />
            </button>
        </div>
      </header>

      {view === 'cocina' && (
        <div className="px-4 py-2 bg-black/20 border-t border-white/5 flex justify-between items-center animate-in slide-in-from-top-2 sticky top-14 z-40 backdrop-blur-sm">
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                {isCompact ? 'Vista Compacta' : 'Vista Detallada'}
            </span>
            <div className="flex gap-2">
                <button 
                    onClick={() => setOrden(orden === 'estado' ? 'nombre' : 'estado')}
                    className="bg-neutral-800 px-3 py-1.5 rounded-full text-neutral-400 hover:text-white border border-white/10 flex items-center gap-2 text-xs font-bold"
                >
                    {orden === 'estado' ? <ArrowUpNarrowWide size={14} /> : <ArrowDownAZ size={14} />}
                    {orden === 'estado' ? 'Prioridad' : 'Nombre'}
                </button>
                <button 
                    onClick={() => setIsCompact(!isCompact)}
                    className={`px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 text-xs font-bold transition-colors ${isCompact ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                >
                    {isCompact ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                    {isCompact ? 'Expandir' : 'Compactar'}
                </button>
            </div>
        </div>
      )}

      <main className="p-4 max-w-4xl mx-auto space-y-6 w-full">
        {view === 'cocina' && (
          <div className="grid gap-3">
            {metricas.map(p => (
              <div key={p.id} className={`bg-neutral-900 rounded-3xl border relative overflow-hidden transition-all ${p.cocinando ? 'border-orange-600/50 shadow-[0_0_30px_rgba(234,88,12,0.1)]' : 'border-neutral-800'} ${isCompact ? 'p-3' : 'p-5'}`}>
                {!isCompact && p.cocinando && <div className="absolute -right-10 -bottom-10 text-orange-900/20"><Flame size={150} /></div>}
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div>
                        <h3 className={`font-bold flex items-center gap-2 ${isCompact ? 'text-base' : 'text-xl'}`}>
                            {p.nombre}
                            {/* BADGE NARANJA ROJIZO */}
                            {p.cocinando && <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">EN HORNO</span>}
                        </h3>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1"><Clock size={12}/> Pendientes: {p.totalPendientes}</p>
                    </div>
                    <button onClick={() => toggleCocinando(p)} className={`rounded-xl transition-all flex items-center justify-center ${p.cocinando ? 'bg-orange-600 text-white shadow-lg scale-105' : 'bg-neutral-800 text-neutral-500'} ${isCompact ? 'p-2' : 'p-3'}`}>
                        <Flame size={isCompact ? 16 : 20} className={p.cocinando ? 'animate-bounce' : ''} />
                    </button>
                </div>
                
                <div className={`relative bg-black rounded-full overflow-hidden border border-white/5 z-10 mb-3 ${isCompact ? 'h-2' : 'h-4'}`}>
                    <div className="absolute inset-0 flex justify-between px-[1px] z-20">
                        {[...Array(p.target)].map((_, i) => <div key={i} className="w-[1px] h-full bg-white/10"></div>)}
                    </div>
                    {/* BARRA NARANJA ROJIZA */}
                    <div className={`absolute h-full ${p.cocinando ? 'bg-orange-600' : currentTheme.color} transition-all duration-700`} style={{ width: `${p.percent}%` }}></div>
                </div>

                {p.completas > 0 ? (
                    // BOTÓN LISTO CON COLOR DEL TEMA
                    <button onClick={() => entregarPizza(p)} className={`w-full ${currentTheme.color} text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition active:scale-95 ${isCompact ? 'py-2 text-sm' : 'py-3'}`}>
                        <CheckCircle size={isCompact ? 16 : 20} /> ¡PIZZA LISTA! ({p.completas})
                    </button>
                ) : (
                    <div className={`w-full text-center text-xs text-neutral-500 font-mono border border-neutral-800 rounded-xl ${isCompact ? 'py-1' : 'py-2'}`}>
                        Faltan {p.faltan} porc.
                    </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === 'pedidos' && (
            <div className="space-y-4">
                <h2 className="text-neutral-500 text-sm font-bold uppercase tracking-widest mb-2">Historial (Desde 06:00 AM)</h2>
                {pedidosAgrupados.length === 0 ? <p className="text-center text-neutral-600">Sin pedidos recientes.</p> : pedidosAgrupados.map((u, i) => (
                    <div key={i} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 relative">
                        <button onClick={() => eliminarInvitado(u.nombre)} className="absolute top-4 right-4 text-neutral-600 hover:text-red-500 p-2 bg-black/20 rounded-lg"><Trash2 size={16} /></button>
                        <div className="flex justify-between border-b border-neutral-800 pb-2 mb-2 pr-10">
                            <h3 className="font-bold flex items-center gap-2 capitalize"><User size={16}/> {u.nombre}</h3>
                            <span className="text-xs bg-neutral-800 px-2 py-1 rounded-full text-neutral-400">Total: {u.total}</span>
                        </div>
                        <div className="space-y-1">
                            {u.detalle.map((d: any, k: number) => (
                                <div key={k} className="flex justify-between text-sm text-neutral-400">
                                    <span>{d.nombre}</span>
                                    <span className="text-white font-bold">x{d.cant}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {view === 'menu' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-neutral-300"><Plus size={18}/> Agregar Nueva</h3>
                <input className="w-full bg-black p-4 rounded-2xl border border-neutral-700 mb-2 text-white outline-none" placeholder="Nombre..." value={newPizzaName} onChange={e => setNewPizzaName(e.target.value)} />
                <textarea className="w-full bg-black p-4 rounded-2xl border border-neutral-700 mb-4 text-white text-sm outline-none" placeholder="Ingredientes..." value={newPizzaDesc} onChange={e => setNewPizzaDesc(e.target.value)} />
                <button onClick={addPizza} className={`w-full ${currentTheme.color} text-white font-bold py-4 rounded-2xl`}>AGREGAR</button>
            </div>
            <div className="space-y-4">
                {pizzas.map(p => (
                    <div key={p.id} className="bg-neutral-900 p-4 rounded-3xl border border-neutral-800 flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-3">
                            <input value={p.nombre} onChange={e => updatePizzaConfig(p.id, 'nombre', e.target.value)} className="bg-transparent font-bold text-xl text-white outline-none w-full border-b border-transparent focus:border-neutral-600" />
                            <div className="flex gap-2">
                                 <button onClick={() => updatePizzaConfig(p.id, 'activa', !p.activa)} className={`p-2 rounded-xl ${p.activa ? 'text-neutral-400 bg-neutral-800' : 'text-neutral-600 bg-black'}`}>{p.activa ? <Eye size={18}/> : <EyeOff size={18}/>}</button>
                                 <button onClick={() => deletePizza(p.id)} className="p-2 bg-red-900/10 text-red-500 rounded-xl"><Trash2 size={18}/></button>
                            </div>
                        </div>
                        <textarea value={p.descripcion || ''} onChange={e => updatePizzaConfig(p.id, 'descripcion', e.target.value)} className="w-full bg-black/30 p-2 rounded-xl text-sm text-neutral-400 outline-none resize-none h-16" placeholder="Descripción..." />
                        <div className="flex items-center justify-between text-sm text-neutral-500 bg-black/20 p-3 rounded-xl border border-white/5">
                            <span>Corte:</span>
                            <select value={p.porciones_individuales || ''} onChange={e => updatePizzaConfig(p.id, 'porciones_individuales', e.target.value ? parseInt(e.target.value) : null)} className="bg-neutral-800 text-white p-1 px-3 rounded-lg border border-neutral-700 outline-none">
                                <option value="">Global ({config.porciones_por_pizza})</option>
                                <option value="4">4 Porciones</option>
                                <option value="6">6 Porciones</option>
                                <option value="8">8 Porciones</option>
                                <option value="10">10 Porciones</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {view === 'config' && (
          <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-neutral-300"><Settings size={18}/> Ajustes Globales</h3>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
                <label className="text-sm text-neutral-500 w-full">Porciones Estándar</label>
                <select value={config.porciones_por_pizza} onChange={async e => {const v = parseInt(e.target.value); setConfig({...config, porciones_por_pizza: v}); await supabase.from('configuracion_dia').update({ porciones_por_pizza: v }).eq('id', config.id);}} className="w-full sm:w-auto bg-black p-3 rounded-xl border border-neutral-700 text-white outline-none">
                    <option value="4">4</option>
                    <option value="6">6</option>
                    <option value="8">8</option>
                </select>
            </div>
            <div className="border-t border-neutral-800 pt-4">
                <label className="text-sm text-neutral-500 mb-2 block">Cambiar Contraseña Admin</label>
                <div className="flex flex-col gap-3">
                    <input type="text" placeholder="Nueva contraseña" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-black p-3 rounded-xl border border-neutral-700 text-white outline-none" />
                    <button onClick={changePassword} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200">GUARDAR</button>
                </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 flex justify-around p-4 pb-8 z-50">
          <button onClick={() => setView('cocina')} className={`flex flex-col items-center gap-1 ${view === 'cocina' ? currentTheme.text : 'text-neutral-600'}`}><Pizza size={24} /> <span className="text-[9px] uppercase font-bold">Cocina</span></button>
          <button onClick={() => setView('pedidos')} className={`flex flex-col items-center gap-1 ${view === 'pedidos' ? currentTheme.text : 'text-neutral-600'}`}><List size={24} /> <span className="text-[9px] uppercase font-bold">Pedidos</span></button>
          <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-1 ${view === 'menu' ? currentTheme.text : 'text-neutral-600'}`}><ChefHat size={24} /> <span className="text-[9px] uppercase font-bold">Menú</span></button>
          <button onClick={() => setView('config')} className={`flex flex-col items-center gap-1 ${view === 'config' ? currentTheme.text : 'text-neutral-600'}`}><Settings size={24} /> <span className="text-[9px] uppercase font-bold">Ajustes</span></button>
      </nav>
    </div>
  );
}