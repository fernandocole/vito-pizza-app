'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, User, Globe } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const THEMES = {
  'Pomodoro': 'from-orange-600 to-orange-500',
  'Basilico': 'from-green-600 to-green-500',
  'Mare': 'from-blue-600 to-blue-500',
  'Melanzane': 'from-purple-600 to-purple-500',
};

const dictionary = {
  es: {
    welcomeTitle: "Gracias por venir hoy,",
    welcomeSub: "será un placer cocinar para vos.",
    whoAreYou: "¿Quién sos?",
    namePlaceholder: "Tu nombre...",
    hello: "Hola",
    orderPrompt: "pedí lo que quieras.",
    status: "amigos ya pidieron.",
    loading: "Encendiendo el horno...",
    progress: "Progreso",
    newPizza: "Pizza Nueva",
    missing: "Faltan",
    taken: "tomadas",
    buttonOrder: "Pedir Porción",
    orderedBadge: "Pediste",
    successMsg: "¡Marchando +1 de",
    errorMsg: "Primero decime tu nombre arriba",
  },
  en: {
    welcomeTitle: "Thanks for coming today,",
    welcomeSub: "it will be a pleasure to cook for you.",
    whoAreYou: "Who are you?",
    namePlaceholder: "Your name...",
    hello: "Hi",
    orderPrompt: "order whatever you like.",
    status: "friends have ordered.",
    loading: "Firing up the oven...",
    progress: "Progress",
    newPizza: "Fresh Pizza",
    missing: "Missing",
    taken: "taken",
    buttonOrder: "Order Slice",
    orderedBadge: "You ordered",
    successMsg: "Coming up! +1 of",
    errorMsg: "Please enter your name first",
  }
};

export default function VitoPizzaApp() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const t = dictionary[lang];
  
  // Datos
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombreInvitado, setNombreInvitado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [misPedidos, setMisPedidos] = useState<Record<string, number>>({}); 
  const [config, setConfig] = useState({ porciones_por_pizza: 8, total_invitados: 20 });
  const [invitadosActivos, setInvitadosActivos] = useState(0);

  // Tema
  const [themeGradient, setThemeGradient] = useState(THEMES['Pomodoro']);
  const [themeName, setThemeName] = useState('Pomodoro');

  // Cargar tema
  useEffect(() => {
    const loadTheme = () => {
        const saved = localStorage.getItem('vito-theme') || 'Pomodoro';
        // @ts-ignore
        if (THEMES[saved]) {
            // @ts-ignore
            setThemeGradient(THEMES[saved]);
            setThemeName(saved);
        }
    };
    loadTheme();
    // Escuchar cambios de tema desde otra pestaña (admin)
    window.addEventListener('storage', loadTheme);
    return () => window.removeEventListener('storage', loadTheme);
  }, []);

  const fetchDatos = useCallback(async () => {
    const { data: dataConfig } = await supabase.from('configuracion_dia').select('*').single();
    const conf = dataConfig || { porciones_por_pizza: 8, total_invitados: 20 };
    setConfig(conf);

    const { data: dataPedidos } = await supabase.from('pedidos').select('*').neq('estado', 'entregado');
    const { data: dataPizzas } = await supabase.from('menu_pizzas').select('*').eq('activa', true).order('created_at');

    if (dataPizzas && dataPedidos) {
      setInvitadosActivos(new Set(dataPedidos.map(p => p.invitado_nombre.toLowerCase().trim())).size);

      const pizzasProcesadas = dataPizzas.map(pizza => {
        const pedidosDeEsta = dataPedidos.filter(p => p.pizza_id === pizza.id);
        const totalPorciones = pedidosDeEsta.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
        
        // Lógica Individual vs Global
        const targetPorciones = pizza.porciones_individuales || conf.porciones_por_pizza;

        const ocupadasActual = totalPorciones % targetPorciones;
        const faltanParaCompletar = targetPorciones - ocupadasActual;
        
        return {
          ...pizza,
          targetPorciones,
          ocupadasActual,
          faltanParaCompletar,
          porcentajeBarra: (ocupadasActual / targetPorciones) * 100
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
    const canal = supabase.channel('app-realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchDatos())
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [fetchDatos]);

  async function pedirPorcion(pizzaId: string, nombrePizza: string) {
    if (!nombreInvitado.trim()) {
      alert(t.errorMsg); return;
    }
    const { error } = await supabase.from('pedidos').insert([
      { invitado_nombre: nombreInvitado, pizza_id: pizzaId, cantidad_porciones: 1 }
    ]);
    if (!error) {
      setMensaje(`${t.successMsg} ${nombrePizza}!`);
      setTimeout(() => setMensaje(''), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans pb-20 transition-colors duration-500">
      
      {/* HEADER HERO */}
      <div className={`w-full p-8 pb-12 rounded-b-[40px] bg-gradient-to-br ${themeGradient} text-white shadow-xl relative overflow-hidden`}>
         {/* Círculos decorativos */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mt-20 -mr-20 blur-2xl"></div>
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -mb-10 -ml-10 blur-xl"></div>
         
         <div className="relative z-10">
             <div className="flex justify-between items-start mb-6">
                <span className="font-bold tracking-widest text-xs uppercase bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">Il Forno Di Vito</span>
                <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"><Globe size={18}/></button>
             </div>
             
             <h1 className="text-3xl font-bold leading-tight mb-2">{t.welcomeTitle} <br/> <span className="opacity-90 font-normal text-xl">{t.welcomeSub}</span></h1>
             
             {/* Status Bar */}
             <div className="mt-6 flex items-center gap-3 text-sm font-medium bg-black/20 p-3 rounded-2xl w-max backdrop-blur-md border border-white/10">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/80 border-2 border-transparent"></div>)}
                </div>
                <span>{invitadosActivos} / {config.total_invitados} {t.status}</span>
             </div>
         </div>
      </div>

      <div className="px-4 -mt-8 relative z-20 max-w-lg mx-auto">
        {/* INPUT USUARIO (Material Card) */}
        <div className="bg-white p-2 rounded-2xl shadow-lg border border-neutral-100 flex items-center gap-3 mb-6">
             <div className={`p-3 rounded-xl bg-gradient-to-br ${themeGradient} text-white`}>
                 <User size={24} />
             </div>
             <div className="flex-1">
                 <label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">{t.whoAreYou}</label>
                 <input 
                    type="text" 
                    value={nombreInvitado} 
                    onChange={e => setNombreInvitado(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full text-lg font-bold text-neutral-800 outline-none placeholder-neutral-300 bg-transparent"
                 />
             </div>
        </div>

        {/* NOTIFICACION */}
        {mensaje && (
          <div className={`fixed top-4 left-4 right-4 bg-neutral-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-center animate-bounce`}>
            {mensaje} 🍕
          </div>
        )}

        {/* LISTA PIZZAS */}
        <div className="space-y-5 pb-10">
           {cargando ? <p className="text-center text-neutral-400 mt-10">{t.loading}</p> : pizzas.map(pizza => (
               <div key={pizza.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-neutral-100 hover:shadow-md transition-shadow relative overflow-hidden">
                   
                   {/* Badge Cantidad */}
                   {misPedidos[pizza.id] > 0 && (
                       <div className={`absolute top-0 right-0 bg-gradient-to-bl ${themeGradient} text-white px-5 py-3 rounded-bl-3xl font-bold text-sm shadow-sm`}>
                           x{misPedidos[pizza.id]}
                       </div>
                   )}

                   <h2 className="text-2xl font-bold text-neutral-800 mb-1">{pizza.nombre}</h2>
                   <p className="text-neutral-500 text-sm leading-relaxed mb-6 pr-10">{pizza.descripcion}</p>

                   {/* Progress Section */}
                   <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 mb-4">
                       <div className="flex justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                           <span>{pizza.faltanParaCompletar === pizza.targetPorciones ? t.newPizza : t.progress}</span>
                           <span className={pizza.faltanParaCompletar === 0 ? "text-green-500" : ""}>
                               {pizza.faltanParaCompletar > 0 ? `${t.missing} ${pizza.faltanParaCompletar}` : 'Completa!'}
                           </span>
                       </div>
                       
                       <div className="h-3 bg-neutral-200 rounded-full overflow-hidden flex">
                           {[...Array(pizza.targetPorciones)].map((_, i) => (
                               <div key={i} className={`flex-1 border-r border-white last:border-0 ${i < pizza.ocupadasActual ? `bg-gradient-to-r ${themeGradient}` : 'bg-transparent'}`}></div>
                           ))}
                       </div>
                   </div>

                   {/* Action Button */}
                   <button 
                       onClick={() => pedirPorcion(pizza.id, pizza.nombre)}
                       className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 bg-gradient-to-r ${themeGradient}`}
                   >
                       <Plus size={24} strokeWidth={3} /> {t.buttonOrder}
                   </button>
               </div>
           ))}
        </div>
      </div>
    </div>
  );
}