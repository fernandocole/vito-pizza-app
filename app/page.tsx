'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- TRADUCCIONES ---
const dictionary = {
  es: {
    welcome: "Gracias por venir, será un placer cocinar para vos.",
    whoAreYou: "¿Cuál es tu nombre?",
    namePlaceholder: "Tu nombre aquí...",
    hello: "Hola",
    orderPrompt: "pedí lo que quieras.",
    guestsCount: "amigos ya pidieron.",
    loading: "Calentando hornos...",
    progress: "Progreso actual",
    newPizza: "Empieza una nueva",
    missing: "Faltan",
    taken: "tomadas",
    buttonOrder: "¡QUIERO UNA!",
    orderedBadge: "Pediste",
    successMsg: "¡Marchando +1 de",
    errorMsg: "Error al pedir. Intenta de nuevo.",
    noName: "¡Hola! Escribí tu nombre arriba para saber quién pide."
  },
  en: {
    welcome: "Thanks for coming, it will be a pleasure to cook for you.",
    whoAreYou: "Who are you?",
    namePlaceholder: "Your name here...",
    hello: "Hi",
    orderPrompt: "order whatever you like.",
    guestsCount: "friends have ordered.",
    loading: "Heating up ovens...",
    progress: "Current progress",
    newPizza: "Starting a new one",
    missing: "Missing",
    taken: "taken",
    buttonOrder: "I WANT ONE!",
    orderedBadge: "You ordered",
    successMsg: "Coming right up! +1 of",
    errorMsg: "Error ordering. Try again.",
    noName: "Hi! Please write your name above so we know who's ordering."
  }
};

// --- CONEXIÓN ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function VitoPizzaApp() {
  const [lang, setLang] = useState<'es' | 'en'>('es'); // Estado del idioma
  const t = dictionary[lang]; // Alias corto para traducciones

  const [pizzas, setPizzas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombreInvitado, setNombreInvitado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [misPedidos, setMisPedidos] = useState<Record<string, number>>({}); 
  const [config, setConfig] = useState({ porciones_por_pizza: 8, total_invitados: 20 });
  const [invitadosActivos, setInvitadosActivos] = useState(0);

  const fetchDatos = useCallback(async () => {
    // 1. Configuración
    const { data: dataConfig } = await supabase.from('configuracion_dia').select('*').single();
    const conf = dataConfig || { porciones_por_pizza: 8, total_invitados: 20 };
    setConfig(conf);

    // 2. Pedidos
    const { data: dataPedidos } = await supabase.from('pedidos').select('*').neq('estado', 'entregado');
    
    // 3. Menú (Solo activas)
    const { data: dataPizzas } = await supabase.from('menu_pizzas').select('*').eq('activa', true);

    if (dataPizzas && dataPedidos) {
      // Calcular métricas
      const invitadosUnicos = new Set(dataPedidos.map(p => p.invitado_nombre.toLowerCase().trim()));
      setInvitadosActivos(invitadosUnicos.size);

      const pizzasProcesadas = dataPizzas.map(pizza => {
        const pedidosDeEsta = dataPedidos.filter(p => p.pizza_id === pizza.id);
        const totalPorciones = pedidosDeEsta.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
        
        const ocupadasActual = totalPorciones % conf.porciones_por_pizza;
        const faltanParaCompletar = conf.porciones_por_pizza - ocupadasActual;
        
        return {
          ...pizza,
          ocupadasActual,
          faltanParaCompletar,
          porcentajeBarra: (ocupadasActual / conf.porciones_por_pizza) * 100
        };
      });

      setPizzas(pizzasProcesadas);

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

  useEffect(() => {
    fetchDatos();
    const canal = supabase.channel('invitados-realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchDatos())
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [fetchDatos]);

  async function pedirPorcion(pizzaId: string, nombrePizza: string) {
    if (!nombreInvitado.trim()) {
      alert(t.noName);
      return;
    }
    const { error } = await supabase.from('pedidos').insert([
      { invitado_nombre: nombreInvitado, pizza_id: pizzaId, cantidad_porciones: 1 }
    ]);

    if (error) {
      alert(t.errorMsg);
    } else {
      setMensaje(`${t.successMsg} ${nombrePizza}!`);
      setTimeout(() => setMensaje(''), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans p-4 pb-24">
      
      {/* HEADER & IDIOMA */}
      <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-orange-500 tracking-tighter">IL FORNO DI VITO</h1>
            <p className="text-neutral-400 text-xs mt-1 max-w-[200px] leading-tight">{t.welcome}</p>
          </div>
          <button 
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="bg-neutral-800 border border-neutral-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-neutral-300"
          >
            {lang === 'es' ? '🇺🇸 EN' : '🇦🇷 ES'}
          </button>
      </div>

      {/* CONTADOR DE INVITADOS */}
      <div className="mb-6 bg-neutral-800/50 p-3 rounded-lg border border-neutral-700/50 flex items-center justify-between text-xs text-neutral-400">
         <span>Status del evento:</span>
         <span className="text-white font-bold">
            {invitadosActivos} / {config.total_invitados} {t.guestsCount}
         </span>
      </div>

      {/* INPUT NOMBRE */}
      <div className="max-w-md mx-auto mb-8 sticky top-2 z-40">
        <div className="bg-neutral-800/95 backdrop-blur-md p-2 rounded-xl flex shadow-2xl border border-neutral-600 items-center ring-1 ring-black/50">
          <span className="pl-3 pr-2 text-xl">👤</span>
          <input 
            type="text" 
            placeholder={t.namePlaceholder}
            className="w-full bg-transparent text-white outline-none placeholder-neutral-500 font-bold"
            value={nombreInvitado}
            onChange={(e) => setNombreInvitado(e.target.value)}
          />
        </div>
        {nombreInvitado && (
          <p className="text-center text-xs text-orange-400 mt-2 font-medium">
            {t.hello} {nombreInvitado}, {t.orderPrompt}
          </p>
        )}
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
          <p className="text-center text-neutral-500 mt-10 animate-pulse">{t.loading}</p>
        ) : (
          pizzas.map((pizza) => (
            <div key={pizza.id} className="bg-neutral-800 rounded-2xl border border-neutral-700 shadow-xl overflow-hidden flex flex-col">
              
              <div className="p-5 flex-1 relative">
                {misPedidos[pizza.id] > 0 && (
                  <div className="absolute top-4 right-4 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow border border-orange-400 uppercase tracking-wide">
                    {t.orderedBadge} {misPedidos[pizza.id]}
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-1 leading-none">{pizza.nombre}</h3>
                <p className="text-neutral-400 text-sm mb-5 leading-relaxed mt-2">{pizza.descripcion}</p>
                
                {/* BARRA */}
                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                  <div className="flex justify-between text-[10px] text-neutral-400 mb-2 font-mono uppercase tracking-wider">
                    <span>{t.progress}</span>
                    <span className={pizza.faltanParaCompletar === 0 ? "text-green-500 font-bold" : ""}>
                      {pizza.faltanParaCompletar === config.porciones_por_pizza 
                        ? t.newPizza 
                        : `${t.missing} ${pizza.faltanParaCompletar}`}
                    </span>
                  </div>
                  
                  <div className="h-3 bg-neutral-700 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 flex justify-between px-[1px]">
                        {[...Array(config.porciones_por_pizza)].map((_, i) => (
                             <div key={i} className="w-[1px] h-full bg-black/30 z-10"></div>
                        ))}
                    </div>
                    <div 
                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-500 relative z-0" 
                        style={{ width: `${pizza.porcentajeBarra}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-[9px] text-neutral-500 mt-2 text-right">
                    {pizza.ocupadasActual} / {config.porciones_por_pizza} {t.taken}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => pedirPorcion(pizza.id, pizza.nombre)}
                className="w-full py-4 bg-white text-black font-black hover:bg-orange-500 hover:text-white transition-all active:bg-orange-600 flex justify-center items-center gap-2 text-base uppercase tracking-widest active:scale-95 transform duration-100"
              >
                {t.buttonOrder} 
                <span className="text-xl leading-none">+</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}