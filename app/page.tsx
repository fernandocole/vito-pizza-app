'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Minus, User, Palette, Flame, Lock, Globe } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const THEMES = [
  { name: 'Carbone', color: 'bg-neutral-600', gradient: 'from-neutral-700 to-neutral-900', border: 'border-neutral-600/40', text: 'text-neutral-400' },
  { name: 'Turquesa', color: 'bg-cyan-600', gradient: 'from-cyan-600 to-teal-900', border: 'border-cyan-600/40', text: 'text-cyan-400' },
  { name: 'Pistacho', color: 'bg-lime-600', gradient: 'from-lime-600 to-green-900', border: 'border-lime-600/40', text: 'text-lime-400' },
  { name: 'Fuego', color: 'bg-red-600', gradient: 'from-red-600 to-rose-900', border: 'border-red-600/40', text: 'text-red-500' },
  { name: 'Violeta', color: 'bg-violet-600', gradient: 'from-violet-600 to-purple-900', border: 'border-violet-600/40', text: 'text-violet-400' },
];

const dictionary = {
  es: {
    welcomeTitle: "Gracias por venir hoy,",
    welcomeSub: "será un placer cocinar para vos.",
    whoAreYou: "¿QUIÉN SOS?",
    namePlaceholder: "Tu nombre...",
    status: "amigos ya pidieron.",
    loading: "Encendiendo el horno...",
    progress: "PROGRESO",
    newPizza: "NUEVA PIZZA",
    missing: "FALTAN",
    completed: "¡COMPLETA!",
    buttonOrder: "PEDIR",
    inOven: "EN HORNO",
    wait: "Espera",
    ate: "Comiste",
    customize: "Elige tu estilo:",
    errorName: "¡Primero decime tu nombre arriba!",
    errorOven: "⚠️ ¡Ya está en el horno! No podés cancelar ahora.",
    successOrder: "¡Marchando +1 de",
    successCancel: "Cancelado -1 de"
  },
  en: {
    welcomeTitle: "Thanks for coming today,",
    welcomeSub: "it will be a pleasure to cook for you.",
    whoAreYou: "WHO ARE YOU?",
    namePlaceholder: "Your name...",
    status: "friends have ordered.",
    loading: "Firing up the oven...",
    progress: "PROGRESS",
    newPizza: "NEW PIZZA",
    missing: "MISSING",
    completed: "COMPLETED!",
    buttonOrder: "ORDER",
    inOven: "IN OVEN",
    wait: "Wait",
    ate: "Ate",
    customize: "Choose style:",
    errorName: "Please enter your name first!",
    errorOven: "⚠️ Already in the oven! Cannot cancel now.",
    successOrder: "Coming right up! +1 of",
    successCancel: "Removed -1 of"
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
  const [config, setConfig] = useState({ porciones_por_pizza: 8, total_invitados: 20 });
  const [invitadosActivos, setInvitadosActivos] = useState(0);

  // Historial personal
  const [miHistorial, setMiHistorial] = useState<Record<string, { pendientes: number, comidos: number }>>({});

  // Tema
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('vito-guest-name');
    if (savedName) setNombreInvitado(savedName);
    const savedTheme = localStorage.getItem('vito-guest-theme');
    if (savedTheme) {
      const found = THEMES.find(t => t.name === savedTheme);
      if (found) setCurrentTheme(found);
    }
  }, []);

  const handleNameChange = (val: string) => { setNombreInvitado(val); localStorage.setItem('vito-guest-name', val); };
  const changeTheme = (theme: typeof THEMES[0]) => { setCurrentTheme(theme); localStorage.setItem('vito-guest-theme', theme.name); setShowThemeSelector(false); };

  const fetchDatos = useCallback(async () => {
    const { data: dataConfig } = await supabase.from('configuracion_dia').select('*').single();
    const conf = dataConfig || { porciones_por_pizza: 8, total_invitados: 20 };
    setConfig(conf);

    const { data: dataPedidos } = await supabase.from('pedidos').select('*');
    const { data: dataPizzas } = await supabase.from('menu_pizzas').select('*').eq('activa', true).order('created_at');

    if (dataPizzas && dataPedidos) {
      setInvitadosActivos(new Set(dataPedidos.map(p => p.invitado_nombre.toLowerCase().trim())).size);

      const pizzasProcesadas = dataPizzas.map(pizza => {
        const pedidosPendientesPizza = dataPedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado');
        const totalPendientes = pedidosPendientesPizza.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
        
        const target = pizza.porciones_individuales || conf.porciones_por_pizza;
        const ocupadasActual = totalPendientes % target;
        
        return {
          ...pizza,
          target,
          ocupadasActual,
          faltanParaCompletar: target - ocupadasActual,
          porcentajeBarra: (ocupadasActual / target) * 100
        };
      });

      setPizzas(pizzasProcesadas);

      if (nombreInvitado) {
        const mis = dataPedidos.filter(p => p.invitado_nombre.toLowerCase() === nombreInvitado.toLowerCase().trim());
        const resumen: any = {};
        dataPizzas.forEach(pz => {
             const misDeEsta = mis.filter(p => p.pizza_id === pz.id);
             resumen[pz.id] = {
                 pendientes: misDeEsta.filter(p => p.estado !== 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0),
                 comidos: misDeEsta.filter(p => p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0)
             };
        });
        setMiHistorial(resumen);
      }
    }
    setCargando(false);
  }, [nombreInvitado]);

  useEffect(() => {
    fetchDatos();
    const canal = supabase.channel('app-realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchDatos()).subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [fetchDatos]);

  async function modificarPedido(pizza: any, accion: 'sumar' | 'restar') {
    if (!nombreInvitado.trim()) { alert(t.errorName); return; }

    if (accion === 'sumar') {
        const { error } = await supabase.from('pedidos').insert([{ invitado_nombre: nombreInvitado, pizza_id: pizza.id, cantidad_porciones: 1, estado: 'pendiente' }]);
        if (!error) mostrarMensaje(`${t.successOrder} ${pizza.nombre}!`);
    } else {
        if (pizza.cocinando) {
            alert(t.errorOven);
            return;
        }

        const { data } = await supabase.from('pedidos').select('id').eq('pizza_id', pizza.id).ilike('invitado_nombre', nombreInvitado.trim()).eq('estado', 'pendiente').order('created_at', { ascending: false }).limit(1).single();
        if (data) {
            await supabase.from('pedidos').delete().eq('id', data.id);
            mostrarMensaje(`${t.successCancel} ${pizza.nombre}`);
        }
    }
  }

  const mostrarMensaje = (txt: string) => { setMensaje(txt); setTimeout(() => setMensaje(''), 2500); }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans pb-20 transition-colors duration-500 overflow-x-hidden">
      
      {/* HEADER HERO */}
      <div className={`w-full p-6 pb-12 rounded-b-[40px] bg-gradient-to-br ${currentTheme.gradient} shadow-2xl relative overflow-hidden`}>
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mt-20 -mr-20 blur-3xl"></div>
         
         <div className="relative z-10">
             <div className="flex justify-between items-center mb-6">
                <span className="font-bold tracking-widest text-[10px] uppercase bg-black/30 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">Il Forno Di Vito</span>
                <div className="flex gap-2">
                   {/* Idioma */}
                   <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="bg-black/20 p-2 rounded-full hover:bg-black/40 border border-white/10"><Globe size={18}/></button>
                   {/* Temas */}
                   <button onClick={() => setShowThemeSelector(!showThemeSelector)} className="bg-black/20 p-2 rounded-full hover:bg-black/40 border border-white/10"><Palette size={18} /></button>
                   {/* Acceso Admin */}
                   <Link href="/admin" className="bg-black/20 p-2 rounded-full hover:bg-black/40 border border-white/10"><Lock size={18} /></Link>
                </div>
             </div>

             {showThemeSelector && (
               <div className="mb-6 bg-black/40 p-3 rounded-2xl backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-top-2">
                 <p className="text-[10px] text-neutral-300 mb-2 font-bold uppercase tracking-wider">{t.customize}</p>
                 <div className="flex gap-4 justify-center">
                    {THEMES.map(theme => (
                      <button key={theme.name} onClick={() => changeTheme(theme)} className={`w-10 h-10 rounded-full ${theme.color} border-2 ${currentTheme.name === theme.name ? 'border-white scale-110 shadow-[0_0_10px_white]' : 'border-transparent opacity-60'}`}></button>
                    ))}
                 </div>
               </div>
             )}
             
             <h1 className="text-3xl font-bold leading-tight mb-2 drop-shadow-md">{t.welcomeTitle} <br/> <span className="opacity-80 font-normal text-xl">{t.welcomeSub}</span></h1>
             
             <div className="mt-6 flex items-center gap-3 text-sm font-medium bg-black/30 p-3 rounded-2xl w-max backdrop-blur-md border border-white/10">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-neutral-800 border-2 border-neutral-700"></div>)}
                </div>
                <span className="text-neutral-300 text-xs">{invitadosActivos} {t.status}</span>
             </div>
         </div>
      </div>

      <div className="px-4 -mt-8 relative z-20 max-w-lg mx-auto">
        
        {/* INPUT USUARIO */}
        <div className={`bg-neutral-900 p-2 rounded-2xl shadow-xl border ${currentTheme.border} flex items-center gap-3 mb-6`}>
             <div className={`p-3 rounded-xl bg-gradient-to-br ${currentTheme.gradient} text-white shadow-lg`}>
                 <User size={24} />
             </div>
             <div className="flex-1 pr-2">
                 <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">{t.whoAreYou}</label>
                 <input type="text" value={nombreInvitado} onChange={e => handleNameChange(e.target.value)} placeholder={t.namePlaceholder}
                    className="w-full text-lg font-bold text-white outline-none placeholder-neutral-600 bg-transparent" />
             </div>
        </div>

        {mensaje && (
          <div className="fixed top-4 left-4 right-4 bg-white text-black p-4 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.3)] z-50 flex items-center justify-center animate-bounce font-bold text-center">
            {mensaje} 🍕
          </div>
        )}

        {/* LISTA PIZZAS */}
        <div className="space-y-6 pb-10">
           {cargando ? <p className="text-center text-neutral-600 mt-10 animate-pulse">{t.loading}</p> : pizzas.map(pizza => (
               <div key={pizza.id} className={`bg-neutral-900 p-5 rounded-[36px] border ${pizza.cocinando ? 'border-orange-500/30' : 'border-neutral-800'} shadow-lg relative overflow-hidden group`}>
                   
                   {/* HEADER PIZZA */}
                   <div className="flex justify-between items-start mb-2">
                       <div>
                           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                               {pizza.nombre}
                               {pizza.cocinando && <span className="bg-orange-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse"><Flame size={10}/> {t.inOven}</span>}
                           </h2>
                           <p className="text-neutral-500 text-xs leading-relaxed max-w-[200px]">{pizza.descripcion}</p>
                       </div>
                       
                       {/* STATUS PERSONAL */}
                       {(miHistorial[pizza.id]?.pendientes > 0 || miHistorial[pizza.id]?.comidos > 0) && (
                           <div className="bg-neutral-800 rounded-2xl p-2 px-3 border border-white/5 text-right">
                               {miHistorial[pizza.id]?.pendientes > 0 && (
                                   <div className={`text-[10px] font-bold ${currentTheme.text} uppercase`}>
                                       {t.wait}: {miHistorial[pizza.id].pendientes}
                                   </div>
                               )}
                               {miHistorial[pizza.id]?.comidos > 0 && (
                                   <div className="text-[10px] text-neutral-500 font-bold uppercase">
                                       {t.ate}: {miHistorial[pizza.id].comidos}
                                   </div>
                               )}
                           </div>
                       )}
                   </div>

                   {/* BARRA DE PROGRESO */}
                   <div className="bg-black/40 p-3 rounded-2xl border border-white/5 mb-5 mt-4">
                       <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                           <span>{pizza.faltanParaCompletar === pizza.target ? t.newPizza : t.progress}</span>
                           <span className={pizza.faltanParaCompletar === 0 ? currentTheme.text : "text-neutral-400"}>
                               {pizza.faltanParaCompletar > 0 ? `${t.missing} ${pizza.faltanParaCompletar}` : t.completed}
                           </span>
                       </div>
                       <div className="h-2 bg-neutral-800 rounded-full overflow-hidden flex border border-white/5">
                           {[...Array(pizza.target)].map((_, i) => (
                               <div key={i} className={`flex-1 border-r border-black/50 last:border-0 ${i < pizza.ocupadasActual ? `bg-gradient-to-r ${pizza.cocinando ? 'from-orange-500 to-red-600' : currentTheme.gradient}` : 'bg-transparent'}`}></div>
                           ))}
                       </div>
                   </div>

                   {/* CONTROLES */}
                   <div className="flex gap-3">
                       {miHistorial[pizza.id]?.pendientes > 0 && (
                           <button 
                               onClick={() => modificarPedido(pizza, 'restar')}
                               disabled={pizza.cocinando}
                               className={`w-16 h-14 rounded-2xl flex items-center justify-center border transition ${pizza.cocinando ? 'bg-neutral-800/50 border-neutral-800 text-neutral-600 cursor-not-allowed' : 'bg-neutral-800 text-neutral-400 border-neutral-700 active:scale-95'}`}
                           >
                               {pizza.cocinando ? <Lock size={16}/> : <Minus size={20} />}
                           </button>
                       )}
                       
                       <button 
                           onClick={() => modificarPedido(pizza, 'sumar')}
                           className={`flex-1 h-14 rounded-2xl font-bold text-lg text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${currentTheme.gradient} hover:brightness-110`}
                       >
                           <Plus size={24} strokeWidth={3} /> {t.buttonOrder}
                       </button>
                   </div>
               </div>
           ))}
        </div>
      </div>
    </div>
  );
}