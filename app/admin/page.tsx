'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  
  // Datos
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ porciones_por_pizza: 8, total_invitados: 20 });
  const [vista, setVista] = useState<'cocina' | 'invitados' | 'menu'>('cocina');

  useEffect(() => {
    if (autenticado) {
      cargarDatos();
      const canal = supabase.channel('admin-realtime')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => cargarDatos())
        .subscribe();
      return () => { supabase.removeChannel(canal); };
    }
  }, [autenticado]);

  const ingresar = async () => {
    const { data } = await supabase.from('configuracion_dia').select('*').single();
    if (data && data.password_admin === password) {
      setAutenticado(true);
      setConfig(data); // Cargamos la config inicial
      cargarDatos();
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const cargarDatos = async () => {
    // Pizzas (Traemos TODAS, activas e inactivas para poder gestionarlas)
    const { data: dataPizzas } = await supabase.from('menu_pizzas').select('*').order('nombre');
    if (dataPizzas) setPizzas(dataPizzas);

    // Pedidos
    const { data: dataPedidos } = await supabase.from('pedidos').select('*').neq('estado', 'entregado');
    if (dataPedidos) setPedidos(dataPedidos);
    
    // Config actualizada
    const { data: dataConfig } = await supabase.from('configuracion_dia').select('*').single();
    if (dataConfig) setConfig(dataConfig);
  };

  // --- ACCIONES ---
  const togglePizza = async (id: string, estadoActual: boolean) => {
    await supabase.from('menu_pizzas').update({ activa: !estadoActual }).eq('id', id);
    cargarDatos();
  };

  const actualizarConfig = async (campo: string, valor: any) => {
    await supabase.from('configuracion_dia').update({ [campo]: valor }).eq('id', config.id);
  };

  // --- CÁLCULOS ---
  const calcularMetricas = () => {
    const porcionesPorPizza = config.porciones_por_pizza || 8;
    
    // Agrupar pedidos por invitado
    const invitadosUnicos = Array.from(new Set(pedidos.map(p => p.invitado_nombre.toLowerCase())));
    const detalleInvitados = invitadosUnicos.map(nombre => {
        const susPedidos = pedidos.filter(p => p.invitado_nombre.toLowerCase() === nombre);
        const totalPorciones = susPedidos.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
        // Resumen de qué pidió: "2 Mortapesto, 1 Marinara"
        const resumen = susPedidos.reduce((acc: any, curr) => {
             const pizzaNombre = pizzas.find(pz => pz.id === curr.pizza_id)?.nombre || 'Pizza';
             acc[pizzaNombre] = (acc[pizzaNombre] || 0) + curr.cantidad_porciones;
             return acc;
        }, {});
        return { nombre, totalPorciones, resumen };
    });

    // Calcular pizzas
    const pizzasCalculadas = pizzas.filter(p => p.activa).map(pizza => {
      const pedidosDeEsta = pedidos.filter(p => p.pizza_id === pizza.id);
      const total = pedidosDeEsta.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
      const completas = Math.floor(total / porcionesPorPizza);
      const resto = total % porcionesPorPizza;
      return { ...pizza, completas, resto, porcentaje: (resto / porcionesPorPizza) * 100 };
    });

    return { pizzasCalculadas, detalleInvitados, invitadosCount: invitadosUnicos.length };
  };

  const { pizzasCalculadas, detalleInvitados, invitadosCount } = calcularMetricas();


  if (!autenticado) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-neutral-900 p-8 rounded-xl text-center border border-neutral-800">
        <h1 className="text-orange-500 font-bold mb-4">IL FORNO ADMIN</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-black text-white p-2 rounded border border-neutral-700 block w-full mb-4" placeholder="Contraseña" />
        <button onClick={ingresar} className="bg-orange-600 px-6 py-2 rounded text-white font-bold w-full">ENTRAR</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans pb-20">
      {/* HEADER CONFIG */}
      <header className="bg-neutral-800 p-4 border-b border-neutral-700 sticky top-0 z-50 shadow-lg">
        <div className="flex justify-between items-center mb-4">
           <h1 className="text-xl font-bold text-orange-500">Panel de Mando</h1>
           <div className="text-xs text-neutral-400">
             {invitadosCount} / {config.total_invitados} invitados activos
           </div>
        </div>
        
        {/* PESTAÑAS */}
        <div className="flex gap-2">
            <button onClick={() => setVista('cocina')} className={`flex-1 py-2 rounded text-sm font-bold ${vista === 'cocina' ? 'bg-orange-600 text-white' : 'bg-neutral-700 text-neutral-400'}`}>
                🔥 Cocina
            </button>
            <button onClick={() => setVista('invitados')} className={`flex-1 py-2 rounded text-sm font-bold ${vista === 'invitados' ? 'bg-orange-600 text-white' : 'bg-neutral-700 text-neutral-400'}`}>
                👥 Invitados
            </button>
            <button onClick={() => setVista('menu')} className={`flex-1 py-2 rounded text-sm font-bold ${vista === 'menu' ? 'bg-orange-600 text-white' : 'bg-neutral-700 text-neutral-400'}`}>
                🍕 Menú
            </button>
        </div>
      </header>

      <div className="p-4">
        
        {/* VISTA 1: COCINA (Lo que ya tenías) */}
        {vista === 'cocina' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {pizzasCalculadas.map(pizza => (
                <div key={pizza.id} className={`p-5 rounded-xl border ${pizza.completas > 0 ? 'bg-green-900/30 border-green-500' : 'bg-neutral-800 border-neutral-700'}`}>
                   <div className="flex justify-between">
                       <h2 className="font-bold text-lg">{pizza.nombre}</h2>
                       {pizza.completas > 0 && <span className="text-2xl animate-bounce">🔔</span>}
                   </div>
                   
                   {pizza.completas > 0 ? (
                       <div className="my-4 bg-green-600 text-white p-4 rounded-lg text-center font-black text-3xl">
                           MARCHAR {pizza.completas}
                       </div>
                   ) : (
                       <div className="my-4 text-neutral-500 text-sm text-center py-2">Faltan pedidos...</div>
                   )}

                   <div className="mt-2">
                       <div className="flex justify-between text-xs text-neutral-400 mb-1">
                           <span>Próxima</span>
                           <span>{pizza.resto} / {config.porciones_por_pizza}</span>
                       </div>
                       <div className="h-2 bg-black rounded-full overflow-hidden">
                           <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${pizza.porcentaje}%` }}></div>
                       </div>
                   </div>
                </div>
             ))}
          </div>
        )}

        {/* VISTA 2: LISTA DE INVITADOS */}
        {vista === 'invitados' && (
           <div className="space-y-4">
               {/* Configurar Total */}
               <div className="bg-neutral-800 p-4 rounded-xl flex justify-between items-center border border-neutral-700 mb-6">
                   <span className="text-sm text-neutral-400">Total Invitados Esperados:</span>
                   <div className="flex items-center gap-3">
                       <button onClick={() => actualizarConfig('total_invitados', config.total_invitados - 1)} className="w-8 h-8 bg-neutral-700 rounded-full">-</button>
                       <span className="font-bold text-xl w-8 text-center">{config.total_invitados}</span>
                       <button onClick={() => actualizarConfig('total_invitados', config.total_invitados + 1)} className="w-8 h-8 bg-neutral-700 rounded-full">+</button>
                   </div>
               </div>

               <h3 className="text-neutral-500 text-xs uppercase tracking-widest mb-2">Detalle de pedidos ({invitadosCount})</h3>
               
               {detalleInvitados.length === 0 ? (
                   <p className="text-neutral-500 text-center italic">Nadie ha pedido todavía.</p>
               ) : (
                   detalleInvitados.map((inv, i) => (
                       <div key={i} className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                           <div className="flex justify-between items-center border-b border-neutral-700 pb-2 mb-2">
                               <span className="font-bold text-lg capitalize">{inv.nombre}</span>
                               <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full font-bold">
                                   {inv.totalPorciones} porciones
                               </span>
                           </div>
                           <div className="text-sm text-neutral-400 space-y-1">
                               {Object.entries(inv.resumen).map(([gusto, cantidad]: any) => (
                                   <div key={gusto} className="flex justify-between">
                                       <span>{gusto}</span>
                                       <span className="text-white">x{cantidad}</span>
                                   </div>
                               ))}
                           </div>
                       </div>
                   ))
               )}
           </div>
        )}

        {/* VISTA 3: MENÚ (Config) */}
        {vista === 'menu' && (
            <div className="space-y-6">
                
                {/* Config Porciones */}
                <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                    <h3 className="font-bold mb-4">Configuración del Horno</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-400">Porciones por Pizza:</span>
                        <select 
                            className="bg-black border border-neutral-600 p-2 rounded"
                            value={config.porciones_por_pizza}
                            onChange={(e) => actualizarConfig('porciones_por_pizza', parseInt(e.target.value))}
                        >
                            <option value="4">4 Porciones</option>
                            <option value="6">6 Porciones</option>
                            <option value="8">8 Porciones</option>
                        </select>
                    </div>
                </div>

                {/* Lista de Gustos */}
                <h3 className="font-bold pt-4">Gestionar Gustos</h3>
                <div className="space-y-3">
                    {pizzas.map(pizza => (
                        <div key={pizza.id} className="flex justify-between items-center bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                            <div>
                                <h4 className={`font-bold ${!pizza.activa && 'text-neutral-500 line-through'}`}>{pizza.nombre}</h4>
                                <p className="text-xs text-neutral-500">{pizza.activa ? 'Visible en menú' : 'Oculta para invitados'}</p>
                            </div>
                            
                            <button 
                                onClick={() => togglePizza(pizza.id, pizza.activa)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${pizza.activa ? 'bg-green-500' : 'bg-neutral-600'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${pizza.activa ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}