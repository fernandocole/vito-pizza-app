'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Minus, User, Palette, Lock, PartyPopper, Bell, BellOff, 
  ArrowDownAZ, ArrowUpNarrowWide, Maximize2, Minimize2, AlertCircle, 
  KeyRound, ArrowRight, Sun, Moon, Star, X, Filter, TrendingUp, 
  CheckCircle, Clock, Package // Agregado Package
} from 'lucide-react';
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
    buttonOrder: "PEDIR",
    inOven: "EN HORNO",
    wait: "Pediste", 
    ate: "Comiste",
    customize: "Elige tu estilo:",
    errorName: "¡Primero decime tu nombre arriba!",
    errorOven: "⚠️ Esa porción ya está en el horno.",
    successOrder: "¡Marchando +1 de",
    successCancel: "Cancelado -1 de",
    readyAlert: "¡ESTÁ LISTA!", 
    ovenAlert: "al horno!",
    okBtn: "ENTENDIDO",
    notifOn: "🔔 Activadas",
    notifOff: "🔕 Desactivadas",
    soldOut: "AGOTADA",
    blocked: "ACCESO RESTRINGIDO",
    remaining: "Quedan",
    portions: "porciones",
    progress: "PROGRESO",
    newPizza: "EMPEZANDO",
    missing: "FALTAN",
    completed: "¡COMPLETA!",
    only: "¡Quedan solo",
    of: "de",
    enterPass: "Ingresa la clave del día",
    rateTitle: "Calificar",
    sendReview: "ENVIAR OPINIÓN",
    rateBtn: "CALIFICAR",
    topRated: "🏆 La favorita:",
    hotPick: "🔥 ¡Éxito total!:",
    toughCrowd: "📉 Polémica:",
    fAll: "Todas",
    fTop: "Top Rated",
    fRate: "Por calificar",
    fOrdered: "Pedidas",
    fNew: "Por Probar",
    fStock: "Con Stock", // Nuevo
    sortRank: "Ranking"
  },
  en: {
    welcomeTitle: "Thanks for coming today,",
    welcomeSub: "it will be a pleasure to cook for you. 🫠",
    whoAreYou: "YOUR NAME?",
    namePlaceholder: "Type it here...",
    status: "friends have ordered.",
    loading: "Firing up the oven...",
    buttonOrder: "ORDER",
    inOven: "IN OVEN",
    wait: "Ordered",
    ate: "Ate",
    customize: "Choose style:",
    errorName: "Please enter your name first!",
    errorOven: "⚠️ That slice is baking!",
    successOrder: "Coming right up! +1 of",
    successCancel: "Removed -1 of",
    readyAlert: "IT'S READY!",
    ovenAlert: "in the oven!",
    okBtn: "OK",
    notifOn: "🔔 ON",
    notifOff: "🔕 OFF",
    soldOut: "SOLD OUT",
    blocked: "ACCESS RESTRICTED",
    remaining: "Left",
    portions: "slices",
    progress: "PROGRESS",
    newPizza: "STARTING",
    missing: "MISSING",
    completed: "DONE!",
    only: "Only",
    of: "of",
    enterPass: "Enter today's password",
    rateTitle: "Rate",
    sendReview: "SEND",
    rateBtn: "RATE",
    topRated: "🏆 Top pick:",
    hotPick: "🔥 Everyone loves:",
    toughCrowd: "📉 Mixed feelings:",
    fAll: "All",
    fTop: "Top Rated",
    fRate: "To Rate",
    fOrdered: "Ordered",
    fNew: "Try New",
    fStock: "In Stock",
    sortRank: "Rank"
  },
  it: {
    welcomeTitle: "Grazie per essere venuto,",
    welcomeSub: "sarà un piacere cucinare per te. 🫠",
    whoAreYou: "IL TUO NOME?",
    namePlaceholder: "Scrivilo qui...",
    status: "amici hanno ordinato.",
    loading: "Accensione del forno...",
    buttonOrder: "ORDINA",
    inOven: "IN FORNO",
    wait: "Ordinate",
    ate: "Mangiato",
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
    remaining: "Rimangono",
    portions: "fette",
    progress: "PROGRESSO",
    newPizza: "NUOVA",
    missing: "MANCANO",
    completed: "COMPLETA!",
    only: "Solo",
    of: "di",
    enterPass: "Inserisci la password",
    rateTitle: "Vota",
    sendReview: "INVIA",
    rateBtn: "VOTA",
    topRated: "🏆 La preferita:",
    hotPick: "🔥 Successo totale:",
    toughCrowd: "📉 Opinioni divise:",
    fAll: "Tutte",
    fTop: "Migliori",
    fRate: "Da Votare",
    fOrdered: "Ordinate",
    fNew: "Da Provare",
    fStock: "Disponibile",
    sortRank: "Classifica"
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
  const [pedidos, setPedidos] = useState<any[]>([]); 
  const [allRatings, setAllRatings] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombreInvitado, setNombreInvitado] = useState('');
  
  const [mensaje, setMensaje] = useState<MensajeTipo | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [orden, setOrden] = useState<'estado' | 'nombre' | 'ranking'>('estado');
  // NUEVO: Agregado 'stock' al tipo de filtro
  const [filter, setFilter] = useState<'all' | 'top' | 'to_rate' | 'ordered' | 'new' | 'stock'>('all');
  
  const [isCompact, setIsCompact] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pizzaToRate, setPizzaToRate] = useState<any>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [commentValue, setCommentValue] = useState('');
  const [misValoraciones, setMisValoraciones] = useState<string[]>([]);

  const base = isDarkMode ? {
      bg: "bg-neutral-950",
      text: "text-white",
      subtext: "text-neutral-500",
      card: "bg-neutral-900 border-neutral-800",
      input: "bg-transparent text-white placeholder-neutral-600",
      inputContainer: "bg-neutral-900 border-neutral-800",
      buttonSec: "bg-black/20 text-white hover:bg-black/40 border-white/10",
      progressBg: "bg-black/40 border-white/5",
      progressTrack: "bg-neutral-800 border-black/50",
      badge: "bg-white/10 text-white border border-white/10",
      activeChip: "bg-white text-black font-bold",
      inactiveChip: "bg-neutral-900 text-neutral-400 border border-neutral-800"
  } : {
      bg: "bg-gray-50",
      text: "text-gray-900",
      subtext: "text-gray-500",
      card: "bg-white border-gray-200 shadow-md",
      input: "bg-transparent text-gray-900 placeholder-gray-400",
      inputContainer: "bg-white border-gray-200 shadow-sm",
      buttonSec: "bg-gray-200 text-gray-600 hover:text-black border-gray-300",
      progressBg: "bg-gray-100 border-gray-200",
      progressTrack: "bg-gray-300 border-white/50",
      badge: "bg-black/5 text-gray-700 border border-black/5",
      activeChip: "bg-black text-white font-bold",
      inactiveChip: "bg-white text-gray-500 border border-gray-200"
  };

  const [config, setConfig] = useState({ porciones_por_pizza: 4, total_invitados: 10, modo_estricto: false });
  const [invitadosActivos, setInvitadosActivos] = useState(0);
  const [miHistorial, setMiHistorial] = useState<Record<string, { pendientes: number, comidos: number }>>({});
  
  const [invitadosLista, setInvitadosLista] = useState<any[]>([]);
  const [usuarioBloqueado, setUsuarioBloqueado] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState('');

  const prevComidosPerPizza = useRef<Record<string, number>>({});
  const prevCocinandoData = useRef<Record<string, boolean>>({});
  const firstLoadRef = useRef(true);

  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('vito-guest-name');
    if (savedName) setNombreInvitado(savedName);
    
    const savedTheme = localStorage.getItem('vito-guest-theme');
    if (savedTheme) setCurrentTheme(THEMES.find(t => t.name === savedTheme) || THEMES[0]);
    
    const savedNotif = localStorage.getItem('vito-notif-enabled');
    if (savedNotif === 'true' && typeof Notification !== 'undefined' && Notification.permission === 'granted') setNotifEnabled(true);

    const savedOrden = localStorage.getItem('vito-orden');
    if (savedOrden) setOrden(savedOrden as any);
    
    const savedCompact = localStorage.getItem('vito-compact');
    if (savedCompact) setIsCompact(savedCompact === 'true');

    const savedMode = localStorage.getItem('vito-dark-mode');
    if (savedMode) setIsDarkMode(savedMode === 'true');
    
    const savedFilter = localStorage.getItem('vito-filter');
    if (savedFilter) setFilter(savedFilter as any);

    const savedPass = localStorage.getItem('vito-guest-pass-val');
    if(savedPass) setGuestPassInput(savedPass);

    const interval = setInterval(() => {
        setBannerIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);

  }, []);

  const toggleDarkMode = () => {
      const newVal = !isDarkMode;
      setIsDarkMode(newVal);
      localStorage.setItem('vito-dark-mode', String(newVal));
  };

  const toggleOrden = () => {
      const nextOrden = orden === 'estado' ? 'nombre' : (orden === 'nombre' ? 'ranking' : 'estado');
      setOrden(nextOrden);
      localStorage.setItem('vito-orden', nextOrden);
  };

  const toggleCompact = () => {
      const newVal = !isCompact;
      setIsCompact(newVal);
      localStorage.setItem('vito-compact', String(newVal));
  };

  const changeFilter = (newFilter: 'all' | 'top' | 'to_rate' | 'ordered' | 'new' | 'stock') => {
      setFilter(newFilter);
      localStorage.setItem('vito-filter', newFilter);
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
    const { data: dataVals } = await supabase.from('valoraciones').select('*').gte('created_at', corteISO); 

    if (dataVals) setAllRatings(dataVals);

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
      setPedidos(dataPedidos);
      setInvitadosActivos(new Set(dataPedidos.map(p => p.invitado_nombre.toLowerCase().trim())).size);
      setPizzas(dataPizzas);

      if (nombreInvitado) {
        const misVals = dataVals?.filter(v => v.invitado_nombre.toLowerCase() === nombreInvitado.toLowerCase());
        if (misVals) setMisValoraciones(misVals.map(v => v.pizza_id));

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
      // 1. Calcular el promedio global de la app para pizzas sin votos
      const totalStarsApp = allRatings.reduce((acc, r) => acc + r.rating, 0);
      const globalAverage = allRatings.length > 0 ? totalStarsApp / allRatings.length : 0;

      let lista = pizzas.map(pizza => {
          const totalStockPorciones = (pizza.stock || 0) * (pizza.porciones_individuales || config.porciones_por_pizza);
          const totalPedidosGusto = pedidos.filter(p => p.pizza_id === pizza.id).reduce((acc, c) => acc + c.cantidad_porciones, 0);
          const stockRestante = Math.max(0, totalStockPorciones - totalPedidosGusto);
          
          const pedidosPendientesPizza = pedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado');
          const totalPendientes = pedidosPendientesPizza.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
          const target = pizza.porciones_individuales || config.porciones_por_pizza;
          const ocupadasActual = totalPendientes % target;

          const ratingsPizza = allRatings.filter(r => r.pizza_id === pizza.id);
          const avgRating = ratingsPizza.length > 0 ? (ratingsPizza.reduce((a, b) => a + b.rating, 0) / ratingsPizza.length).toFixed(1) : null;
          
          // SORT RATING: Si no tiene votos, usa el promedio global. Si tiene, usa su promedio.
          const sortRating = ratingsPizza.length > 0 
              ? (ratingsPizza.reduce((a, b) => a + b.rating, 0) / ratingsPizza.length) 
              : globalAverage;

          const countRating = ratingsPizza.length;

          return { 
              ...pizza, 
              stockRestante, target, ocupadasActual, faltanParaCompletar: target - ocupadasActual, 
              avgRating, countRating, sortRating
          };
      });

      if (filter !== 'all') {
          lista = lista.filter(p => {
              if (filter === 'top') return p.avgRating && parseFloat(p.avgRating) >= 4.5;
              if (filter === 'to_rate') return miHistorial[p.id]?.comidos > 0 && !misValoraciones.includes(p.id);
              if (filter === 'ordered') return (miHistorial[p.id]?.pendientes > 0 || miHistorial[p.id]?.comidos > 0);
              if (filter === 'new') return (!miHistorial[p.id]?.pendientes && !miHistorial[p.id]?.comidos);
              if (filter === 'stock') return p.stockRestante > 0; // NUEVO FILTRO
              return true;
          });
      }

      return lista.sort((a, b) => {
          if (orden === 'ranking') {
              return b.sortRating - a.sortRating;
          }
          if (orden === 'estado') {
              if (a.cocinando && !b.cocinando) return -1;
              if (!a.cocinando && b.cocinando) return 1;
              
              if (a.stockRestante > 0 && b.stockRestante <= 0) return -1;
              if (a.stockRestante <= 0 && b.stockRestante > 0) return 1;
          }
          return a.nombre.localeCompare(b.nombre);
      });
  }, [pizzas, pedidos, orden, config, allRatings, filter, miHistorial, misValoraciones]);

  const currentBannerText = useMemo(() => {
      if (cargando) return t.loading;
      const messages = [`${invitadosActivos} ${t.status}`];
      
      const pizzasData = pizzas.map(p => {
          const vals = allRatings.filter(v => v.pizza_id === p.id);
          const avg = vals.length > 0 ? vals.reduce((a, b) => a + b.rating, 0) / vals.length : 0;
          const totalStock = (p.stock || 0) * (p.porciones_individuales || config.porciones_por_pizza);
          const used = pedidos.filter(ped => ped.pizza_id === p.id).reduce((acc, c) => acc + c.cantidad_porciones, 0);
          const stock = Math.max(0, totalStock - used);
          return { ...p, stock, avg, count: vals.length };
      });

      pizzasData.forEach(p => {
          if (p.stock === 0) messages.push(`${p.nombre}: ${t.soldOut} 😭`);
          else if (p.stock <= 5) messages.push(`${t.only} ${p.stock} ${t.of} ${p.nombre}! 🏃`);
      });

      const best = [...pizzasData].sort((a,b) => b.avg - a.avg)[0];
      if (best && best.avg >= 4.5 && best.count > 1) messages.push(`${t.topRated} ${best.nombre} (${best.avg.toFixed(1)}★)`);

      const popular = pizzasData.filter(p => p.avg > 4.7 && p.count > 2);
      popular.forEach(p => messages.push(`${t.hotPick} ${p.nombre}!`));

      const disliked = pizzasData.filter(p => p.avg < 3.0 && p.count > 1);
      disliked.forEach(p => messages.push(`${t.toughCrowd} ${p.nombre} (${p.avg.toFixed(1)}★)`));

      return messages[bannerIndex % messages.length];
  }, [invitadosActivos, pizzas, pedidos, bannerIndex, cargando, t, config, allRatings]);

  const openRating = (pizza: any) => {
      setPizzaToRate(pizza);
      setRatingValue(0);
      setCommentValue('');
      setShowRatingModal(true);
  };

  const submitRating = async () => {
      if (ratingValue === 0) return;
      await supabase.from('valoraciones').insert([{
          pizza_id: pizzaToRate.id,
          invitado_nombre: nombreInvitado,
          rating: ratingValue,
          comentario: commentValue
      }]);
      setMisValoraciones(prev => [...prev, pizzaToRate.id]);
      setShowRatingModal(false);
      fetchDatos(); 
  };

  async function modificarPedido(pizza: any, accion: 'sumar' | 'restar') {
    if (!nombreInvitado.trim()) { alert(t.errorName); return; }
    if (usuarioBloqueado) { alert(`${t.blocked}: ${motivoBloqueo || ''}`); return; }
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
             
             {/* Header */}
             <div className="flex flex-col gap-4 mb-6">
                <div className="bg-black/30 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-between">
                    <div className="flex items-center"><img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" /><span className="font-bold tracking-widest text-[10px] uppercase text-white">Il Forno Di Vito</span></div>
                </div>
                
                {/* BOTONES */}
                <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl border border-white/5">
                   <div className="flex gap-2">
                       <button onClick={toggleNotificaciones} className={`p-2 rounded-full hover:bg-black/40 border border-white/10 transition-colors ${notifEnabled ? 'bg-white text-black' : 'bg-black/20 text-white'}`}>{notifEnabled ? <Bell size={18} /> : <BellOff size={18} />}</button>
                       <button onClick={rotarIdioma} className="bg-black/20 px-3 py-2 rounded-full hover:bg-black/40 border border-white/10 text-xs font-bold text-white">{lang.toUpperCase()}</button>
                   </div>
                   <div className="flex gap-2">
                       <button onClick={toggleOrden} className="bg-black/20 p-2 rounded-full hover:bg-black/40 border border-white/10 text-white flex items-center gap-1 text-[10px] font-bold px-3">
                           {orden === 'estado' ? <ArrowUpNarrowWide size={14} /> : (orden === 'nombre' ? <ArrowDownAZ size={14} /> : <TrendingUp size={14}/>)}
                           {orden === 'estado' ? 'Prioridad' : (orden === 'nombre' ? 'Nombre' : t.sortRank)}
                       </button>
                       <button onClick={toggleCompact} className={`p-2 rounded-full border border-white/10 transition-colors ${isCompact ? 'bg-white text-black' : 'bg-black/20 text-white hover:bg-black/40'}`}>{isCompact ? <Maximize2 size={18} /> : <Minimize2 size={18} />}</button>
                       <button onClick={toggleDarkMode} className={`p-2 rounded-full border border-white/10 transition-colors ${isDarkMode ? 'bg-black/20 text-white' : 'bg-white text-black'}`}>{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
                       <button onClick={() => setShowThemeSelector(!showThemeSelector)} className="bg-black/20 p-2 rounded-full hover:bg-black/40 border border-white/10 text-white"><Palette size={18} /></button>
                       <Link href="/admin" className="bg-black/20 p-2 rounded-full hover:bg-black/40 border border-white/10 text-white"><Lock size={18} /></Link>
                   </div>
                </div>
             </div>
             
             {showThemeSelector && (<div className="mb-6 bg-black/40 p-3 rounded-2xl backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-top-2"><div className="flex gap-4 justify-center">{THEMES.map(theme => (<button key={theme.name} onClick={() => changeTheme(theme)} className={`w-10 h-10 rounded-full ${theme.color} border-2 ${currentTheme.name === theme.name ? 'border-white scale-110 shadow-[0_0_10px_white]' : 'border-transparent opacity-60'}`}></button>))}</div></div>)}
             <h1 className="text-3xl font-bold leading-tight mb-2 drop-shadow-md text-white">{t.welcomeTitle} <br/> <span className="opacity-80 font-normal text-xl">{t.welcomeSub}</span></h1>
             
             {/* BANNER ROTATIVO */}
             <div className="mt-6 flex items-center gap-3 text-sm font-medium bg-black/30 p-3 rounded-2xl w-max backdrop-blur-md border border-white/10 text-white animate-in fade-in duration-500">
                <span className="text-neutral-300 text-xs font-bold">{currentBannerText}</span>
             </div>

             {/* FILTROS (Chips) */}
             <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                 <button onClick={() => changeFilter('all')} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${filter === 'all' ? base.activeChip : base.inactiveChip}`}>{t.fAll}</button>
                 <button onClick={() => changeFilter('stock')} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap flex items-center gap-1 transition-colors ${filter === 'stock' ? base.activeChip : base.inactiveChip}`}><Package size={12}/> {t.fStock}</button>
                 <button onClick={() => changeFilter('top')} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap flex items-center gap-1 transition-colors ${filter === 'top' ? base.activeChip : base.inactiveChip}`}><Star size={12}/> {t.fTop}</button>
                 <button onClick={() => changeFilter('to_rate')} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap flex items-center gap-1 transition-colors ${filter === 'to_rate' ? base.activeChip : base.inactiveChip}`}><CheckCircle size={12}/> {t.fRate}</button>
                 <button onClick={() => changeFilter('ordered')} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap flex items-center gap-1 transition-colors ${filter === 'ordered' ? base.activeChip : base.inactiveChip}`}><Clock size={12}/> {t.fOrdered}</button>
                 <button onClick={() => changeFilter('new')} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${filter === 'new' ? base.activeChip : base.inactiveChip}`}>{t.fNew}</button>
             </div>
         </div>
      </div>

      <div className="px-4 -mt-8 relative z-20 max-w-lg mx-auto">
        
        {/* LOGIN DE NOMBRE */}
        <div className={`${base.card} p-2 rounded-2xl border flex items-center gap-3 mb-6`}>
             <div className={`p-3 rounded-xl bg-gradient-to-br ${currentTheme.gradient} text-white shadow-lg`}><User size={24} /></div>
             <div className="flex-1 pr-2">
                 <label className={`text-[10px] uppercase font-bold ${base.subtext} ml-1`}>{t.whoAreYou}</label>
                 
                 <form onSubmit={(e) => { e.preventDefault(); }} className="w-full">
                    {config.modo_estricto ? (
                        <select value={nombreInvitado} onChange={e => handleNameChange(e.target.value)} className={`w-full text-lg font-bold outline-none bg-transparent border-b pb-1 ${isDarkMode ? 'text-white border-white/20' : 'text-black border-gray-300'}`}><option value="" className="text-black">...</option>{invitadosLista.map(u => (<option key={u.id} value={u.nombre} className="text-black">{u.nombre}</option>))}</select>
                    ) : (
                        <input type="text" value={nombreInvitado} onChange={e => handleNameChange(e.target.value)} placeholder={t.namePlaceholder} className={`w-full text-lg font-bold outline-none bg-transparent ${isDarkMode ? 'text-white placeholder-neutral-600' : 'text-black placeholder-gray-400'}`} />
                    )}
                 </form>

                 {usuarioBloqueado && (
                     <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
                         <AlertCircle size={10}/> {t.blocked}: {motivoBloqueo}
                     </p>
                 )}
             </div>
        </div>

        {mensaje && (
          <div className={`fixed top-4 left-4 right-4 p-3 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col items-center justify-center animate-bounce-in text-center ${mensaje.tipo === 'alerta' ? 'border-4 border-neutral-900 font-bold' : 'border-2 border-neutral-200 font-bold'} bg-white text-black`}>
            <div className="flex items-center gap-2 mb-1 text-sm">{mensaje.tipo === 'alerta' && mensaje.texto.includes('horno') && <PartyPopper size={18} className="text-orange-600" />}{mensaje.texto}</div>
            {mensaje.tipo === 'alerta' && (<button onClick={() => setMensaje(null)} className="mt-1 bg-neutral-900 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg active:scale-95 hover:bg-black transition-transform">{t.okBtn}</button>)}
          </div>
        )}

        {showRatingModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                <div className={`${base.card} p-6 rounded-3xl w-full max-w-sm relative shadow-2xl border`}>
                    <button onClick={() => setShowRatingModal(false)} className={`absolute top-4 right-4 ${base.subtext} hover:${base.text}`}><X /></button>
                    <h3 className={`text-xl font-bold mb-1 ${base.text}`}>{t.rateTitle} {pizzaToRate?.nombre}</h3>
                    <div className="flex justify-center gap-2 mb-6 mt-4">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setRatingValue(star)} className="transition-transform hover:scale-110">
                                <Star size={32} fill={star <= ratingValue ? "#eab308" : "transparent"} className={star <= ratingValue ? "text-yellow-500" : "text-neutral-600"} />
                            </button>
                        ))}
                    </div>
                    <textarea 
                        className={`w-full p-3 rounded-xl border outline-none mb-4 resize-none h-24 ${base.input} ${isDarkMode ? 'border-neutral-700 bg-black/50' : 'border-gray-200 bg-gray-50'}`}
                        placeholder="..."
                        value={commentValue}
                        onChange={e => setCommentValue(e.target.value)}
                    />
                    <button onClick={submitRating} disabled={ratingValue === 0} className={`w-full py-3 rounded-xl font-bold shadow-lg ${ratingValue > 0 ? `${currentTheme.color} text-white` : 'bg-neutral-800 text-neutral-500'}`}>
                        {t.sendReview}
                    </button>
                </div>
            </div>
        )}

        <div className="space-y-3 pb-10">
           {cargando ? <p className={`text-center ${base.subtext} mt-10 animate-pulse`}>{t.loading}</p> : pizzasOrdenadas.map(pizza => (
               <div key={pizza.id} className={`${base.card} rounded-[36px] border ${pizza.stockRestante === 0 ? 'opacity-50 grayscale' : pizza.cocinando ? 'border-red-600/30' : ''} shadow-lg relative overflow-hidden group ${isCompact ? 'p-3' : 'p-5'}`}>
                   
                   <div className="flex justify-between items-start mb-2">
                       <div className="flex-1">
                           <div className="flex flex-wrap items-center gap-2 mb-1">
                               <h2 className={`font-bold ${isCompact ? 'text-lg' : 'text-2xl'} ${base.text}`}>{pizza.nombre}</h2>
                               
                               <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs ${base.badge}`}>
                                   
                                   <Star 
                                        size={12} 
                                        className={pizza.countRating > 0 ? "text-yellow-500" : "text-gray-500 opacity-50"} 
                                        fill="currentColor" 
                                    />
                                   <span className={`font-bold ${pizza.countRating > 0 ? '' : 'text-gray-500 opacity-50'}`}>
                                       {pizza.avgRating || '0.0'}
                                   </span>
                                   <span className={`text-[10px] ${pizza.countRating > 0 ? 'opacity-60' : 'text-gray-500 opacity-40'}`}>
                                       ({pizza.countRating || 0})
                                   </span>
                                   
                                   {miHistorial[pizza.id]?.comidos > 0 && !misValoraciones.includes(pizza.id) && (
                                       <button onClick={() => openRating(pizza)} className="ml-1 bg-yellow-500 text-black px-1.5 py-0.5 rounded text-[9px] font-bold animate-pulse hover:scale-105 transition-transform">
                                           {t.rateBtn}
                                       </button>
                                   )}
                               </div>

                               {pizza.cocinando && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">{t.inOven}</span>}
                           </div>

                           {!isCompact && <p className={`text-xs leading-relaxed max-w-[200px] ${base.subtext}`}>{pizza.descripcion}</p>}
                           
                           <p className={`text-[10px] font-mono mt-1 ${pizza.stockRestante === 0 ? 'text-red-500 font-bold' : pizza.stockRestante < 5 ? 'text-red-400 font-bold animate-pulse' : base.subtext}`}>
                               {pizza.stockRestante === 0 ? t.soldOut : `${t.remaining} ${pizza.stockRestante} ${t.portions}`}
                           </p>
                       </div>
                       {(miHistorial[pizza.id]?.pendientes > 0 || miHistorial[pizza.id]?.comidos > 0) && (
                           <div className={`rounded-2xl border text-right ${isCompact ? 'p-1 px-2' : 'p-2 px-3'} ${isDarkMode ? 'bg-neutral-800 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                               {miHistorial[pizza.id]?.pendientes > 0 && <div className={`text-[10px] font-bold ${currentTheme.text} uppercase`}>{t.wait}: {miHistorial[pizza.id].pendientes}</div>}
                               {miHistorial[pizza.id]?.comidos > 0 && <div className={`text-[10px] font-bold uppercase ${base.subtext}`}>{t.ate}: {miHistorial[pizza.id].comidos}</div>}
                           </div>
                       )}
                   </div>

                   <div className={`rounded-2xl border ${isCompact ? 'p-2 mb-2 mt-1' : 'p-3 mb-5 mt-4'} ${base.progressBg}`}>
                       <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2 ${base.subtext}`}>
                           <span>{pizza.faltanParaCompletar === pizza.target ? t.newPizza : t.progress}</span>
                           <span className={pizza.faltanParaCompletar === 0 ? currentTheme.text : base.subtext}>{pizza.faltanParaCompletar > 0 ? `${t.missing} ${pizza.faltanParaCompletar}` : t.completed}</span>
                       </div>
                       <div className={`rounded-full overflow-hidden flex border ${isCompact ? 'h-1.5' : 'h-2'} ${base.progressTrack}`}>
                           {[...Array(pizza.target)].map((_, i) => (
                               <div key={i} className={`flex-1 border-r last:border-0 ${isDarkMode ? 'border-black/50' : 'border-white/50'} ${i < pizza.ocupadasActual ? `bg-gradient-to-r ${pizza.cocinando ? 'from-orange-600 to-red-600' : (currentTheme.name === 'Carbone' ? 'from-white to-neutral-300' : currentTheme.gradient)}` : 'bg-transparent'}`}></div>
                           ))}
                       </div>
                   </div>
                   <div className="flex gap-3">
                       {miHistorial[pizza.id]?.pendientes > 0 && (
                           <button onClick={() => modificarPedido(pizza, 'restar')} className={`rounded-2xl flex items-center justify-center border active:scale-95 transition ${base.buttonSec} ${isCompact ? 'w-12 h-10' : 'w-16 h-14'}`}><Minus size={isCompact ? 16 : 20} /></button>
                       )}
                       {pizza.stockRestante > 0 ? (
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