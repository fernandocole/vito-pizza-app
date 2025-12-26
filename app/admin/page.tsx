'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Pizza, Users, Settings, Plus, Trash2, Save, Lock, ChefHat, Eye, EyeOff } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Temas de color disponibles
const THEMES = [
  { name: 'Pomodoro', color: 'bg-orange-600', text: 'text-orange-500', border: 'border-orange-500' },
  { name: 'Basilico', color: 'bg-green-600', text: 'text-green-500', border: 'border-green-500' },
  { name: 'Mare', color: 'bg-blue-600', text: 'text-blue-500', border: 'border-blue-500' },
  { name: 'Melanzane', color: 'bg-purple-600', text: 'text-purple-500', border: 'border-purple-500' },
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

  // Formulario nueva pizza
  const [newPizzaName, setNewPizzaName] = useState('');
  const [newPizzaDesc, setNewPizzaDesc] = useState('');
  
  // Cambio de pass
  const [newPass, setNewPass] = useState('');

  // Tema seleccionado (Persistente)
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);

  useEffect(() => {
    // Cargar tema guardado
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
    const { data: dPedidos } = await supabase.from('pedidos').select('*').neq('estado', 'entregado');
    if (dPedidos) {
        setPedidos(dPedidos);
        setInvitadosCount(new Set(dPedidos.map(p => p.invitado_nombre.toLowerCase())).size);
    }
    const { data: dConfig } = await supabase.from('configuracion_dia').select('*').single();
    if (dConfig) setConfig(dConfig);
  };

  // --- LOGICA COCINA ---
  const metricas = pizzas.filter(p => p.activa).map(pizza => {
    const pedidosPizza = pedidos.filter(p => p.pizza_id === pizza.id);
    const total = pedidosPizza.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
    // IMPORTANTE: Usa porciones individuales SI EXISTEN, sino usa la global
    const porcionesReales = pizza.porciones_individuales || config.porciones_por_pizza;
    
    return {
      ...pizza,
      total,
      completas: Math.floor(total / porcionesReales),
      resto: total % porcionesReales,
      target: porcionesReales,
      percent: ((total % porcionesReales) / porcionesReales) * 100
    };
  });

  // --- ACCIONES ---
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
      // Disparamos evento para que la app de invitados (si está en el mismo browser) se entere, 
      // aunque idealmente esto es config de usuario local.
      window.dispatchEvent(new Event('storage'));
  };

  if (!autenticado) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-2xl">
        <div className="flex justify-center mb-6 text-orange-500"><ChefHat size={48} /></div>
        <h1 className="text-2xl font-bold text-center text-white mb-2">Il Forno Di Vito</h1>
        <p className="text-center text-neutral-500 mb-6">Acceso Pizzaiolo</p>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} 
               className="w-full bg-black text-white p-4 rounded-xl border border-neutral-700 mb-4 focus:border-orange-500 outline-none transition" placeholder="Contraseña..." />
        <button onClick={ingresar} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition">ENTRAR</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 px-6 py-4 flex justify-between items-center">
        <div>
            <h1 className="font-bold text-xl tracking-tight">Il Forno Admin</h1>
            <p className="text-xs text-neutral-400">{invitadosCount} / {config.total_invitados} invitados activos</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${currentTheme.color} shadow-[0_0_10px_currentColor]`}></div>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-6">
        
        {/* VISTA COCINA */}
        {view === 'cocina' && (
          <div className="grid gap-4">
            {metricas.map(p => (
              <div key={p.id} className={`bg-neutral-900 rounded-2xl p-5 border ${p.completas > 0 ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-neutral-800'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg">{p.nombre}</h3>
                        <p className="text-xs text-neutral-500">Corte de {p.target} porciones</p>
                    </div>
                    {p.completas > 0 && <span className="bg-green-500 text-black font-bold px-3 py-1 rounded-full text-xs animate-pulse">MARCHAR {p.completas}</span>}
                </div>
                {/* Barra */}
                <div className="relative h-4 bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`absolute h-full ${currentTheme.color} transition-all duration-500`} style={{ width: `${p.percent}%` }}></div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-neutral-400">
                    <span>Resto: {p.resto} porciones</span>
                    <span>Total hoy: {p.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VISTA MENU (Agregar/Editar) */}
        {view === 'menu' && (
          <div className="space-y-8">
            {/* Agregar */}
            <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18}/> Nueva Pizza</h3>
                <input className="w-full bg-black p-3 rounded-xl border border-neutral-700 mb-2 text-white" placeholder="Nombre (ej: Fugazzeta)" value={newPizzaName} onChange={e => setNewPizzaName(e.target.value)} />
                <textarea className="w-full bg-black p-3 rounded-xl border border-neutral-700 mb-4 text-white text-sm" placeholder="Ingredientes..." value={newPizzaDesc} onChange={e => setNewPizzaDesc(e.target.value)} />
                <button onClick={addPizza} className={`w-full ${currentTheme.color} text-white font-bold py-3 rounded-xl`}>AGREGAR AL MENÚ</button>
            </div>

            {/* Lista Editar */}
            <div className="space-y-3">
                {pizzas.map(p => (
                    <div key={p.id} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <input value={p.nombre} onChange={e => updatePizzaConfig(p.id, 'nombre', e.target.value)} className="bg-transparent font-bold text-white outline-none" />
                            <div className="flex gap-2">
                                <button onClick={() => updatePizzaConfig(p.id, 'activa', !p.activa)} className="p-2 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white">
                                    {p.activa ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button onClick={() => deletePizza(p.id)} className="p-2 bg-red-900/20 text-red-500 rounded-lg"><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-400 bg-black/20 p-3 rounded-xl">
                            <span>Porciones:</span>
                            <select 
                                value={p.porciones_individuales || ''} 
                                onChange={e => updatePizzaConfig(p.id, 'porciones_individuales', e.target.value ? parseInt(e.target.value) : null)}
                                className="bg-neutral-800 text-white p-1 rounded border border-neutral-700 outline-none"
                            >
                                <option value="">Global ({config.porciones_por_pizza})</option>
                                <option value="4">4</option>
                                <option value="6">6</option>
                                <option value="8">8</option>
                                <option value="10">10</option>
                                <option value="12">12</option>
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
            <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Settings size={18}/> Configuración General</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-neutral-500 block mb-1">Porciones Globales</label>
                        <select value={config.porciones_por_pizza} onChange={async e => {
                            const v = parseInt(e.target.value);
                            setConfig({...config, porciones_por_pizza: v});
                            await supabase.from('configuracion_dia').update({ porciones_por_pizza: v }).eq('id', config.id);
                        }} className="w-full bg-black p-3 rounded-xl border border-neutral-700 text-white">
                            <option value="4">4</option><option value="6">6</option><option value="8">8</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500 block mb-1">Total Invitados</label>
                        <input type="number" value={config.total_invitados} onChange={async e => {
                            const v = parseInt(e.target.value);
                            setConfig({...config, total_invitados: v});
                            await supabase.from('configuracion_dia').update({ total_invitados: v }).eq('id', config.id);
                        }} className="w-full bg-black p-3 rounded-xl border border-neutral-700 text-white" />
                    </div>
                </div>
            </div>

            {/* Cambio Password */}
            <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Lock size={18}/> Seguridad</h3>
                <div className="flex gap-2">
                    <input type="text" placeholder="Nueva contraseña" value={newPass} onChange={e => setNewPass(e.target.value)} 
                           className="flex-1 bg-black p-3 rounded-xl border border-neutral-700 text-white" />
                    <button onClick={changePassword} className="bg-white text-black font-bold px-4 rounded-xl">Guardar</button>
                </div>
            </div>

            {/* Temas */}
            <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                 <h3 className="font-bold mb-4">Tema de Color</h3>
                 <div className="flex gap-3">
                     {THEMES.map(t => (
                         <button key={t.name} onClick={() => selectTheme(t)} 
                                 className={`w-12 h-12 rounded-full ${t.color} border-2 ${currentTheme.name === t.name ? 'border-white scale-110' : 'border-transparent opacity-50'} transition-all`}></button>
                     ))}
                 </div>
            </div>
          </div>
        )}
      </main>

      {/* NAVBAR INFERIOR */}
      <nav className="fixed bottom-0 w-full bg-neutral-900 border-t border-neutral-800 flex justify-around p-4 pb-6 z-50">
          <button onClick={() => setView('cocina')} className={`flex flex-col items-center gap-1 ${view === 'cocina' ? currentTheme.text : 'text-neutral-500'}`}>
              <Pizza size={24} /> <span className="text-[10px] font-bold uppercase">Cocina</span>
          </button>
          <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-1 ${view === 'menu' ? currentTheme.text : 'text-neutral-500'}`}>
              <ChefHat size={24} /> <span className="text-[10px] font-bold uppercase">Menú</span>
          </button>
          <button onClick={() => setView('config')} className={`flex flex-col items-center gap-1 ${view === 'config' ? currentTheme.text : 'text-neutral-500'}`}>
              <Settings size={24} /> <span className="text-[10px] font-bold uppercase">Ajustes</span>
          </button>
      </nav>
    </div>
  );
}