'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Minus, User, Palette, Lock, PartyPopper, Bell, BellOff, 
  ArrowDownAZ, ArrowUpNarrowWide, Maximize2, Minimize2, AlertCircle, 
  KeyRound, ArrowRight, Sun, Moon, Star, X, Filter, TrendingUp, 
  CheckCircle, Clock, Package, ChefHat, Flame, Type, Download, ChevronRight, Check, Languages, LayoutTemplate, Users
} from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- COMPONENTE PARA EL TIEMPO TRANSCURRIDO ---
const RelativeTime = ({ isoString }: { isoString: string }) => {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        const update = () => {
            const start = new Date(isoString).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, now - start);
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setElapsed(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [isoString]);

    return <span className="font-mono text-[10px] opacity-60">{elapsed}</span>;
};

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
    status: "personas ya pidieron.",
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
    ingredientsFor: "Hay ingredientes para",
    portionsMore: "porciones más",
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
    fStock: "Con Stock",
    sortRank: "Ranking",
    sumTotal: "Pediste",
    sumWait: "Espera",
    sumOven: "Horno",
    sumReady: "Listas",
    emptyStock: "¡Se comieron todo! A llorar a la llorería 😭",
    emptyTop: "¡Qué exigente! Nada cumple tus estándares 🧐",
    emptyRate: "¡Estás al día! No debes ninguna opinión, crack 🫡",
    emptyOrdered: "¿Estás a dieta? Aún no pediste nada... 🤨",
    emptyNew: "¡Ya probaste todo! Eres un profesional de la pizza 🍕",
    emptyDefault: "No hay pizzas por aquí... ¿Fue magia? 🎩",
    onb_wel_title: "¡Bienvenido! 👋",
    onb_wel_desc: "Tu compañero digital para disfrutar de la mejor pizza casera. Organiza, pide y califica en tiempo real.",
    onb_inst_title: "Instala la App",
    onb_inst_desc: "Para una mejor experiencia, instala la app tocando el botón de descarga en la barra superior.",
    onb_how_title: "Conoce la App",
    onb_enjoy_title: "¡A comer!",
    onb_enjoy_desc: "Elige tu gusto favorito, pide tus porciones y espera a que el horno haga su magia.",
    onb_btn_next: "Siguiente",
    onb_btn_start: "Comenzar",
    feat_prog_title: "Progreso de la Pizza",
    feat_prog_desc: "Esta barra se llena a medida que todos piden. Cuando se completa, ¡la pizza va al horno!",
    feat_oven_title: "Estado del Horno",
    feat_oven_desc: "Cuando veas fuego y rojo, tu pizza se está cocinando.",
    feat_ctrl_title: "Tus Controles",
    feat_ctrl_desc: "Arriba a la derecha: Cambia Idioma (ES), Tamaño Texto (T), Tema (Paleta) y Modo Oscuro (Luna).",
  },
  en: {
    welcomeTitle: "Thanks for coming today,",
    welcomeSub: "it will be a pleasure to cook for you. 🫠",
    whoAreYou: "YOUR NAME?",
    namePlaceholder: "Type it here...",
    status: "people have ordered.",
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
    ingredientsFor: "Ingredients for",
    portionsMore: "more slices",
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
    sortRank: "Rank",
    sumTotal: "Total",
    sumWait: "Wait",
    sumOven: "Oven",
    sumReady: "Ready",
    emptyStock: "Sold out! You snooze, you lose 😭",
    emptyTop: "So picky! Nothing meets your standards 🧐",
    emptyRate: "All caught up! You owe nothing, boss 🫡",
    emptyOrdered: "On a diet? You haven't ordered anything... 🤨",
    emptyNew: "You tried everything! A true pro 🍕",
    emptyDefault: "No pizzas here... Magic? 🎩",
    onb_wel_title: "Welcome! 👋",
    onb_wel_desc: "Your digital companion for the best homemade pizza. Organize, order, and rate in real-time.",
    onb_inst_title: "Install the App",
    onb_inst_desc: "For the best experience, install the app by tapping the download button in the top bar.",
    onb_how_title: "How it Works",
    onb_enjoy_title: "Let's Eat!",
    onb_enjoy_desc: "Pick your favorite flavor, order your slices, and wait for the oven magic.",
    onb_btn_next: "Next",
    onb_btn_start: "Start",
    feat_prog_title: "Pizza Progress",
    feat_prog_desc: "This bar fills up as people order. When full, the pizza goes into the oven!",
    feat_oven_title: "Oven Status",
    feat_oven_desc: "When you see fire and red, your pizza is baking.",
    feat_ctrl_title: "Your Controls",
    feat_ctrl_desc: "Top Right: Change Language (EN), Text Size (T), Theme (Palette), and Dark Mode (Moon).",
  },
  it: {
    welcomeTitle: "Grazie per essere venuto,",
    welcomeSub: "sarà un piacere cucinare per te. 🫠",
    whoAreYou: "IL TUO NOME?",
    namePlaceholder: "Scrivilo qui...",
    status: "persone hanno ordinato.",
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
    notifOn: "🔔 Attive",
    notifOff: "🔕 Disattive",
    soldOut: "ESAURITA",
    blocked: "ACCESSO LIMITATO",
    remaining: "Rimangono",
    ingredientsFor: "Ingredienti per",
    portionsMore: "fette in più",
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
    sortRank: "Classifica",
    sumTotal: "Totale",
    sumWait: "Attesa",
    sumOven: "Forno",
    sumReady: "Pronte",
    emptyStock: "Tutto finito! 😭",
    emptyTop: "Niente qui. Sei esigente! 🧐",
    emptyRate: "Tutto votato! Bravo 🫡",
    emptyOrdered: "A dieta? Niente ordini... 🤨",
    emptyNew: "Hai provato tutto! 🍕",
    emptyDefault: "Nessuna pizza... Magia? 🎩",
    onb_wel_title: "Benvenuto! 👋",
    onb_wel_desc: "Il tuo compagno digitale per la migliore pizza fatta in casa. Organizza, ordina e vota in tempo reale.",
    onb_inst_title: "Installa l'App",
    onb_inst_desc: "Per un'esperienza migliore, installa l'app toccando il pulsante di download nella barra in alto.",
    onb_how_title: "Come Funziona",
    onb_enjoy_title: "Buon Appetito!",
    onb_enjoy_desc: "Scegli il tuo gusto preferito, ordina le fette e aspetta la magia del forno.",
    onb_btn_next: "Avanti",
    onb_btn_start: "Inizia",
    feat_prog_title: "Progresso Pizza",
    feat_prog_desc: "Questa barra si riempie man mano che si ordina. Quando è piena, va in forno!",
    feat_oven_title: "Stato Forno",
    feat_oven_desc: "Quando vedi fuoco e rosso, la tua pizza sta cuocendo.",
    feat_ctrl_title: "I Tuoi Controlli",
    feat_ctrl_desc: "In alto a destra: Lingua (IT), Testo (T), Tema (Tavolozza) e Modalità Scura (Luna).",
  }
};

type LangType = 'es' | 'en' | 'it';
type MensajeTipo = { texto: string, tipo: 'info' | 'alerta' | 'exito' };

export default function VitoPizzaApp() {
  const [lang, setLang] = useState<LangType>('es');
  const t = dictionary[lang];

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
  const [filter, setFilter] = useState<'all' | 'top' | 'to_rate' | 'ordered' | 'new' | 'stock'>('all');
  
  const [isCompact, setIsCompact] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0);
  const DESC_SIZES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];
  const STOCK_SIZES = ['text-[10px]', 'text-xs', 'text-sm', 'text-base', 'text-lg'];

  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [currentTheme, setCurrentTheme] = useState(THEMES[1]); 
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const [bannerIndex, setBannerIndex] = useState(0);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(1);
  
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pizzaToRate, setPizzaToRate] = useState<any>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [commentValue, setCommentValue] = useState('');
  const [misValoraciones, setMisValoraciones] = useState<string[]>([]);
  const [autoTranslations, setAutoTranslations] = useState<Record<string, Record<string, { name: string, desc: string }>>>({});

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
      inactiveChip: "bg-neutral-900 text-neutral-400 border border-neutral-800",
      bar: "bg-neutral-900/50 backdrop-blur-md border-white/10 shadow-lg text-white border"
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
      inactiveChip: "bg-white text-gray-500 border border-gray-200",
      bar: "bg-white/50 backdrop-blur-md border-gray-300 shadow-lg text-gray-900 border"
  };

  const getBtnClass = (isActive: boolean) => {
      const common = "p-1.5 rounded-full transition-all duration-300 flex items-center justify-center bg-transparent ";
      const scale = isActive ? "scale-110" : "hover:scale-105";
      if (isDarkMode) {
          return `${common} ${scale} ${isActive ? 'text-white' : 'text-neutral-200 hover:text-white'}`; 
      } else {
          return `${common} ${scale} ${isActive ? 'text-black' : 'text-neutral-800 hover:text-black'}`; 
      }
  };

  const [config, setConfig] = useState({ porciones_por_pizza: 4, total_invitados: 10, modo_estricto: false });
  const [invitadosActivos, setInvitadosActivos] = useState(0);
  const [miHistorial, setMiHistorial] = useState<Record<string, { pendientes: number, comidos: number, minCreatedAt?: string }>>({});
  
  const [invitadosLista, setInvitadosLista] = useState<any[]>([]);
  const [usuarioBloqueado, setUsuarioBloqueado] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState('');

  const prevComidosPerPizza = useRef<Record<string, number>>({});
  const prevCocinandoData = useRef<Record<string, boolean>>({});
  const firstLoadRef = useRef(true);

  // --- FUNCIÓN RESTAURADA ---
  const getEmptyStateMessage = () => {
      switch(filter) {
          case 'stock': return t.emptyStock;
          case 'top': return t.emptyTop;
          case 'to_rate': return t.emptyRate;
          case 'ordered': return t.emptyOrdered;
          case 'new': return t.emptyNew;
          default: return t.emptyDefault;
      }
  };

  const verifyAccess = (i: string, c: string) => { 
      if (!c || c === '' || i === c) { 
          setAccessGranted(true); 
          if(c !== '') localStorage.setItem('vito-guest-pass-val', i); 
      } else { 
          setAccessGranted(false); 
      } 
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

  const rotarIdioma = () => { 
      let nextLang: LangType = 'es';
      if (lang === 'es') nextLang = 'en'; 
      else if (lang === 'en') nextLang = 'it'; 
      setLang(nextLang);
      localStorage.setItem('vito-lang', nextLang);
  };

  const translateText = async (text: string, targetLang: string) => {
    try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURI(text)}`);
        const data = await response.json();
        return data[0][0][0] || text;
    } catch (error) { return text; }
  };

  const fetchDatos = useCallback(async () => {
    const now = new Date(); const corte = new Date(now); if (now.getHours() < 6) corte.setDate(corte.getDate() - 1); corte.setHours(6, 0, 0, 0); const iso = corte.toISOString();
    const { data: dC } = await supabase.from('configuracion_dia').select('*').single();
    setConfig(dC || { porciones_por_pizza: 4, total_invitados: 10, modo_estricto: false });
    const sPass = dC?.password_invitados || ''; setDbPass(sPass); const lPass = localStorage.getItem('vito-guest-pass-val') || guestPassInput; verifyAccess(lPass, sPass); setLoadingConfig(false);
    const { data: dPed } = await supabase.from('pedidos').select('*').gte('created_at', iso);
    const { data: dPiz } = await supabase.from('menu_pizzas').select('*').eq('activa', true).order('created_at');
    const { data: dInv } = await supabase.from('lista_invitados').select('*');
    const { data: dVal } = await supabase.from('valoraciones').select('*').gte('created_at', iso); 
    setAllRatings(dVal || []);
    if (dInv) { setInvitadosLista(dInv); const u = dInv.find(u => u.nombre.toLowerCase() === nombreInvitado.toLowerCase()); if (u?.bloqueado) { setUsuarioBloqueado(true); setMotivoBloqueo(u.motivo_bloqueo || ''); } else { setUsuarioBloqueado(false); setMotivoBloqueo(''); } }
    if (dPiz && dPed) {
      setPedidos(dPed); setInvitadosActivos(new Set(dPed.map(p => p.invitado_nombre.toLowerCase().trim())).size); setPizzas(dPiz);
      if (nombreInvitado) {
        const mis = dPed.filter(p => p.invitado_nombre.toLowerCase() === nombreInvitado.toLowerCase().trim());
        const res: any = {};
        dPiz.forEach(pz => {
             const m = mis.filter(p => p.pizza_id === pz.id);
             const c = m.filter(p => p.estado === 'entregado').reduce((acc, x) => acc + x.cantidad_porciones, 0);
             const p = m.filter(p => p.estado !== 'entregado').reduce((acc, x) => acc + x.cantidad_porciones, 0);
             const penList = m.filter(p => p.estado !== 'entregado').sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
             res[pz.id] = { pendientes: p, comidos: c, minCreatedAt: penList[0]?.created_at };
             if (!firstLoadRef.current) { const prev = prevComidosPerPizza.current[pz.id] || 0; if (c > prev) { const dif = c - prev; mostrarMensaje(`¡${dif} de ${pz.nombre} listas!`, 'alerta'); } } prevComidosPerPizza.current[pz.id] = c;
        });
        setMiHistorial(res);
        if (firstLoadRef.current) { dPiz.forEach(pz => { prevCocinandoData.current[pz.id] = pz.cocinando; }); firstLoadRef.current = false; } else { dPiz.forEach(pz => { const estaba = prevCocinandoData.current[pz.id] || false; if (pz.cocinando && !estaba && res[pz.id]?.pendientes > 0) { mostrarMensaje(`¡${res[pz.id].pendientes} de ${pz.nombre} al horno!`, 'alerta'); } prevCocinandoData.current[pz.id] = pz.cocinando; }); }
      }
    }
    setCargando(false);
  }, [nombreInvitado, t, guestPassInput]); 

  useEffect(() => { fetchDatos(); const c = supabase.channel('app-realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchDatos()).subscribe(); return () => { supabase.removeChannel(c); }; }, [fetchDatos]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('vito-onboarding-seen');
    if (!hasSeenOnboarding) setShowOnboarding(true);
    const savedName = localStorage.getItem('vito-guest-name');
    if (savedName) setNombreInvitado(savedName);
    const savedTheme = localStorage.getItem('vito-guest-theme');
    if (savedTheme) setCurrentTheme(THEMES.find(t => t.name === savedTheme) || THEMES[1]);
    const savedMode = localStorage.getItem('vito-dark-mode');
    if (savedMode !== null) setIsDarkMode(savedMode === 'true');
    const savedLang = localStorage.getItem('vito-lang');
    if (savedLang) setLang(savedLang as LangType);
    const savedNotif = localStorage.getItem('vito-notif-enabled');
    if (savedNotif === 'true' && typeof Notification !== 'undefined' && Notification.permission === 'granted') setNotifEnabled(true);
    const savedOrden = localStorage.getItem('vito-orden');
    if (savedOrden) setOrden(savedOrden as any);
    const savedCompact = localStorage.getItem('vito-compact');
    if (savedCompact) setIsCompact(savedCompact === 'true');
    const savedFilter = localStorage.getItem('vito-filter');
    if (savedFilter) setFilter(savedFilter as any);
    const interval = setInterval(() => setBannerIndex((prev) => prev + 1), 3000);

    const handleBeforeInstallPrompt = (e: any) => { e.preventDefault(); setDeferredPrompt(e); setIsInstallable(true); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const presenceChannel = supabase.channel('online-users');
    presenceChannel.on('presence', { event: 'sync' }, () => { setOnlineUsers(Object.keys(presenceChannel.presenceState()).length); })
    .subscribe(async (status) => { if (status === 'SUBSCRIBED') await presenceChannel.track({ online_at: new Date().toISOString() }); });

    return () => { clearInterval(interval); window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt); supabase.removeChannel(presenceChannel); };
  }, []);

  const onboardingStepContent = [
    { title: t.onb_wel_title, desc: t.onb_wel_desc, icon: <img src="/logo.png" alt="Logo" className="h-40 w-auto" /> },
    { title: t.onb_inst_title, desc: t.onb_inst_desc, icon: <Download size={64} className="text-teal-500 animate-bounce" /> },
    { title: t.onb_how_title, desc: "", icon: <div className="space-y-4 w-full">
        <div className="bg-white p-3 rounded-xl border flex items-center gap-3"><LayoutTemplate className="text-teal-600"/><div className="text-left"><p className="font-bold text-sm">{t.feat_prog_title}</p><p className="text-xs text-neutral-500">{t.feat_prog_desc}</p></div></div>
        <div className="bg-white p-3 rounded-xl border flex items-center gap-3"><Flame className="text-orange-500"/><div className="text-left"><p className="font-bold text-sm">{t.feat_oven_title}</p><p className="text-xs text-neutral-500">{t.feat_oven_desc}</p></div></div>
        <div className="bg-white p-3 rounded-xl border flex items-center gap-3"><Palette className="text-purple-500"/><div className="text-left"><p className="font-bold text-sm">{t.feat_ctrl_title}</p><p className="text-xs text-neutral-500">{t.feat_ctrl_desc}</p></div></div>
    </div> },
    { title: t.onb_enjoy_title, desc: t.onb_enjoy_desc, icon: <PartyPopper size={64} className="text-yellow-500" /> }
  ];

  const pizzasOrdenadas = useMemo(() => {
      const globalAvg = allRatings.length > 0 ? (allRatings.reduce((a, r) => a + r.rating, 0) / allRatings.length) : 0;
      let lista = pizzas.map(pizza => {
          const totalStock = (pizza.stock || 0) * (pizza.porciones_individuales || config.porciones_por_pizza);
          const used = pedidos.filter(p => p.pizza_id === pizza.id).reduce((a, c) => a + c.cantidad_porciones, 0);
          const stockRestante = Math.max(0, totalStock - used);
          const pen = pedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado').reduce((a, c) => a + c.cantidad_porciones, 0);
          const target = pizza.porciones_individuales || config.porciones_por_pizza;
          const rats = allRatings.filter(r => r.pizza_id === pizza.id);
          const avg = rats.length > 0 ? (rats.reduce((a, b) => a + b.rating, 0) / rats.length).toFixed(1) : null;
          const sortR = rats.length > 0 ? (rats.reduce((a, b) => a + b.rating, 0) / rats.length) : globalAvg;
          let displayName = pizza.nombre;
          let displayDesc = pizza.descripcion;
          if (lang !== 'es' && autoTranslations[pizza.id] && autoTranslations[pizza.id][lang]) {
              displayName = autoTranslations[pizza.id][lang].name;
              displayDesc = autoTranslations[pizza.id][lang].desc;
          }
          return { ...pizza, displayName, displayDesc, stockRestante, target, ocupadasActual: pen % target, faltanParaCompletar: target - (pen % target), avgRating: avg, countRating: rats.length, sortRating: sortR };
      });
      if (filter !== 'all') {
          lista = lista.filter(p => {
              if (filter === 'top') return p.avgRating && parseFloat(p.avgRating) >= 4.5;
              if (filter === 'to_rate') return miHistorial[p.id]?.comidos > 0 && !misValoraciones.includes(p.id);
              if (filter === 'ordered') return (miHistorial[p.id]?.pendientes > 0 || miHistorial[p.id]?.comidos > 0);
              if (filter === 'new') return (!miHistorial[p.id]?.pendientes && !miHistorial[p.id]?.comidos);
              if (filter === 'stock') return p.stockRestante > 0;
              return true;
          });
      }
      return lista.sort((a, b) => {
          if (orden === 'ranking') return b.sortRating - a.sortRating;
          if (orden === 'estado') { if (a.cocinando && !b.cocinando) return -1; if (!a.cocinando && b.cocinando) return 1; if (a.stockRestante > 0 && b.stockRestante <= 0) return -1; }
          return a.displayName.localeCompare(b.displayName);
      });
  }, [pizzas, pedidos, orden, config, allRatings, filter, miHistorial, misValoraciones, lang, autoTranslations]);

  const mySummary = useMemo(() => {
      let t = 0, w = 0, o = 0, r = 0;
      pizzas.forEach(p => {
          const h = miHistorial[p.id];
          if(h) {
              const pen = h.pendientes;
              if (pen > 0) { if (p.cocinando) o += pen; else w += pen; }
              r += h.comidos; t += (h.comidos + pen);
          }
      });
      return { total: t, wait: w, oven: o, ready: r };
  }, [miHistorial, pizzas]);

  const changeFilter = (f: any) => { setFilter(f); localStorage.setItem('vito-filter', f); };
  const toggleCompact = () => { const n = !isCompact; setIsCompact(n); localStorage.setItem('vito-compact', String(n)); };
  const toggleNotificaciones = () => { if (notifEnabled) { setNotifEnabled(false); localStorage.setItem('vito-notif-enabled', 'false'); } else { Notification.requestPermission().then(p => { if (p === 'granted') setNotifEnabled(true); }); } };
  const toggleDarkMode = () => { const n = !isDarkMode; setIsDarkMode(n); localStorage.setItem('vito-dark-mode', String(n)); };
  const toggleOrden = () => { const n = orden === 'estado' ? 'nombre' : (orden === 'nombre' ? 'ranking' : 'estado'); setOrden(n); localStorage.setItem('vito-orden', n); };
  const cycleTextSize = () => setZoomLevel(p => (p + 1) % 5);
  const changeTheme = (t: any) => { setCurrentTheme(t); localStorage.setItem('vito-guest-theme', t.name); setShowThemeSelector(false); };
  const openRating = (p: any) => { setPizzaToRate(p); setRatingValue(0); setCommentValue(''); setShowRatingModal(true); };
  const submitRating = async () => { if (ratingValue === 0) return; await supabase.from('valoraciones').insert([{ pizza_id: pizzaToRate.id, invitado_nombre: nombreInvitado, rating: ratingValue, comentario: commentValue }]); setShowRatingModal(false); fetchDatos(); };
  const mostrarMensaje = (txt: string, tipo: 'info' | 'alerta' | 'exito') => { setMensaje({ texto: txt, tipo }); if (tipo !== 'alerta') setTimeout(() => setMensaje(null), 2500); }

  async function modificarPedido(p: any, acc: 'sumar' | 'restar') {
    if (!nombreInvitado.trim()) { alert(t.errorName); return; }
    if (usuarioBloqueado) { alert(t.blocked); return; }
    if (acc === 'sumar') { if (p.stockRestante <= 0) return; await supabase.from('pedidos').insert([{ invitado_nombre: nombreInvitado, pizza_id: p.id, cantidad_porciones: 1, estado: 'pendiente' }]); } 
    else { const { data } = await supabase.from('pedidos').select('id').eq('pizza_id', p.id).ilike('invitado_nombre', nombreInvitado.trim()).eq('estado', 'pendiente').order('created_at', { ascending: false }).limit(1).single(); if (data) await supabase.from('pedidos').delete().eq('id', data.id); }
  }

  return (
    <div className={`min-h-screen font-sans pb-28 transition-colors duration-500 overflow-x-hidden ${base.bg}`}>
      
      {showOnboarding && (
          <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={() => { const d = touchStart - touchEnd; if (d > 50 && onboardingStep < 3) setOnboardingStep(s => s+1); if (d < -50 && onboardingStep > 0) setOnboardingStep(s => s-1); }} className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center text-neutral-900 animate-in fade-in duration-500 select-none">
              <div className="absolute top-6 right-6"><button onClick={rotarIdioma} className="bg-neutral-100 p-2 rounded-full font-bold text-xs shadow-sm border flex items-center gap-2"><Languages size={14}/> {lang.toUpperCase()}</button></div>
              <div className="max-w-md w-full relative h-[70vh] flex flex-col justify-center">
                  <div className="flex flex-col items-center gap-6 animate-in slide-in-from-right-10 duration-500">
                      {onboardingStepContent[onboardingStep].icon}
                      <h1 className="text-3xl font-bold">{onboardingStepContent[onboardingStep].title}</h1>
                      <p className="text-neutral-500 text-lg leading-relaxed">{onboardingStepContent[onboardingStep].desc}</p>
                  </div>
              </div>
              <div className="fixed bottom-10 left-0 right-0 flex flex-col items-center gap-6 px-8">
                  <div className="flex gap-2">{[0, 1, 2, 3].map(i => (<div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === onboardingStep ? 'bg-teal-600 w-8' : 'bg-neutral-200 w-2'}`}></div>))}</div>
                  <button onClick={() => onboardingStep === 3 ? completeOnboarding() : setOnboardingStep(s => s+1)} className="bg-neutral-900 text-white w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl">{onboardingStep === 3 ? t.onb_btn_start : t.onb_btn_next} {onboardingStep < 3 ? <ChevronRight size={18} /> : <Check size={18}/>}</button>
              </div>
          </div>
      )}

      <div className="fixed top-3 left-3 right-3 z-50 flex items-center justify-between pointer-events-none">
          <div className={`p-1.5 rounded-full border shadow-lg flex gap-1.5 pointer-events-auto ${base.bar}`}>
              <button onClick={toggleNotificaciones} className={getBtnClass(notifEnabled)}>{notifEnabled ? <Bell size={18} /> : <BellOff size={18} />}</button>
              <button onClick={rotarIdioma} className={getBtnClass(false) + " font-bold text-xs border border-current/20"}>{lang.toUpperCase()}</button>
              <div className="flex items-center justify-center gap-1 p-1.5 rounded-full text-xs font-bold transition-all animate-pulse"><Users size={14} className={isDarkMode ? "text-green-400" : "text-green-700"} /><span>{onlineUsers}</span></div>
          </div>
          <div className={`p-1.5 rounded-full border shadow-lg flex gap-1 pointer-events-auto ${base.bar}`}>
              <button onClick={cycleTextSize} className={getBtnClass(false)}><Type size={18} /></button>
              <button onClick={toggleOrden} className={getBtnClass(false)}>{orden === 'estado' ? <ArrowUpNarrowWide size={18} /> : (orden === 'nombre' ? <ArrowDownAZ size={18} /> : <TrendingUp size={18}/>)}</button>
              <button onClick={toggleCompact} className={getBtnClass(!isCompact)}>{!isCompact ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}</button>
              <button onClick={toggleDarkMode} className={getBtnClass(false)}>{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
              <button onClick={() => setShowThemeSelector(!showThemeSelector)} className={getBtnClass(false)}><Palette size={18} /></button>
              <Link href="/admin" className={getBtnClass(false)}><Lock size={18} /></Link>
              {showThemeSelector && (<div className="absolute top-14 right-0 bg-black/90 backdrop-blur p-2 rounded-xl flex gap-2 animate-in fade-in border border-white/20 shadow-xl">{THEMES.map(theme => (<button key={theme.name} onClick={() => changeTheme(theme)} className={`w-6 h-6 rounded-full ${theme.color} border-2 border-white ring-2 ring-transparent hover:scale-110 transition-transform`}></button>))}</div>)}
          </div>
      </div>

      <div className={`w-full p-6 pb-6 rounded-b-[40px] bg-gradient-to-br ${currentTheme.gradient} shadow-2xl relative overflow-hidden`}>
         <div className="relative z-10 pt-16">
             <div className="mb-6"><h1 className="text-3xl font-bold leading-tight text-white">{t.welcomeTitle} <br/><span className="opacity-80 font-normal text-xl">{t.welcomeSub}</span></h1></div>
             <div className="flex items-center gap-3 text-sm font-medium bg-black/30 p-3 rounded-2xl w-max backdrop-blur-md border border-white/10 text-white mx-auto mb-4"><span>{currentBannerText}</span></div>
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-2">
                 {['all', 'stock', 'top', 'to_rate', 'ordered', 'new'].map((f: any) => (<button key={f} onClick={() => changeFilter(f)} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${filter === f ? base.activeChip : base.inactiveChip}`}>{t[`f${f.charAt(0).toUpperCase() + f.slice(1)}` as keyof typeof t] || f}</button>))}
             </div>
         </div>
      </div>

      <div className="px-4 mt-6 relative z-20 max-w-lg mx-auto pb-20">
        <div className={`${base.card} p-2 rounded-2xl border flex items-center gap-3 mb-6`}>
             <div className={`p-3 rounded-full bg-gradient-to-br ${currentTheme.gradient} text-white shadow-lg`}><User size={24} /></div>
             <div className="flex-1 pr-2">
                 <label className="text-[10px] uppercase font-bold opacity-60 ml-1">{t.whoAreYou}</label>
                 <input type="text" value={nombreInvitado} onChange={e => handleNameChange(e.target.value)} placeholder={t.namePlaceholder} className={`w-full text-lg font-bold outline-none bg-transparent ${base.text}`} />
             </div>
        </div>

        <div className="space-y-3 pb-4">
           {cargando ? <p className="text-center opacity-50 mt-10 animate-pulse">{t.loading}</p> : 
             pizzasOrdenadas.length === 0 ? (<div className="text-center py-10 opacity-60"><p className="text-4xl mb-2">👻</p><p className="text-sm font-bold">{getEmptyStateMessage()}</p></div>) :
             pizzasOrdenadas.map(pizza => (
               <div key={pizza.id} className={`${base.card} rounded-[36px] border ${pizza.cocinando ? 'border-red-600/30' : ''} p-5 relative overflow-hidden group`}>
                   <div className="flex justify-between items-start mb-2"><div className="flex-1">
                     <div className="flex flex-wrap items-center gap-2 mb-1"><h2 className="font-bold text-2xl">{pizza.displayName}</h2>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs ${base.badge}`}><Star size={12} className="text-yellow-500" fill="currentColor" /><span>{pizza.avgRating || '0.0'}</span></div>
                        {pizza.cocinando && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">{t.inOven}</span>}
                        {miHistorial[pizza.id]?.pendientes > 0 && <RelativeTime isoString={miHistorial[pizza.id].minCreatedAt!} />}
                     </div>
                     {!isCompact && <p className={`leading-relaxed opacity-70 ${DESC_SIZES[zoomLevel]}`}>{pizza.displayDesc}</p>}
                   </div></div>
                   <div className={`${base.progressBg} rounded-2xl border p-3 mt-4`}><div className="flex justify-between text-[10px] font-bold uppercase mb-2"><span>{t.progress}</span><span>{pizza.faltanParaCompletar} {t.missing}</span></div><div className={`${base.progressTrack} rounded-full overflow-hidden flex h-2`}>{[...Array(pizza.target)].map((_, i) => (<div key={i} className={`flex-1 border-r last:border-0 ${i < pizza.ocupadasActual ? `bg-gradient-to-r ${currentTheme.gradient}` : ''}`}></div>))}</div></div>
                   <div className="flex gap-3 mt-4">{miHistorial[pizza.id]?.pendientes > 0 && (<button onClick={() => modificarPedido(pizza, 'restar')} className={`${base.buttonSec} rounded-2xl w-16 h-14 flex items-center justify-center border`}><Minus/></button>)}<button onClick={() => modificarPedido(pizza, 'sumar')} className={`flex-1 rounded-2xl font-bold text-white bg-gradient-to-r ${currentTheme.gradient} h-14`}>{t.buttonOrder}</button></div>
               </div>
           ))}
        </div>
      </div>

      <div className={`fixed bottom-4 left-4 right-4 z-50 rounded-full p-3 shadow-2xl ${base.bar}`}>
          <div className="max-w-lg mx-auto flex justify-around items-center text-xs font-bold">
              <div className="flex flex-col items-center"><span className="opacity-60 text-[9px]">{t.sumTotal}</span><span className="text-base">{mySummary.total}</span></div>
              <div className="flex flex-col items-center"><span className="opacity-60 text-[9px]">{t.sumWait}</span><span className="text-base">{mySummary.wait}</span></div>
              <div className="flex flex-col items-center"><span className="opacity-60 text-[9px]">{t.sumOven}</span><span className="text-base">{mySummary.oven}</span></div>
              <div className="flex flex-col items-center"><span className="opacity-60 text-[9px]">{t.sumReady}</span><span className="text-base">{mySummary.ready}</span></div>
          </div>
      </div>
    </div>
  );
}
