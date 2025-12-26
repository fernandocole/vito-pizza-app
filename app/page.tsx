'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Minus, User, Palette, Flame, Lock, Globe, PartyPopper, Bell, BellOff, X } from 'lucide-react';
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
    whoAreYou: "Tu nombre?",
    namePlaceholder: "Escribilo acá...",
    status: "amigos ya pidieron.",
    loading: "Encendiendo el horno...",
    progress: "PROGRESO PRÓXIMA PIZZA",
    newPizza: "EMPEZANDO NUEVA PIZZA",
    missing: "FALTAN",
    completed: "¡COMPLETA!",
    buttonOrder: "PEDIR",
    inOven: "EN HORNO",
    wait: "Pedidas",
    ate: "Comiste",
    portions: "porciones",
    customize: "Elige tu estilo:",
    errorName: "¡Primero decime tu nombre arriba!",
    errorOven: "⚠️ ¡Ya está en el horno! No podés cancelar ahora.",
    successOrder: "¡Marchando +1 de",
    successCancel: "Cancelado -1 de",
    readyAlert: "¡TU PIZZA ESTÁ LISTA! 🍕",
    ovenAlert: "al horno!",
    okBtn: "ENTENDIDO",
    notifOn: "🔔 Notificaciones activadas",
    notifOff: "🔕 Notificaciones desactivadas"
  },
  en: {
    welcomeTitle: "Thanks for coming today,",
    welcomeSub: "it will be a pleasure to cook for you.",
    whoAreYou: "YOUR NAME?",
    namePlaceholder: "Type it here...",
    status: "friends have ordered.",
    loading: "Firing up the oven...",
    progress: "NEXT PIZZA PROGRESS",
    newPizza: "STARTING NEW PIZZA",
    missing: "MISSING",
    completed: "COMPLETED!",
    buttonOrder: "ORDER",
    inOven: "IN OVEN",
    wait: "Ordered",
    ate: "Ate",
    portions: "slices",
    customize: "Choose style:",
    errorName: "Please enter your name first!",
    errorOven: "⚠️ Already in the oven! Cannot cancel now.",
    successOrder: "Coming right up! +1 of",
    successCancel: "Removed -1 of",
    readyAlert: "YOUR PIZZA IS READY! 🍕",
    ovenAlert: "in the oven!",
    okBtn: "OK",
    notifOn: "🔔 Notifications ON",
    notifOff: "🔕 Notifications OFF"
  },
  it: {
    welcomeTitle: "Grazie per essere venuto,",
    welcomeSub: "sarà un piacere cucinare per te.",
    whoAreYou: "IL TUO NOME?",
    namePlaceholder: "Scrivilo qui...",
    status: "amici hanno ordinato.",
    loading: "Accensione del forno...",
    progress: "PROSSIMA PIZZA",
    newPizza: "INIZIO NUOVA PIZZA",
    missing: "MANCANO",
    completed: "COMPLETA!",
    buttonOrder: "ORDINA",
    inOven: "IN FORNO",
    wait: "Ordinate",
    ate: "Mangiato",
    portions: "fette",
    customize: "Scegli il tuo stile:",
    errorName: "Per favore inserisci prima il tuo nome!",
    errorOven: "⚠️ Già in forno! Impossibile annullare ora.",
    successOrder: "In arrivo! +1 di",
    successCancel: "Rimosso -1 di",
    readyAlert: "LA TUA PIZZA È PRONTA! 🍕",
    ovenAlert: "in forno!",
    okBtn: "CAPITO",
    notifOn: "🔔 Notifiche attive",
    notifOff: "🔕 Notifiche disattive"
  }
};

type LangType = 'es' | 'en' | 'it';
type MensajeTipo = { texto: string, tipo: 'info' | 'alerta' | 'exito' };

export default function VitoPizzaApp() {
  const [lang, setLang] = useState<LangType>('es');
  const t = dictionary[lang];

  const [pizzas, setPizzas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombreInvitado, setNombreInvitado] = useState('');
  
  const [mensaje, setMensaje] = useState<MensajeTipo | null>(null);
  
  // NUEVO ESTADO PARA NOTIFICACIONES
  const [notifEnabled, setNotifEnabled] = useState(false);

  const [config, setConfig] = useState({ porciones_por_pizza: 8, total_invitados: 20 });
  const [invitadosActivos, setInvitadosActivos] = useState(0);
  const [miHistorial, setMiHistorial] = useState<Record<string, { pendientes: number, comidos: number }>>({});
  
  const prevComidosRef = useRef<number>(0);
  const prevCocinandoData = useRef<Record<string, boolean>>({});
  const firstLoadRef = useRef(true);

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
    
    // Recuperar preferencia de notificaciones
    const savedNotif = localStorage.getItem('vito-notif-enabled');
    if (savedNotif === 'true' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        setNotifEnabled(true);
    }
  }, []);

  const handleNameChange = (val: string) => { setNombreInvitado(val); localStorage.setItem('vito-guest-name', val); };
  const changeTheme = (theme: typeof THEMES[0]) => { setCurrentTheme(theme); localStorage.setItem('vito-guest-theme', theme.name); setShowThemeSelector(false); };

  const rotarIdioma = () => {
      if (lang === 'es') setLang('en');
      else if (lang === 'en') setLang('it');
      else setLang('es');
  };

  // --- LÓGICA DE ACTIVAR/DESACTIVAR ---
  const toggleNotificaciones = () => {
      if (notifEnabled) {
          // Si están activas, las desactivamos (lógicamente)
          setNotifEnabled(false);
          localStorage.setItem('vito-notif-enabled', 'false');
          mostrarMensaje(t.notifOff, 'info');
      } else {
          // Si están desactivadas, pedimos permiso y las activamos
          Notification.requestPermission().then(perm => {
              if (perm === 'granted') {
                  setNotifEnabled(true);
                  localStorage.setItem('vito-notif-enabled', 'true');
                  mostrarMensaje(t.notifOn, 'info');
                  
                  // Notificación de prueba silenciosa
                  try { new Notification("Il Forno di Vito", { body: "Ok!", icon: "/icon.png" }); } catch (e) {}
              } else {
                  alert("Debes permitir notificaciones en el navegador. En Android, instala la App.");
              }
          });
      }
  };

  const enviarNotificacion = (titulo: string, cuerpo: string) => {
      // SOLO ENVIAR SI EL USUARIO LO ACTIVÓ CON EL BOTÓN
      if (!notifEnabled) return;

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
             navigator.serviceWorker.getRegistration().then(reg => {
                 if (reg) {
                     (reg as any).showNotification(titulo, { body: cuerpo, icon: '/icon.png', vibrate: [200, 100, 200] });
                 } else {
                     new Notification(titulo, { body: cuerpo, icon: '/icon.png' });
                 }
             });
          } catch (e) {
              new Notification(titulo, { body: cuerpo, icon: '/icon.png' });
          }
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
      }
  };

  const fetchDatos = useCallback(async () => {
    const now = new Date();
    const corte = new Date(now);
    if (now.getHours() < 6) {
        corte.setDate(corte.getDate() - 1);
    }
    corte.setHours(6, 0, 0, 0);
    const corteISO = corte.toISOString();

    const { data: dataConfig } = await supabase.from('configuracion_dia').select('*').single();
    const conf = dataConfig || { porciones_por_pizza: 8, total_invitados: 20 };
    setConfig(conf);

    const { data: dataPedidos } = await supabase.from('pedidos').select('*').gte('created_at', corteISO);
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
        let totalComidosAhora = 0;
        const misPizzasPendientesInfo: Record<string, number> = {}; 

        dataPizzas.forEach(pz => {
             const misDeEsta = mis.filter(p => p.pizza_id === pz.id);
             const comidos = misDeEsta.filter(p => p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0);
             const pendientes = misDeEsta.filter(p => p.estado !== 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0);
             resumen[pz.id] = { pendientes, comidos };
             totalComidosAhora += comidos;
             if (pendientes > 0) misPizzasPendientesInfo[pz.id] = pendientes;
        });
        setMiHistorial(resumen);

        if (firstLoadRef.current) {
            prevComidosRef.current = totalComidosAhora;
            dataPizzas.forEach(pz => { prevCocinandoData.current[pz.id] = pz.cocinando; });
            firstLoadRef.current = false;
        } else {
            if (totalComidosAhora > prevComidosRef.current) {
                const diferencia = totalComidosAhora - prevComidosRef.current;
                const texto = `¡Tus ${diferencia} porciones están listas! 🍕`;
                setMensaje({ texto, tipo: 'alerta' }); 
                enviarNotificacion(t.readyAlert, texto);
            }
            prevComidosRef.current = totalComidosAhora;

            dataPizzas.forEach(pz => {
                const estabaCocinando = prevCocinandoData.current[pz.id] || false;
                if (pz.cocinando && !estabaCocinando && misPizzasPendientesInfo[pz.id]) {
                    const cant = misPizzasPendientesInfo[pz.id];
                    const texto = `¡${cant} porciones de ${pz.nombre} ${t.ovenAlert}`;
                    setMensaje({ texto, tipo: 'alerta' });
                    enviarNotificacion("🔥 " + t.inOven, texto);
                }
                prevCocinandoData.current[pz.id] = pz.cocinando;
            });
        }
      }
    }
    setCargando(false);
  }, [nombreInvitado, t, notifEnabled]); // Agregado notifEnabled a dependencias

  useEffect(() => {
    fetchDatos();
    const canal = supabase.channel('app-realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchDatos()).subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [fetchDatos]);

  async function modificarPedido(pizza: any, accion: 'sumar' | 'restar') {
    if (!nombreInvitado.trim()) { alert(t.errorName); return; }

    if (accion === 'sumar') {
        const { error } = await supabase.from('pedidos').insert([{ invitado_nombre: nombreInvitado, pizza_id: pizza.id, cantidad_porciones: 1, estado: 'pendiente' }]);
        if (!error) mostrarMensaje(`${t.successOrder} ${pizza.nombre}!`, 'exito');
    } else {
        if (pizza.cocinando) { alert(t.errorOven); return; }
        const { data } = await supabase.from('pedidos').select('id').eq('pizza_id', pizza.id).ilike('invitado_nombre', nombreInvitado.trim()).eq('estado', 'pendiente').order('created_at', { ascending: false }).limit(1).single();
        if (data) {
            await supabase.from('pedidos').delete().eq('id', data.id);
            mostrarMensaje(`${t.successCancel} ${pizza.nombre}`, 'info');
        }
    }
  }

  const mostrarMensaje = (txt: string, tipo: 'info' | 'alerta' | 'exito') => {
      setMensaje({ texto: txt, tipo });
      if (tipo !== 'alerta') {
          setTimeout(() => setMensaje(null), 2500);
      }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans pb-20 transition-colors duration-500 overflow-x-hidden">
      
      <div className={`w-full p-6 pb-12 rounded-b-[40px] bg-gradient-to-br ${currentTheme.gradient} shadow-2xl relative overflow-hidden`}>
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mt-20 -mr-20 blur-3xl"></div>
         <div className="relative z-10">
             <div className="flex justify-between items-center mb-6">
                <span className="font-bold tracking-widest text-[10px] uppercase bg-black/30 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">Il Forno Di Vito</span>
                <div className="flex gap-2">
                   {/* BOTON NOTIFICACIONES CON CAMBIO DE ICONO */}
                   <button onClick={toggleNotificaciones} className={`p-2 rounded-full hover:bg-black/40 border border-white/10 transition-colors ${notifEnabled ? 'bg-white text-black' : 'bg-black/20 text-white'}`}>
                       {notifEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                   </button>
                   
                   <button onClick={rotarIdioma} className="bg-black/20 px-3 py-2 rounded-full hover:bg-black/40 border border-white/10 text-xs font-bold">
                       {lang.toUpperCase()}
                   </button>
                   <button onClick={() => setShowThemeSelector(!showThemeSelector)} className="bg-black/20 p-2 rounded-full hover:bg-black/40 border border-white/10"><Palette size={18} /></button>
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
                <span className="text-neutral-300 text-xs">{invitadosActivos} {t.status}</span>
             </div>
         </div>
      </div>

      <div className="px-4 -mt-8 relative z-20 max-w-lg mx-auto">
        <div className={`bg-neutral-900 p-2 rounded-2xl shadow-xl border ${currentTheme.border} flex items-center gap-3 mb-6`}>
             <div className={`p-3 rounded-xl bg-gradient-to-br ${currentTheme.gradient} text-white shadow-lg`}><User size={24} /></div>
             <div className="flex-1 pr-2">
                 <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">{t.whoAreYou}</label>
                 <input type="text" value={nombreInvitado} onChange={e => handleNameChange(e.target.value)} placeholder={t.namePlaceholder} className="w-full text-lg font-bold text-white outline-none placeholder-neutral-600 bg-transparent" />
             </div>
        </div>

        {mensaje && (
          <div className={`fixed top-4 left-4 right-4 p-3 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col items-center justify-center animate-bounce-in text-center bg-white text-black ${mensaje.tipo === 'alerta' ? 'border-4 border-neutral-900 font-bold' : 'border-2 border-neutral-200 font-bold'}`}>
            <div className="flex items-center gap-2 mb-1 text-sm">
                {mensaje.tipo === 'alerta' && <PartyPopper size={18} className="text-orange-600" />}
                {mensaje.texto}
            </div>
            {mensaje.tipo === 'alerta' && (
                <button onClick={() => setMensaje(null)} className="mt-1 bg-neutral-900 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg active:scale-95 hover:bg-black transition-transform">
                    {t.okBtn}
                </button>
            )}
          </div>
        )}

        <div className="space-y-6 pb-10">
           {cargando ? <p className="text-center text-neutral-600 mt-10 animate-pulse">{t.loading}</p> : pizzas.map(pizza => (
               <div key={pizza.id} className={`bg-neutral-900 p-5 rounded-[36px] border ${pizza.cocinando ? 'border-orange-500/30' : 'border-neutral-800'} shadow-lg relative overflow-hidden group`}>
                   
                   <div className="flex justify-between items-start mb-2">
                       <div>
                           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                               {pizza.nombre}
                               {pizza.cocinando && <span className="bg-orange-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">{t.inOven}</span>}
                           </h2>
                           <p className="text-neutral-500 text-xs leading-relaxed max-w-[200px]">{pizza.descripcion}</p>
                       </div>
                       
                       {(miHistorial[pizza.id]?.pendientes > 0 || miHistorial[pizza.id]?.comidos > 0) && (
                           <div className="bg-neutral-800 rounded-2xl p-2 px-3 border border-white/5 text-right">
                               {miHistorial[pizza.id]?.pendientes > 0 && (
                                   <div className={`text-[10px] font-bold ${currentTheme.text} uppercase`}>
                                       {t.wait}: {miHistorial[pizza.id].pendientes}
                                   </div>
                               )}
                               {miHistorial[pizza.id]?.comidos > 0 && (
                                   <div className="text-[10px] text-neutral-500 font-bold uppercase">
                                       {t.ate}: {miHistorial[pizza.id].comidos} {t.portions}
                                   </div>
                               )}
                           </div>
                       )}
                   </div>

                   <div className="bg-black/40 p-3 rounded-2xl border border-white/5 mb-5 mt-4">
                       <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                           <span>{pizza.faltanParaCompletar === pizza.target ? t.newPizza : t.progress}</span>
                           <span className={pizza.faltanParaCompletar === 0 ? currentTheme.text : "text-neutral-400"}>
                               {pizza.faltanParaCompletar > 0 ? `${t.missing} ${pizza.faltanParaCompletar} ${t.portions}` : t.completed}
                           </span>
                       </div>
                       <div className="h-2 bg-neutral-800 rounded-full overflow-hidden flex border border-white/5">
                           {[...Array(pizza.target)].map((_, i) => (
                               <div key={i} className={`flex-1 border-r border-black/50 last:border-0 ${i < pizza.ocupadasActual ? `bg-gradient-to-r ${pizza.cocinando ? 'from-orange-500 to-red-600' : (currentTheme.name === 'Carbone' ? 'from-white to-neutral-300' : currentTheme.gradient)}` : 'bg-transparent'}`}></div>
                           ))}
                       </div>
                   </div>

                   <div className="flex gap-3">
                       {miHistorial[pizza.id]?.pendientes > 0 && !pizza.cocinando && (
                           <button onClick={() => modificarPedido(pizza, 'restar')} className="w-16 h-14 rounded-2xl flex items-center justify-center border bg-neutral-800 text-neutral-400 border-neutral-700 active:scale-95 transition">
                               <Minus size={20} />
                           </button>
                       )}
                       
                       <button onClick={() => modificarPedido(pizza, 'sumar')} className={`flex-1 h-14 rounded-2xl font-bold text-lg text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${currentTheme.gradient} hover:brightness-110`}>
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