'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CONEXIÓN ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function VitoPizzaApp() {
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombreInvitado, setNombreInvitado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [misPedidos, setMisPedidos] = useState<Record<string, number>>({}); 
  const [config, setConfig] = useState({ porciones_por_pizza: 8 });

  // Función principal de carga de datos
  const fetchDatos = useCallback(async () => {
    // 1. Traer Config
    const { data: dataConfig } = await supabase.from('configuracion_dia').select('*').single();
    const porcionesPorPizza = dataConfig?.porciones_por_pizza || 8;
    setConfig({ porciones_por_pizza: porcionesPorPizza });

    // 2. Traer Pedidos
    const { data: dataPedidos } = await supabase.from('pedidos').select('*').neq('estado', 'entregado');
    
    // 3. Traer Menú
    const { data: dataPizzas } = await supabase.from('menu_pizzas').select('*').eq('activa', true);

    if (dataPizzas && dataPedidos) {
      // CALCULO MATEMÁTICO
      const pizzasProcesadas = dataPizzas.map(pizza => {
        const pedidosDeEsta = dataPedidos.filter(p => p.pizza_id === pizza.id);
        const totalPorciones = pedidosDeEsta.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
        
        const ocupadasActual = totalPorciones % porcionesPorPizza;
        // Si ocupadas es 0 y hay pedidos, es una pizza nueva (0 ocupadas), si no, es lo que falta
        const faltanParaCompletar = porcionesPorPizza - ocupadasActual;
        
        return {
          ...pizza,
          ocupadasActual,
          faltanParaCompletar,
          porcentajeBarra: (ocupadasActual / porcionesPorPizza) * 100
        };
      });

      setPizzas(pizzasProcesadas);

      // Calcular Mis Pedidos
      if (nombreInvitado) {
        const mis = dataPedidos
          .filter(p => p.invitado_nombre.toLowerCase() === nombreInvitado.toLowerCase().trim())
          .reduce((acc: any, curr) => {
            acc[curr.pizza_id] = (acc[curr.pizza_id] || 0) + curr.cantidad_porciones;
            return acc;
          }, {});
        setMisPedidos(mis);
      }
    }
    setCargando(false);
  }, [nombreInvitado]);

  // --- EFECTO MAESTRO (Carga Inicial + Tiempo Real) ---
  useEffect(() => {
    // 1. Cargar datos apenas entramos
    fetchDatos();

    // 2. Suscribirse a cambios en TIEMPO REAL (Websockets)
    // Esto hace que apenas alguien pida, tu pantalla se actualice sola
    const canal = supabase
      .channel('cambios-pizza')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'pedidos' }, 
        () => {
          // Si pasa algo en la tabla pedidos (INSERT, UPDATE, DELETE), recargamos los datos
          fetchDatos();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'configuracion_dia' },
        () => {
           // Si vos cambias el tamaño de pizza en admin, se actualiza acá también
           fetchDatos();
        }
      )
      .subscribe();

    // Limpieza al salir
    return () => {
      supabase.removeChannel(canal);
    };
  }, [fetchDatos]);

  async function pedirPorcion(pizzaId: string, nombrePizza: string) {
    if (!nombreInvitado.trim()) {
      alert('¡Hola! Escribí tu nombre arriba para saber quién pide.');
      return;
    }

    // Insertar pedido
    const { error } = await supabase.from('pedidos').insert([
      { invitado_nombre: nombreInvitado, pizza_id: pizzaId, cantidad_porciones: 1 }
    ]);

    if (error) {
      alert('Error al pedir. Intenta de nuevo.');
    } else {
      setMensaje(`¡Marchando +1 de ${nombrePizza}!`);
      setTimeout(() => setMensaje(''), 3000);
      // fetchDatos() se ejecutará solo gracias a la suscripción realtime
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans p-4 pb-20">
      <header className="text-center py-6 mb-4">
        <h1 className="text-4xl font-extrabold text-orange-500 tracking-tight">IL FORNO DI VITO</h1>
        <p className="text-neutral-400 mt-2 text-xs uppercase tracking-widest">
          Pizza de {config.porciones_por_pizza} porciones hoy
        </p>
      </header>

      {/* INPUT NOMBRE */}
      <div className="max-w-md mx-auto mb-10 sticky top-2 z-40">
        <div className="bg-neutral-800/90 backdrop-blur p-2 rounded-xl flex shadow-lg border border-neutral-700 items-center">
          <span className="pl-3 pr-2 text-xl">👤</span>
          <input 
            type="text" 
            placeholder="Tu nombre aquí..." 
            className="w-full bg-transparent text-white outline-none placeholder-neutral-500 font-bold"
            value={nombreInvitado}
            onChange={(e) => setNombreInvitado(e.target.value)}
          />
        </div>
      </div>

      {/* NOTIFICACIÓN */}
      {mensaje && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce font-bold text-sm whitespace-nowrap border-2 border-green-400">
          {mensaje} 🍕
        </div>
      )}

      {/* LISTA DE PIZZAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {cargando && pizzas.length === 0 ? (
          <p className="text-center text-neutral-500 mt-10 animate-pulse">Cargando hornos...</p>
        ) : (
          pizzas.map((pizza) => (
            <div key={pizza.id} className="bg-neutral-800 rounded-2xl p-0 border border-neutral-700 shadow-xl overflow-hidden flex flex-col">
              
              <div className="p-5 flex-1 relative">
                {/* Badge de "Mi Pedido" */}
                {misPedidos[pizza.id] > 0 && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-orange-400">
                    Pediste {misPedidos[pizza.id]}
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-1">{pizza.nombre}</h3>
                <p className="text-neutral-400 text-sm mb-6 leading-relaxed">{pizza.descripcion}</p>
                
                {/* BARRA DE PROGRESO */}
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <div className="flex justify-between text-xs text-neutral-400 mb-2 font-mono uppercase">
                    <span>Progreso actual</span>
                    <span className={pizza.faltanParaCompletar === 0 ? "text-green-500 font-bold" : ""}>
                      {pizza.faltanParaCompletar === config.porciones_por_pizza 
                        ? "Empieza una nueva" 
                        : `Faltan ${pizza.faltanParaCompletar}`}
                    </span>
                  </div>
                  
                  {/* Track */}
                  <div className="h-4 bg-neutral-700 rounded-full overflow-hidden relative">
                    {/* Guías */}
                    <div className="absolute inset-0 flex justify-between px-[1px]">
                        {[...Array(config.porciones_por_pizza)].map((_, i) => (
                             <div key={i} className="w-[1px] h-full bg-black/20 z-10"></div>
                        ))}
                    </div>
                    {/* Relleno */}
                    <div 
                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-500 ease-out relative z-0" 
                        style={{ width: `${pizza.porcentajeBarra}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-[10px] text-neutral-500 mt-2 text-right">
                    {pizza.ocupadasActual} / {config.porciones_por_pizza} tomadas
                  </p>
                </div>
              </div>

              <button 
                onClick={() => pedirPorcion(pizza.id, pizza.nombre)}
                className="w-full py-4 bg-white text-black font-black hover:bg-orange-500 hover:text-white transition-all active:bg-orange-600 flex justify-center items-center gap-2 text-lg active:scale-95 transform duration-100"
              >
                ¡QUIERO UNA! 
                <span className="text-xl">+</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}