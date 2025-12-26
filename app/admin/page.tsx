'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Pizza, Settings, Plus, Trash2, Lock, ChefHat, Eye, EyeOff, CheckCircle, Clock, Flame, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const THEMES = [
  { name: 'Carbone', color: 'bg-neutral-600', text: 'text-neutral-400', border: 'border-neutral-600/50' },
  { name: 'Turquesa', color: 'bg-cyan-600', text: 'text-cyan-400', border: 'border-cyan-600/50' },
  { name: 'Pistacho', color: 'bg-lime-600', text: 'text-lime-400', border: 'border-lime-600/50' },
  { name: 'Fuego', color: 'bg-red-600', text: 'text-red-500', border: 'border-red-600/50' },
  { name: 'Violeta', color: 'bg-violet-600', text: 'text-violet-400', border: 'border-violet-600/50' },
];

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'cocina' | 'menu' | 'config'>('cocina');
  
  // Datos
  const [pedidos, setPedidos] = useState<any[]>([]); 
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
      pedidosPendientes: pendientes 
    };
  });

  // --- ACCIONES ---
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
          // Opcional: Al entregar, dejamos de "cocinar" automáticamente
          await supabase.from('menu_pizzas').update({ cocinando: false }).eq('id', pizzaMetric.id);
          cargarDatos();
      }
  };

  const toggleCocinando = async (id: string, estadoActual: boolean) => {
      await supabase.from('menu_pizzas').update({ cocinando: !estadoActual }).eq('id', id);
      cargarDatos();
  };

  const selectTheme = (theme: any) => {
      setCurrentTheme(theme);
      localStorage.setItem('vito-theme', theme.name);
      window.dispatchEvent(new Event('storage'));
  };

  // ... Funciones Menu/Config (iguales que antes, simplificadas aqui)
  const addPizza = async () => { if(!newPizzaName) return; await supabase.from('menu_pizzas').insert([{ nombre: newPizzaName, descripcion: newPizzaDesc, activa: true }]); setNewPizzaName(''); cargarDatos(); };
  const deletePizza = async (id: string) => { if(confirm('Borrar?')) await supabase.from('menu_pizzas').delete().eq('id', id); cargarDatos(); };
  const updatePizzaConfig = async (id: string, f: string, v: any) => await supabase.from('menu_pizzas').update({[f]: v}).eq('id', id);
  const changePassword = async () => { await supabase.from('configuracion_dia').update({password_admin: newPass}).eq('id', config.id); alert('OK'); };

  if (!autenticado) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-2xl">
        <div className={`flex justify-center mb-6 ${currentTheme.text}`}><ChefHat size={48} /></div>
        <h1 className="text-2xl font-bold text-center text-white mb-2">Il Forno Di Vito</h1>
        <p className="text-center text-neutral-500 mb-6">Acceso Pizzaiolo</p>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} 
               className="w-full bg-black text-white p-4 rounded-xl border border-neutral-700 mb-4 outline-none transition focus:border-white/30" placeholder="Contraseña..." />
        <button onClick={ingresar} className={`w-full ${currentTheme.color} text-white font-bold py-4 rounded-xl hover:brightness-110 transition`}>ENTRAR</button>
        <div className="mt-6 text-center">
            <Link href="/" className="text-neutral-500 text-xs hover:text-white flex items-center justify-center gap-1"><ArrowRight size={12}/> Ir a vista Invitados</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex justify-between items-center shadow-md">
        <div>
            <h1 className={`font-bold text-lg tracking-tight flex items-center gap-2`}>
                <span className={currentTheme.text}>Il Forno Admin</span>
            </h1>
            <p className="text-[10px] text-neutral-400">{invitadosCount} / {config.total_invitados} comensales</p>
        </div>
        
        <div className="flex items-center gap-4">
             {/* Selector Rápido */}
             <div className="flex gap-2 bg-black/30 p-1.5 rounded-full border border-white/5">
                 {THEMES.map(t => (
                     <button key={t.name} onClick={() => selectTheme(t)} 
                             className={`w-4 h-4 rounded-full ${t.color} ${currentTheme.name === t.name ? 'ring-2 ring-white scale-110' : 'opacity-40'}`}></button>
                 ))}
             </div>
             
             {/* Salida */}
             <Link href="/" className="bg-neutral-800 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700">
                <ExternalLink size={18} />
             </Link>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        
        {/* VISTA COCINA */}
        {view === 'cocina' && (
          <div className="grid gap-4">
            {metricas.map(p => (
              <div key={p.id} className={`bg-neutral-900 rounded-3xl p-5 border relative overflow-hidden transition-all ${p.cocinando ? 'border-orange-500/50 shadow-[0_0_30px_rgba(234,88,12,0.1)]' : 'border-neutral-800'}`}>
                
                {/* Indicador de Fuego de Fondo */}
                {p.cocinando && <div className="absolute -right-10 -bottom-10 text-orange-900/20"><Flame size={150} /></div>}

                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            {p.nombre}
                            {p.cocinando && <span className="text-[10px] bg-orange-500 text-black px-2 py-0.5 rounded-full font-bold animate-pulse">EN HORNO</span>}
                        </h3>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1"><Clock size={12}/> Pendientes: {p.totalPendientes}</p>
                    </div>
                    
                    {/* Botonera Acción */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => toggleCocinando(p.id, p.cocinando)}
                            className={`p-3 rounded-xl transition-all ${p.cocinando ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'}`}
                            title={p.cocinando ? "Detener cocción" : "Poner en horno"}
                        >
                            <Flame size={20} className={p.cocinando ? 'animate-bounce' : ''} />
                        </button>

                        {p.completas > 0 && (
                            <button 
                                onClick={() => entregarPizza(p)}
                                className={`${currentTheme.color} text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg hover:brightness-110`}
                            >
                                <CheckCircle size={16} /> LISTA ({p.completas})
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Barra */}
                <div className="relative h-4 bg-black rounded-full overflow-hidden border border-white/5 z-10">
                    <div className="absolute inset-0 flex justify-between px-[1px] z-20">
                        {[...Array(p.target)].map((_, i) => <div key={i} className="w-[1px] h-full bg-white/10"></div>)}
                    </div>
                    <div className={`absolute h-full ${p.cocinando ? 'bg-orange-500' : currentTheme.color} transition-all duration-700`} style={{ width: `${p.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ... (VISTAS MENU Y CONFIG IGUALES AL ANTERIOR, SOLO CAMBIA EL DISEÑO VISUAL) ... */}
        {view === 'menu' && (
           /* ... Codigo Menu simplificado ... */
          <div className="space-y-6">
            <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-neutral-300"><Plus size={18}/> Agregar</h3>
                <input className="w-full bg-black p-4 rounded-2xl border border-neutral-700 mb-2 text-white outline-none" placeholder="Nombre..." value={newPizzaName} onChange={e => setNewPizzaName(e.target.value)} />
                <textarea className="w-full bg-black p-4 rounded-2xl border border-neutral-700 mb-4 text-white text-sm outline-none" placeholder="Ingredientes..." value={newPizzaDesc} onChange={e => setNewPizzaDesc(e.target.value)} />
                <button onClick={addPizza} className={`w-full ${currentTheme.color} text-white font-bold py-4 rounded-2xl`}>AGREGAR</button>
            </div>
            <div className="space-y-3">
                {pizzas.map(p => (
                    <div key={p.id} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex justify-between items-center">
                        <input value={p.nombre} onChange={e => updatePizzaConfig(p.id, 'nombre', e.target.value)} className="bg-transparent font-bold text-white outline-none" />
                        <div className="flex gap-2">
                             <button onClick={() => updatePizzaConfig(p.id, 'activa', !p.activa)} className="p-2 bg-neutral-800 rounded-lg text-neutral-400">{p.activa ? <Eye size={16}/> : <EyeOff size={16}/>}</button>
                             <button onClick={() => deletePizza(p.id)} className="p-2 bg-red-900/20 text-red-500 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {view === 'config' && (
          <div className="space-y-6">
             {/* Solo dejamos ajustes globales aqui ya que el tema esta arriba */}
            <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-neutral-300"><Settings size={18}/> Ajustes</h3>
                <div className="flex justify-between items-center mb-4">
                    <label className="text-sm text-neutral-500">Porciones Estándar</label>
                    <select value={config.porciones_por_pizza} onChange={async e => {
                        const v = parseInt(e.target.value); setConfig({...config, porciones_por_pizza: v});
                        await supabase.from('configuracion_dia').update({ porciones_por_pizza: v }).eq('id', config.id);
                    }} className="bg-black p-2 rounded border border-neutral-700 text-white"><option value="4">4</option><option value="6">6</option><option value="8">8</option></select>
                </div>
            </div>
          </div>
        )}
      </main>

      {/* NAVBAR */}
      <nav className="fixed bottom-0 w-full bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 flex justify-around p-4 pb-8 z-50">
          <button onClick={() => setView('cocina')} className={`flex flex-col items-center gap-1 ${view === 'cocina' ? currentTheme.text : 'text-neutral-600'}`}><Pizza size={24} /> <span className="text-[9px] uppercase font-bold">Cocina</span></button>
          <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-1 ${view === 'menu' ? currentTheme.text : 'text-neutral-600'}`}><ChefHat size={24} /> <span className="text-[9px] uppercase font-bold">Menú</span></button>
          <button onClick={() => setView('config')} className={`flex flex-col items-center gap-1 ${view === 'config' ? currentTheme.text : 'text-neutral-600'}`}><Settings size={24} /> <span className="text-[9px] uppercase font-bold">Ajustes</span></button>
      </nav>
    </div>
  );
}