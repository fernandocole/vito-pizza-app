'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Pizza, Settings, Plus, Trash2, Lock, ChefHat, Eye, EyeOff, CheckCircle, Clock } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// TEMAS NUEVOS
const THEMES = [
  { name: 'Turquesa', color: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/50' },
  { name: 'Pistacho', color: 'bg-lime-400', text: 'text-lime-400', border: 'border-lime-400/50' },
  { name: 'Fuego', color: 'bg-red-600', text: 'text-red-500', border: 'border-red-500/50' },
  { name: 'Violeta', color: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-500/50' },
];

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'cocina' | 'menu' | 'config'>('cocina');
  
  // Datos
  const [pedidos, setPedidos] = useState<any[]>([]); // Todos (pendientes y entregados)
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ porciones_por_pizza: 8, total_invitados: 20 });
  const [invitadosCount, setInvitadosCount] = useState(0);

  // UI State
  const [newPizzaName, setNewPizzaName] = useState('');
  const [newPizzaDesc, setNewPizzaDesc] = useState('');
  const [newPass, setNewPass] = useState('');
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('vito-theme');
    if (savedTheme) {
      const found = THEMES.find(t => t.name === savedTheme);
      if (found) setCurrentTheme(found);
    }

    if (autenticado) {
      cargarDatos();
      const channel = supabase.channel('admin-realtime')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => cargarDatos())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [autenticado]);

  const ingresar = async () => {
    const { data } = await supabase.from('configuracion_dia').select('*').single();
    if (data && data.password_admin === password) {
      setAutenticado(true);
      setConfig(data);
      cargarDatos();
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const cargarDatos = async () => {
    const { data: dPizzas } = await supabase.from('menu_pizzas').select('*').order('created_at');
    if (dPizzas) setPizzas(dPizzas);
    // Traemos TODOS para historial, ordenados por antigüedad
    const { data: dPedidos } = await supabase.from('pedidos').select('*').order('created_at', { ascending: true });
    if (dPedidos) {
        setPedidos(dPedidos);
        setInvitadosCount(new Set(dPedidos.map(p => p.invitado_nombre.toLowerCase())).size);
    }
    const { data: dConfig } = await supabase.from('configuracion_dia').select('*').single();
    if (dConfig) setConfig(dConfig);
  };

  // --- LOGICA COCINA ---
  const metricas = pizzas.filter(p => p.activa).map(pizza => {
    // Solo contamos PENDIENTES para la barra de cocina
    const pendientes = pedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado');
    const totalPendientes = pendientes.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
    
    const target = pizza.porciones_individuales || config.porciones_por_pizza;
    
    return {
      ...pizza,
      totalPendientes,
      completas: Math.floor(totalPendientes / target),
      resto: totalPendientes % target,
      target,
      percent: ((totalPendientes % target) / target) * 100,
      pedidosPendientes: pendientes // Guardamos los objetos para poder marcarlos como entregados
    };
  });

  // --- ACCIONES DE COCINA ---
  const entregarPizza = async (pizzaMetric: any) => {
      if (!confirm(`¿Confirmar que salió 1 ${pizzaMetric.nombre}? Se descontarán las porciones más antiguas.`)) return;

      // Lógica FIFO (First In First Out): Tomamos los primeros X pedidos pendientes
      let porcionesAEntregar = pizzaMetric.target;
      const idsAActualizar = [];

      for (const pedido of pizzaMetric.pedidosPendientes) {
          if (porcionesAEntregar <= 0) break;
          idsAActualizar.push(pedido.id);
          porcionesAEntregar -= pedido.cantidad_porciones;
      }

      // Actualizar en base de datos
      if (idsAActualizar.length > 0) {
          await supabase.from('pedidos').update({ estado: 'entregado' }).in('id', idsAActualizar);
          cargarDatos();
      }
  };

  // --- OTRAS ACCIONES ---
  const addPizza = async () => {
    if (!newPizzaName) return;
    await supabase.from('menu_pizzas').insert([{ nombre: newPizzaName, descripcion: newPizzaDesc, activa: true }]);
    setNewPizzaName(''); setNewPizzaDesc(''); cargarDatos();
  };

  const deletePizza = async (id: string) => {
    if (confirm('¿Borrar esta pizza del menú?')) {
        await supabase.from('menu_pizzas').delete().eq('id', id);
        cargarDatos();
    }
  };

  const updatePizzaConfig = async (id: string, field: string, val: any) => {
    await supabase.from('menu_pizzas').update({ [field]: val }).eq('id', id);
  };

  const changePassword = async () => {
    await supabase.from('configuracion_dia').update({ password_admin: newPass }).eq('id', config.id);
    alert('Contraseña actualizada'); setNewPass('');
  };

  const selectTheme = (theme: any) => {
      setCurrentTheme(theme);
      localStorage.setItem('vito-theme', theme.name);
      window.dispatchEvent(new Event('storage'));
  };

  if (!autenticado) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-2xl">
        <div className={`flex justify-center mb-6 ${currentTheme.text}`}><ChefHat size={48} /></div>
        <h1 className="text-2xl font-bold text-center text-white mb-2">Il Forno Di Vito</h1>
        <p className="text-center text-neutral-500 mb-6">Acceso Pizzaiolo</p>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} 
               className="w-full bg-black text-white p-4 rounded-xl border border-neutral-700 mb-4 focus:border-cyan-500 outline-none transition" placeholder="Contraseña..." />
        <button onClick={ingresar} className={`w-full ${currentTheme.color} text-black font-bold py-4 rounded-xl hover:brightness-110 transition`}>ENTRAR</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-6 py-4 flex justify-between items-center shadow-md">
        <div>
            <h1 className={`font-bold text-xl tracking-tight ${currentTheme.text}`}>Il Forno Admin</h1>
            <p className="text-xs text-neutral-400">{invitadosCount} / {config.total_invitados} comensales</p>
        </div>
        <div className={`w-4 h-4 rounded-full ${currentTheme.color} shadow-[0_0_15px_currentColor]`}></div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        
        {/* VISTA COCINA */}
        {view === 'cocina' && (
          <div className="grid gap-4">
            {metricas.map(p => (
              <div key={p.id} className={`bg-neutral-900 rounded-3xl p-6 border ${p.completas > 0 ? `${currentTheme.border} shadow-[0_0_20px_rgba(0,0,0,0.5)]` : 'border-neutral-800'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-xl">{p.nombre}</h3>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1"><Clock size={12}/> Pendientes: {p.totalPendientes} porciones</p>
                    </div>
                    {p.completas > 0 ? (
                        <button 
                            onClick={() => entregarPizza(p)}
                            className={`${currentTheme.color} text-black font-bold px-4 py-2 rounded-full text-sm animate-pulse flex items-center gap-2 shadow-lg`}
                        >
                            <CheckCircle size={16} /> ¡PIZZA LISTA! ({p.completas})
                        </button>
                    ) : (
                        <span className="text-neutral-600 text-xs font-mono uppercase border border-neutral-800 px-2 py-1 rounded">Esperando pedidos...</span>
                    )}
                </div>
                
                {/* Barra de Progreso */}
                <div className="relative h-6 bg-black rounded-full overflow-hidden border border-white/5">
                    {/* Marcas de division */}
                    <div className="absolute inset-0 flex justify-between px-[1px] z-10">
                        {[...Array(p.target)].map((_, i) => (
                             <div key={i} className="w-[1px] h-full bg-white/10"></div>
                        ))}
                    </div>
                    <div className={`absolute h-full ${currentTheme.color} transition-all duration-700 ease-out`} style={{ width: `${p.percent}%` }}></div>
                </div>

                <div className="mt-3 flex justify-between text-xs text-neutral-400 font-medium">
                    <span>Faltan para completar: {p.target - p.resto}</span>
                    <span className={currentTheme.text}>Corte de {p.target}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VISTA MENU (Agregar/Editar) */}
        {view === 'menu' && (
          <div className="space-y-6">
            <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-neutral-300"><Plus size={18}/> Agregar al Menú</h3>
                <input className="w-full bg-black p-4 rounded-2xl border border-neutral-700 mb-2 text-white outline-none focus:border-white/20" placeholder="Nombre (ej: Fugazzeta)" value={newPizzaName} onChange={e => setNewPizzaName(e.target.value)} />
                <textarea className="w-full bg-black p-4 rounded-2xl border border-neutral-700 mb-4 text-white text-sm outline-none focus:border-white/20" placeholder="Ingredientes..." value={newPizzaDesc} onChange={e => setNewPizzaDesc(e.target.value)} />
                <button onClick={addPizza} className={`w-full ${currentTheme.color} text-black font-bold py-4 rounded-2xl hover:brightness-110`}>AGREGAR</button>
            </div>

            <div className="space-y-3">
                {pizzas.map(p => (
                    <div key={p.id} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <input value={p.nombre} onChange={e => updatePizzaConfig(p.id, 'nombre', e.target.value)} className="bg-transparent font-bold text-white outline-none w-full" />
                            <div className="flex gap-2">
                                <button onClick={() => updatePizzaConfig(p.id, 'activa', !p.activa)} className={`p-2 rounded-xl ${p.activa ? 'text-green-500 bg-green-500/10' : 'text-neutral-500 bg-neutral-800'}`}>
                                    {p.activa ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button onClick={() => deletePizza(p.id)} className="p-2 bg-red-500/10 text-red-500 rounded-xl"><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-400 bg-black/40 p-3 rounded-xl">
                            <span>Tamaño:</span>
                            <select 
                                value={p.porciones_individuales || ''} 
                                onChange={e => updatePizzaConfig(p.id, 'porciones_individuales', e.target.value ? parseInt(e.target.value) : null)}
                                className="bg-neutral-800 text-white p-1 rounded border border-neutral-700 outline-none"
                            >
                                <option value="">Estándar ({config.porciones_por_pizza})</option>
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

        {/* VISTA CONFIGURACION */}
        {view === 'config' && (
          <div className="space-y-6">
             {/* Temas */}
             <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                 <h3 className="font-bold mb-4 text-neutral-300">Tema de la App</h3>
                 <div className="flex gap-4 justify-center">
                     {THEMES.map(t => (
                         <button key={t.name} onClick={() => selectTheme(t)} 
                                 className={`w-12 h-12 rounded-full ${t.color} border-2 ${currentTheme.name === t.name ? 'border-white scale-110' : 'border-transparent opacity-30'} transition-all shadow-[0_0_10px_currentColor]`}></button>
                     ))}
                 </div>
            </div>

            <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-neutral-300"><Settings size={18}/> Ajustes Globales</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-2">Porciones Estándar</label>
                        <select value={config.porciones_por_pizza} onChange={async e => {
                            const v = parseInt(e.target.value);
                            setConfig({...config, porciones_por_pizza: v});
                            await supabase.from('configuracion_dia').update({ porciones_por_pizza: v }).eq('id', config.id);
                        }} className="w-full bg-black p-3 rounded-xl border border-neutral-700 text-white outline-none">
                            <option value="4">4</option><option value="6">6</option><option value="8">8</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-2">Total Invitados</label>
                        <input type="number" value={config.total_invitados} onChange={async e => {
                            const v = parseInt(e.target.value);
                            setConfig({...config, total_invitados: v});
                            await supabase.from('configuracion_dia').update({ total_invitados: v }).eq('id', config.id);
                        }} className="w-full bg-black p-3 rounded-xl border border-neutral-700 text-white outline-none" />
                    </div>
                </div>
            </div>

            <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-neutral-300"><Lock size={18}/> Seguridad</h3>
                <div className="flex gap-2">
                    <input type="text" placeholder="Nueva contraseña" value={newPass} onChange={e => setNewPass(e.target.value)} 
                           className="flex-1 bg-black p-3 rounded-xl border border-neutral-700 text-white outline-none" />
                    <button onClick={changePassword} className="bg-white text-black font-bold px-4 rounded-xl hover:bg-neutral-200">Guardar</button>
                </div>
            </div>
          </div>
        )}
      </main>

      {/* NAVBAR INFERIOR */}
      <nav className="fixed bottom-0 w-full bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 flex justify-around p-4 pb-8 z-50">
          <button onClick={() => setView('cocina')} className={`flex flex-col items-center gap-1 transition ${view === 'cocina' ? currentTheme.text : 'text-neutral-600'}`}>
              <Pizza size={24} /> <span className="text-[9px] font-bold uppercase tracking-widest">Cocina</span>
          </button>
          <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-1 transition ${view === 'menu' ? currentTheme.text : 'text-neutral-600'}`}>
              <ChefHat size={24} /> <span className="text-[9px] font-bold uppercase tracking-widest">Menú</span>
          </button>
          <button onClick={() => setView('config')} className={`flex flex-col items-center gap-1 transition ${view === 'config' ? currentTheme.text : 'text-neutral-600'}`}>
              <Settings size={24} /> <span className="text-[9px] font-bold uppercase tracking-widest">Ajustes</span>
          </button>
      </nav>
    </div>
  );
}