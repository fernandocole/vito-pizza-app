'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Minus, User, Palette, Lock, PartyPopper, Bell, BellOff, ArrowDownAZ, ArrowUpNarrowWide, Maximize2, Minimize2, AlertCircle, KeyRound, ArrowRight, Sun, Moon } from 'lucide-react';
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
    welcomeSub: "será un placer cocinar para vos. 🫠",
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
    wait: "Pediste", 
    ate: "Comiste",
    portions: "porciones",
    customize: "Elige tu estilo:",
    errorName: "¡Primero decime tu nombre arriba!",
    errorOven: "⚠️ Esa porción ya está en el horno.",
    successOrder: "¡Marchando +1 de",
    successCancel: "Cancelado -1 de",
    readyAlert: "¡ESTÁ LISTA!", 
    ovenAlert: "al horno!",
    okBtn: "ENTENDIDO",
    notifOn: "🔔 Notificaciones activadas",
    notifOff: "🔕 Notificaciones desactivadas",
    soldOut: "AGOTADA",
    blocked: "ACCESO RESTRINGIDO",
    enterPass: "Ingresa la clave del día"
  },
  en: {
    welcomeTitle: "Thanks for coming today,",
    welcomeSub: "it will be a pleasure to cook for you. 🫠",
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
    errorOven: "⚠️ That slice is baking!",
    successOrder: "Coming right up! +1 of",
    successCancel: "Removed -1 of",
    readyAlert: "IT'S READY!",
    ovenAlert: "in the oven!",
    okBtn: "OK",
    notifOn: "🔔 Notifications ON",
    notifOff: "🔕 Notifications OFF",
    soldOut: "SOLD OUT",
    blocked: "ACCESS RESTRICTED",
    enterPass: "Enter today's password"
  },
  it: {
    welcomeTitle: "Grazie per essere venuto,",
    welcomeSub: "sarà un piacere cucinare per te. 🫠",
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
    errorOven: "⚠️ Già in forno!",
    successOrder: "In arrivo! +1 di",
    successCancel: "Rimosso -1 di",
    readyAlert: "È PRONTA!",
    ovenAlert: "in forno!",
    okBtn: "CAPITO",
    notifOn: "🔔 Notifiche attive",
    notifOff: "🔕 Notifiche disattive",
    soldOut: "ESAURITA",
    blocked: "ACCESSO LIMITATO",
    enterPass: "Inserisci la password"
  }
};

type LangType = 'es' | 'en' | 'it';
type MensajeTipo = { texto: string, tipo: 'info' | 'alerta' | 'exito' };

export default function VitoPizzaApp() {
  const [lang, setLang] = useState<LangType>('es');
  const t = dictionary[lang];

  // Estados de Acceso
  const [loadingConfig, setLoadingConfig] = useState(true); 
  const [accessGranted, setAccessGranted] = useState(false);
  const [guestPassInput, setGuestPassInput] = useState('');
  const [dbPass, setDbPass] = useState('');

  const [pizzas, setPizzas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombreInvitado, setNombreInvitado] = useState('');
  
  const [mensaje, setMensaje] = useState<MensajeTipo | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [orden, setOrden] = useState<'estado' | 'nombre'>('estado');
  const [isCompact, setIsCompact] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Estilos Base Dinámicos
  const base = isDarkMode ? {
      bg: "bg-neutral-950",
      text: "text-white",
      subtext: "text-neutral-500",
      card: "bg-neutral-900 border-neutral-800",
      input: "bg-transparent text-white placeholder-neutral-600",
      inputContainer: "bg-neutral-900 border-neutral-800",
      buttonSec: "bg-black/20 text-white hover:bg-black/40 border-white/10",
      progressBg: "bg-black/40 border-white/5",
      progressTrack: "bg-neutral-800 border-black/50"
  } : {
      bg: "bg-gray-50",
      text: "text-gray-900",
      subtext: "text-gray-500",
      card: "bg-white border-gray-200 shadow-md",
      input: "bg-transparent text-gray-900 placeholder-gray-400",
      inputContainer: "bg-white border-gray-200 shadow-sm",
      buttonSec: "bg-gray-200 text-gray-600 hover:text-black border-gray-300",
      progressBg: "bg-gray-100 border-gray-200",
      progressTrack: "bg-gray-300 border-white/50"
  };

  const [config, setConfig] = useState({ porciones_por_pizza: 4, total_invitados: 10, modo_estricto: false });
  const [invitadosActivos, setInvitadosActivos] = useState(0);
  const [miHistorial, setMiHistorial] = useState<Record<string, { pendientes: number, comidos: number }>>({});
  
  const [invitadosLista, setInvitadosLista] = useState<any[]>([]);
  const [usuarioBloqueado, setUsuarioBloqueado] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState(''); // NUEVO: Para guardar el motivo

  const prevComidosPerPizza = useRef<Record<string, number>>({});
  const prevCocinandoData = useRef<Record<string, boolean>>({});
  const firstLoadRef = useRef(true);

  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('vito-guest-name');
    if (savedName) setNombreInvitado(savedName);
    const savedTheme = localStorage.getItem('vito-guest-theme');
    if (savedTheme) { const found = THEMES.find(t => t.name === savedTheme); if (found) setCurrentTheme(found); }
    
    const savedMode = localStorage.getItem('vito-dark-mode');
    if (savedMode !== null) setIsDarkMode(savedMode === 'true');

    const savedNotif = localStorage.getItem('vito-notif-enabled');
    if (savedNotif === 'true' && typeof Notification !== 'undefined' && Notification.permission === 'granted') { setNotifEnabled(true); }
    
    const savedPass = localStorage.getItem('vito-guest-pass-val');
    if(savedPass) setGuestPassInput(savedPass);
  }, []);

  const toggleDarkMode = () => {
      const newVal = !isDarkMode;
      setIsDarkMode(newVal);
      localStorage.setItem('vito-dark-mode', String(newVal));
  };

  const verifyAccess = (inputPass: string, correctPass: string) => {
      if (!correctPass || correctPass === '' || inputPass === correctPass) {
          setAccessGranted(true);
          if(correctPass !== '') localStorage.setItem('vito-guest-pass-val', inputPass);
      } else { setAccessGranted(false); }
  };

  const handleNameChange = (val: string) => { 
      setNombreInvitado(val); 
      localStorage.setItem('vito-guest-name', val); 
      const user = invitadosLista.find(u => u.nombre.toLowerCase() === val.toLowerCase());
      if (user && user.bloqueado) {
          setUsuarioBloqueado(true);
          setMotivoBloqueo(user.motivo_bloqueo || '');
      } else {
          setUsuarioBloqueado(false);
          setMotivoBloqueo('');
      }
  };
  const changeTheme = (theme: typeof THEMES[0]) => { setCurrentTheme(theme); localStorage.setItem('vito-guest-theme', theme.name); setShowThemeSelector(false); };
  const rotarIdioma = () => { if (lang === 'es') setLang('en'); else if (lang === 'en') setLang('it'); else setLang('es'); };

  const toggleNotificaciones = () => { if (notifEnabled) { setNotifEnabled(false); localStorage.setItem('vito-notif-enabled', 'false'); mostrarMensaje(t.notifOff, 'info'); } else { Notification.requestPermission().then(perm => { if (perm === 'granted') { setNotifEnabled(true); localStorage.setItem('vito-notif-enabled', 'true'); mostrarMensaje(t.notifOn, 'info'); try { new Notification("Il Forno di Vito", { body: "Ok!", icon: "/icon.png" }); } catch (e) {} } else { alert("Activa las notificaciones en la configuración de tu navegador."); } }); } };
  const enviarNotificacion = (titulo: string, cuerpo: string) => { if (!notifEnabled) return; if (typeof Notification !== 'undefined' && Notification.permission === 'granted') { try { navigator.serviceWorker.getRegistration().then(reg => { if (reg) { (reg as any).showNotification(titulo, { body: cuerpo, icon: '/icon.png', vibrate: [200, 100, 200] }); } else { new Notification(titulo, { body: cuerpo, icon: '/icon.png' }); } }); } catch (e) { new Notification(titulo, { body: cuerpo, icon: '/icon.png' }); } const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); audio.volume = 0.5; audio.play().catch(() => {}); } };

  const fetchDatos = useCallback(async () => {
    const now = new Date(); const corte = new Date(now); if (now.getHours() < 6) corte.setDate(corte.getDate() - 1); corte.setHours(6, 0, 0, 0); const corteISO = corte.toISOString();
    const { data: dataConfig } = await supabase.from('configuracion_dia').select('*').single();
    const conf = dataConfig || { porciones_por_pizza: 4, total_invitados: 10, modo_estricto: false };
    setConfig(conf);
    
    const serverPass = dataConfig?.password_invitados || ''; setDbPass(serverPass); const localPass = localStorage.getItem('vito-guest-pass-val') || guestPassInput; verifyAccess(localPass, serverPass); setLoadingConfig(false);

    const { data: dataPedidos } = await supabase.from('pedidos').select('*').gte('created_at', corteISO);
    const { data: dataPizzas } = await supabase.from('menu_pizzas').select('*').eq('activa', true).order('created_at');
    const { data: dataInvitados } = await supabase.from('lista_invitados').select('*');

    if (dataInvitados) { 
        setInvitadosLista(dataInvitados); 
        const user = dataInvitados.find(u => u.nombre.toLowerCase() === nombreInvitado.toLowerCase()); 
        if (user && user.bloqueado) {
            setUsuarioBloqueado(true);
            setMotivoBloqueo(user.motivo_bloqueo || '');
        } else { 
            setUsuarioBloqueado(false); 
            setMotivoBloqueo('');
        } 
    }

    if (dataPizzas && dataPedidos) {
      setInvitadosActivos(new Set(dataPedidos.map(p => p.invitado_nombre.toLowerCase().trim())).size);
      const pizzasProcesadas = dataPizzas.map(pizza => {
        const pedidosPendientesPizza = dataPedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado');
        const totalPendientes = pedidosPendientesPizza.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
        const target = pizza.porciones_individuales || conf.porciones_por_pizza;
        const ocupadasActual = totalPendientes % target;
        const totalStockPorciones = (pizza.stock || 0) * target;
        const totalPedidosGusto = dataPedidos.filter(p => p.pizza_id === pizza.id).reduce((acc, c) => acc + c.cantidad_porciones, 0);
        const stockRestante = Math.max(0, totalStockPorciones - totalPedidosGusto);
        return { ...pizza, target, totalPendientes, ocupadasActual, faltanParaCompletar: target - ocupadasActual, porcentajeBarra: (ocupadasActual / target) * 100, stockRestante };
      });
      setPizzas(pizzasProcesadas);

      if (nombreInvitado) {
        const mis = dataPedidos.filter(p => p.invitado_nombre.toLowerCase() === nombreInvitado.toLowerCase().trim());
        const resumen: any = {}; const misPizzasPendientesInfo: Record<string, number> = {}; 
        dataPizzas.forEach(pz => {
             const misDeEsta = mis.filter(p => p.pizza_id === pz.id);
             const comidos = misDeEsta.filter(p => p.estado === 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0);
             const pendientes = misDeEsta.filter(p => p.estado !== 'entregado').reduce((acc, c) => acc + c.cantidad_porciones, 0);
             resumen[pz.id] = { pendientes, comidos };
             if (pendientes > 0) misPizzasPendientesInfo[pz.id] = pendientes;
             if (!firstLoadRef.current) { const prevComidos = prevComidosPerPizza.current[pz.id] || 0; if (comidos > prevComidos) { const dif = comidos - prevComidos; const texto = `¡Tus ${dif} porciones de ${pz.nombre} están listas!`; setMensaje({ texto, tipo: 'alerta' }); enviarNotificacion(t.readyAlert, texto); } } prevComidosPerPizza.current[pz.id] = comidos;
        });
        setMiHistorial(resumen);
        if (firstLoadRef.current) { dataPizzas.forEach(pz => { prevCocinandoData.current[pz.id] = pz.cocinando; }); firstLoadRef.current = false; } else { dataPizzas.forEach(pz => { const estabaCocinando = prevCocinandoData.current[pz.id] || false; if (pz.cocinando && !estabaCocinando && misPizzasPendientesInfo[pz.id]) { const cant = misPizzasPendientesInfo[pz.id]; const texto = `¡${cant} porciones de ${pz.nombre} ${t.ovenAlert}`; setMensaje({ texto, tipo: 'alerta' }); enviarNotificacion("🔥", texto); } prevCocinandoData.current[pz.id] = pz.cocinando; }); }
      }
    }
    setCargando(false);
  }, [nombreInvitado, t, notifEnabled, guestPassInput]); 

  useEffect(() => { fetchDatos(); const canal = supabase.channel('app-realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchDatos()).subscribe(); return () => { supabase.removeChannel(canal); }; }, [fetchDatos]);

  const pizzasOrdenadas = useMemo(() => {
      return [...pizzas].sort((a, b) => {
          if (orden === 'estado') {
              if (a.cocinando && !b.cocinando) return -1;
              if (!a.cocinando && b.cocinando) return 1;
              
              const aStock = a.stockRestante > 0;
              const bStock = b.stockRestante > 0;
              if (aStock && !bStock) return -1;
              if (!aStock && bStock) return 1;

              return a.nombre.localeCompare(b.nombre);
          } else {
              return a.nombre.localeCompare(b.nombre);
          }
      });
  }, [pizzas, orden]);

  async function modificarPedido(pizza: any, accion: 'sumar' | 'restar') {
    if (!nombreInvitado.trim()) { alert(t.errorName); return; }
    if (usuarioBloqueado) { alert(`${t.blocked}: ${motivoBloqueo}`); return; }
    if (accion === 'sumar') { if (pizza.stockRestante <= 0) { alert("Ya no queda stock de esta pizza :("); return; } const { error } = await supabase.from('pedidos').insert([{ invitado_nombre: nombreInvitado, pizza_id: pizza.id, cantidad_porciones: 1, estado: 'pendiente' }]); if (!error) mostrarMensaje(`${t.successOrder} ${pizza.nombre}!`, 'exito'); } else { if (pizza.cocinando) { if (pizza.totalPendientes <= pizza.target) { /* No bloqueamos */ } } const { data } = await supabase.from('pedidos').select('id').eq('pizza_id', pizza.id).ilike('invitado_nombre', nombreInvitado.trim()).eq('estado', 'pendiente').order('created_at', { ascending: false }).limit(1).single(); if (data) { await supabase.from('pedidos').delete().eq('id', data.id); mostrarMensaje(`${t.successCancel} ${pizza.nombre}`, 'info'); } }
  }

  const mostrarMensaje = (txt: string, tipo: 'info' | 'alerta' | 'exito') => { setMensaje({ texto: txt, tipo }); if (tipo !== 'alerta') { setTimeout(() => setMensaje(null), 2500); } }

  if (loadingConfig) { return (<div className={`min-h-screen flex items-center justify-center p-4 ${base.bg}`}><div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-white' : 'border-black'}`}></div></div>); }

  if (!accessGranted) {
      return (
        <div className={`min-h-screen flex items-center justify-center p-4 font-sans ${base.bg}`}>
            <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl text-center ${base.card}`}>
                <div className="flex justify-center mb-6"><img src="/logo.png" alt="Logo" className="h-24 w-auto object-contain" /></div>
                <h2 className={`text-xl font-bold mb-4 ${base.text}`}>{t.enterPass}</h2>
                <div className="flex gap-2">
                    <input type="password" value={guestPassInput} onChange={e => setGuestPassInput(e.target.value)} className={`w-full p-4 rounded-xl border outline-none text-center text-lg tracking-widest ${base.inputContainer} ${base.text}`} placeholder="****" />
                    <button onClick={() => verifyAccess(guestPassInput, dbPass)} className={`p-4 rounded-xl font-bold ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}><ArrowRight /></button>
                </div>
                <div className={`mt-8 pt-4 border-t border-white/5`}>
                    <Link href="/admin" className={`text-xs flex items-center justify-center gap-1 ${base.subtext} hover:${base.text}`}><Lock size={12}/> Admin</Link>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-500 overflow-x-hidden ${base.bg}`}>
      <div className={`w-full p-6 pb-12 rounded-b-[40px] bg-gradient-to-br ${currentTheme.gradient} shadow-2xl relative overflow-hidden`}>
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mt-20 -mr-20 blur-3xl"></div>
         <div className="relative z-10">
             <div className="flex justify-between items-center mb-6">
                <div className="bg-black/30 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 flex items-center">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" />
                    <span className="font-bold tracking-widest text-[10px] uppercase text-white">Il Forno Di Vito</span>
                </div>
                <div className="flex gap-2">
                   <button onClick={toggleNotificaciones} className={`p-2 rounded-full hover:bg-black/40 border border-white/10 transition-colors ${notifEnabled ? 'bg-white text-black' : 'bg-black/20 text-white'}`}>{notifEnabled ? <Bell size={18} /> : <BellOff size={18} />}</button>
                   <button onClick={toggleDarkMode} className={`p-2 rounded-full border border-white/10 transition-colors ${isDarkMode ? 'bg-black/20 text-white' : 'bg-white/90 text-black'}`}>{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
                   <button onClick={rotarIdioma} className="bg-black/20 px-3 py-2 rounded-full hover:bg-black/40 border border-white/10 text-xs font-bold text-white">{lang.toUpperCase()}</button>
                   <button onClick={() => setOrden(orden === 'estado' ? 'nombre' : 'estado')} className="bg-black/20 p-2 rounded-full hover:bg-black/40 border border-white/10 text-white">{orden === 'estado' ? <ArrowUpNarrowWide size={18} /> : <ArrowDownAZ size={18} />}</button>
                   <button onClick={() => setIsCompact(!isCompact)} className={`p-2 rounded-full border border-white/10 transition-colors ${isCompact ? 'bg-white text-black' : 'bg-black/20 text-white hover:bg-black/40'}`}>{isCompact ? <Maximize2 size={18} /> : <Minimize2 size={18} />}</button>
                   <button onClick={() => setShowThemeSelector(!showThemeSelector)} className="bg-black/20 p-2 rounded-full hover:bg-black/40 border border-white/10 text-white"><Palette size={18} /></button>
                   <Link href="/admin" className="bg-black/20 p-2 rounded-full hover:bg-black/40 border border-white/10 text-white"><Lock size={18} /></Link>
                </div>
             </div>
             {showThemeSelector && (
               <div className="mb-6 bg-black/40 p-3 rounded-2xl backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-top-2">
                 <p className="text-[10px] text-neutral-300 mb-2 font-bold uppercase tracking-wider">{t.customize}</p>
                 <div className="flex gap-4 justify-center">{THEMES.map(theme => (<button key={theme.name} onClick={() => changeTheme(theme)} className={`w-10 h-10 rounded-full ${theme.color} border-2 ${currentTheme.name === theme.name ? 'border-white scale-110 shadow-[0_0_10px_white]' : 'border-transparent opacity-60'}`}></button>))}</div>
               </div>
             )}
             <h1 className="text-3xl font-bold leading-tight mb-2 drop-shadow-md text-white">{t.welcomeTitle} <br/> <span className="opacity-80 font-normal text-xl">{t.welcomeSub}</span></h1>
             <div className="mt-6 flex items-center gap-3 text-sm font-medium bg-black/30 p-3 rounded-2xl w-max backdrop-blur-md border border-white/10 text-white">
                <span className="text-neutral-300 text-xs">{invitadosActivos} {t.status}</span>
             </div>
         </div>
      </div>

      <div className="px-4 -mt-8 relative z-20 max-w-lg mx-auto">
        <div className={`p-2 rounded-2xl shadow-xl border flex items-center gap-3 mb-6 ${base.inputContainer}`}>
             <div className={`p-3 rounded-xl bg-gradient-to-br ${currentTheme.gradient} text-white shadow-lg`}><User size={24} /></div>
             <div className="flex-1 pr-2">
                 <label className={`text-[10px] uppercase font-bold ml-1 ${base.subtext}`}>{t.whoAreYou}</label>
                 {config.modo_estricto ? (
                     <select value={nombreInvitado} onChange={e => handleNameChange(e.target.value)} className={`w-full text-lg font-bold outline-none bg-transparent border-b pb-1 ${base.text} ${base.subtext}`}>
                         <option value="">Seleccioná tu nombre...</option>
                         {invitadosLista.map(u => (<option key={u.id} value={u.nombre} className="text-black">{u.nombre}</option>))}
                     </select>
                 ) : (
                     <input type="text" value={nombreInvitado} onChange={e => handleNameChange(e.target.value)} placeholder={t.namePlaceholder} className={`w-full text-lg font-bold outline-none bg-transparent ${base.text}`} />
                 )}
                 {usuarioBloqueado && <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1"><AlertCircle size={10}/> {t.blocked}: {motivoBloqueo}</p>}
             </div>
        </div>

        {mensaje && (
          <div className={`fixed top-4 left-4 right-4 p-3 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col items-center justify-center animate-bounce-in text-center ${mensaje.tipo === 'alerta' ? (isDarkMode ? 'bg-white text-black border-4 border-neutral-900 font-bold' : 'bg-black text-white border-4 border-gray-200 font-bold') : (isDarkMode ? 'bg-white text-black border-2 border-neutral-200 font-bold' : 'bg-white text-black border-2 border-gray-200 font-bold')}`}>
            <div className="flex items-center gap-2 mb-1 text-sm">
                {mensaje.tipo === 'alerta' && mensaje.texto.includes('horno') && <PartyPopper size={18} className="text-orange-600" />}
                {mensaje.texto}
            </div>
            {mensaje.tipo === 'alerta' && (<button onClick={() => setMensaje(null)} className="mt-1 bg-neutral-900 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg active:scale-95 hover:bg-black transition-transform">{t.okBtn}</button>)}
          </div>
        )}

        <div className="space-y-3 pb-10">
           {cargando ? <p className={`text-center mt-10 animate-pulse ${base.subtext}`}>{t.loading}</p> : pizzasOrdenadas.map(pizza => (
               <div key={pizza.id} className={`rounded-[36px] border shadow-lg relative overflow-hidden group ${pizza.stockRestante === 0 && (!miHistorial[pizza.id]?.pendientes) ? 'opacity-50 grayscale' : ''} ${pizza.cocinando ? 'border-red-600/30' : base.card.split(' ')[1]} ${base.card} ${isCompact ? 'p-3' : 'p-5'}`}>
                   <div className="flex justify-between items-start mb-2">
                       <div className="flex-1">
                           <h2 className={`font-bold flex items-center gap-2 ${base.text} ${isCompact ? 'text-lg' : 'text-2xl'}`}>
                               {pizza.nombre}
                               {pizza.cocinando && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">{t.inOven}</span>}
                           </h2>
                           {!isCompact && (<p className={`text-xs leading-relaxed max-w-[200px] ${base.subtext}`}>{pizza.descripcion}</p>)}
                           <p className={`text-[10px] font-mono mt-1 ${pizza.stockRestante === 0 ? 'text-red-500 font-bold' : pizza.stockRestante < 5 ? 'text-red-400 font-bold animate-pulse' : base.subtext}`}>
                               {pizza.stockRestante === 0 ? t.soldOut : `${pizza.stockRestante} ${t.portions}`}
                           </p>
                       </div>
                       {(miHistorial[pizza.id]?.pendientes > 0 || miHistorial[pizza.id]?.comidos > 0) && (
                           <div className={`rounded-2xl border text-right ${isDarkMode ? 'bg-neutral-800 border-white/5' : 'bg-gray-100 border-gray-200'} ${isCompact ? 'p-1 px-2' : 'p-2 px-3'}`}>
                               {miHistorial[pizza.id]?.pendientes > 0 && <div className={`text-[10px] font-bold uppercase ${currentTheme.text}`}>{t.wait}: {miHistorial[pizza.id].pendientes}</div>}
                               {miHistorial[pizza.id]?.comidos > 0 && <div className={`text-[10px] font-bold uppercase ${base.subtext}`}>{t.ate}: {miHistorial[pizza.id].comidos}</div>}
                           </div>
                       )}
                   </div>
                   <div className={`rounded-2xl border ${base.progressBg} ${isCompact ? 'p-2 mb-2 mt-1' : 'p-3 mb-5 mt-4'}`}>
                       <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2 ${base.subtext}`}>
                           <span>{pizza.faltanParaCompletar === pizza.target ? t.newPizza : t.progress}</span>
                           <span className={pizza.faltanParaCompletar === 0 ? currentTheme.text : base.subtext}>{pizza.faltanParaCompletar > 0 ? `${t.missing} ${pizza.faltanParaCompletar}` : t.completed}</span>
                       </div>
                       <div className={`rounded-full overflow-hidden flex border ${base.progressTrack} ${isCompact ? 'h-1.5' : 'h-2'}`}>
                           {[...Array(pizza.target)].map((_, i) => (
                               <div key={i} className={`flex-1 border-r last:border-0 ${isDarkMode ? 'border-black/50' : 'border-white/50'} ${i < pizza.ocupadasActual ? `bg-gradient-to-r ${pizza.cocinando ? 'from-orange-600 to-red-600' : (currentTheme.name === 'Carbone' ? (isDarkMode ? 'from-white to-neutral-300' : 'from-gray-800 to-black') : currentTheme.gradient)}` : 'bg-transparent'}`}></div>
                           ))}
                       </div>
                   </div>
                   <div className="flex gap-3">
                       {miHistorial[pizza.id]?.pendientes > 0 && (
                           <button onClick={() => modificarPedido(pizza, 'restar')} className={`rounded-2xl flex items-center justify-center border transition active:scale-95 ${base.buttonSec} ${isCompact ? 'w-12 h-10' : 'w-16 h-14'}`}><Minus size={isCompact ? 16 : 20} /></button>
                       )}
                       {(pizza.stockRestante > 0) ? (
                           <button onClick={() => modificarPedido(pizza, 'sumar')} className={`flex-1 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${currentTheme.gradient} hover:brightness-110 ${isCompact ? 'h-10 text-base' : 'h-14 text-lg'}`}><Plus size={isCompact ? 18 : 24} strokeWidth={3} /> {t.buttonOrder}</button>
                       ) : (
                           <div className={`flex-1 rounded-2xl font-bold flex items-center justify-center border ${isDarkMode ? 'text-neutral-500 bg-neutral-900 border-neutral-800' : 'text-gray-400 bg-gray-100 border-gray-200'} ${isCompact ? 'h-10 text-xs' : 'h-14 text-sm'}`}>{t.soldOut}</div>
                       )}
                   </div>
               </div>
           ))}
        </div>
      </div>
    </div>
  );
}