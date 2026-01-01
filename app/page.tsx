'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  User, ArrowRight, Lock, AlertCircle, X, PartyPopper, Star, Clock, Eye, EyeOff, Crown, Shield, Globe, Languages 
} from 'lucide-react';
import Link from 'next/link';

import { dictionary } from './utils/dictionary';
import { OnboardingOverlay } from './components/guest/OnboardingOverlay';
import { TopBar } from './components/guest/TopBar';
import { FoodCard } from './components/guest/FoodCard';
import { BottomSheet } from './components/guest/BottomSheet';

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
  { name: 'Insta', color: 'bg-pink-600', gradient: 'from-purple-600 via-pink-600 to-orange-500', border: 'border-pink-600/40', text: 'text-pink-500' },
  { name: 'Aurora', color: 'bg-indigo-600', gradient: 'from-blue-500 via-indigo-500 to-purple-500', border: 'border-indigo-600/40', text: 'text-indigo-400' },
  { name: 'Sunset', color: 'bg-orange-500', gradient: 'from-rose-500 via-orange-500 to-yellow-500', border: 'border-orange-500/40', text: 'text-orange-500' },
  { name: 'Oceanic', color: 'bg-cyan-600', gradient: 'from-cyan-500 via-blue-600 to-indigo-600', border: 'border-cyan-600/40', text: 'text-cyan-500' },
  { name: 'Berry', color: 'bg-fuchsia-600', gradient: 'from-fuchsia-600 via-purple-600 to-pink-600', border: 'border-fuchsia-600/40', text: 'text-fuchsia-500' },
];

type LangType = 'es' | 'en' | 'it';
type MensajeTipo = { texto: string, tipo: 'info' | 'alerta' | 'exito' };

const landingTexts: Record<string, { sub: string, btn: string, admin: string }> = {
    es: { sub: "¡Espero que la pases lindo hoy!", btn: "Invitados de Honor", admin: "Acceso Admin" },
    en: { sub: "Hope you have a great time today!", btn: "Guests of Honor", admin: "Admin Access" },
    it: { sub: "Spero che ti diverta oggi!", btn: "Ospiti d'Onore", admin: "Accesso Admin" }
};

const getCookingText = (tipo: string, context: 'ing' | 'ed' | 'short' = 'ing') => {
    const isPizza = tipo === 'pizza';
    if (context === 'ing') return isPizza ? 'al horno' : 'en preparación';
    if (context === 'ed') return isPizza ? 'horneada' : 'lista';
    if (context === 'short') return isPizza ? 'Horno' : 'Cocina';
    return isPizza ? 'cocinando' : 'preparando';
};

export default function VitoPizzaApp() {
  const [lang, setLang] = useState<LangType>('es');
  // @ts-ignore
  const t = dictionary[lang];

  // --- ESTADOS ---
  const [flowStep, setFlowStep] = useState<'loading' | 'landing' | 'name' | 'password' | 'onboarding' | 'app'>('loading');
  const [guestPassInput, setGuestPassInput] = useState(''); 
  const [showPassword, setShowPassword] = useState(true); 

  const [loadingConfig, setLoadingConfig] = useState(true); 
  const [accessGranted, setAccessGranted] = useState(false);
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
  const [imageToView, setImageToView] = useState<string | null>(null);
  
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [summarySheet, setSummarySheet] = useState<'total' | 'wait' | 'oven' | 'ready' | null>(null);

  const [orderToConfirm, setOrderToConfirm] = useState<any>(null);

  const [showLateRatingModal, setShowLateRatingModal] = useState(false);
  const [lateRatingPizza, setLateRatingPizza] = useState<any>(null);
  const processedOrderIds = useRef<Set<string>>(new Set());
  
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
  
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pizzaToRate, setPizzaToRate] = useState<any>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [commentValue, setCommentValue] = useState('');
  const [misValoraciones, setMisValoraciones] = useState<string[]>([]);
  const [autoTranslations, setAutoTranslations] = useState<Record<string, Record<string, { name: string, desc: string }>>>({});
  
  const [translatedWelcome, setTranslatedWelcome] = useState<string>('');
  const [config, setConfig] = useState<{
      porciones_por_pizza: number;
      total_invitados: number;
      modo_estricto: boolean;
      categoria_activa: string;
      mensaje_bienvenida?: string;
      tiempo_recordatorio_minutos?: number;
  }>({ 
      porciones_por_pizza: 4, 
      total_invitados: 10, 
      modo_estricto: false, 
      categoria_activa: '["General"]' 
  });

  const [invitadosActivos, setInvitadosActivos] = useState(0);
  const [miHistorial, setMiHistorial] = useState<Record<string, { pendientes: number, comidos: number }>>({});
  const [invitadosLista, setInvitadosLista] = useState<any[]>([]);
  const [usuarioBloqueado, setUsuarioBloqueado] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState('');

  const prevPendingPerPizzaRef = useRef<Record<string, number>>({});
  const prevComidosPerPizza = useRef<Record<string, number>>({});
  const prevCocinandoData = useRef<Record<string, boolean>>({});
  const firstLoadRef = useRef(true);

  // --- HELPERS (DEFINIDOS AQUÍ PARA EVITAR ERRORES DE HOISTING) ---
  
  const mostrarMensaje = (txt: string, tipo: 'info' | 'alerta' | 'exito') => { 
      setMensaje({ texto: txt, tipo }); 
      if (tipo !== 'alerta') { setTimeout(() => setMensaje(null), 2500); } 
  };

  const getBtnClass = (isActive: boolean) => {
      const common = "p-2 rounded-full transition-all duration-300 flex items-center justify-center bg-transparent ";
      const scale = isActive ? "scale-110" : "hover:scale-105";
      if (isDarkMode) {
          return `${common} ${scale} ${isActive ? 'text-white' : 'text-neutral-200 hover:text-white'}`; 
      } else {
          return `${common} ${scale} ${isActive ? 'text-black' : 'text-neutral-800 hover:text-black'}`; 
      }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getWelcomeMessage = () => {
      let msg = translatedWelcome || config.mensaje_bienvenida;
      if (!msg) return null;
      msg = msg.replace(/\[nombre\]/gi, nombreInvitado || 'Invitado');
      msg = msg.replace(/\[fecha\]/gi, new Date().toLocaleDateString());
      msg = msg.replace(/\[hora\]/gi, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      msg = msg.replace(/\[pizzas\]/gi, String(pizzas.length));
      return msg;
  };

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

  const sendNotification = async (title: string, body: string, url: string = '/') => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        try {
            const registration = await navigator.serviceWorker.ready;
            registration.showNotification(title, {
                body: body, icon: '/icon.png', badge: '/icon.png', vibrate: [200, 100, 200], data: { url: url }
            } as any);
            return;
        } catch (e) {
            console.log("Fallo SW notification, intentando standard");
        }
    }
    if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon.png' });
    }
  };

  const toggleNotificaciones = () => { 
      if (notifEnabled) { 
          setNotifEnabled(false); 
          localStorage.setItem('vito-notif-enabled', 'false'); 
          mostrarMensaje(t.notifOff, 'info'); 
      } else { 
          Notification.requestPermission().then(perm => { 
              if (perm === 'granted') { 
                  setNotifEnabled(true); 
                  localStorage.setItem('vito-notif-enabled', 'true'); 
                  mostrarMensaje(t.notifOn, 'info'); 
                  sendNotification("Il Forno di Vito", "¡Notificaciones activadas correctamente!");
              } else { 
                  alert("Activa las notificaciones en la configuración de tu navegador."); 
              } 
          }); 
      } 
  };

  const toggleDarkMode = () => { const n = !isDarkMode; setIsDarkMode(n); localStorage.setItem('vito-dark-mode', String(n)); };
  const toggleOrden = () => { const n = orden === 'estado' ? 'nombre' : (orden === 'nombre' ? 'ranking' : 'estado'); setOrden(n); localStorage.setItem('vito-orden', n); };
  const toggleCompact = () => { const n = !isCompact; setIsCompact(n); localStorage.setItem('vito-compact', String(n)); };
  const cycleTextSize = () => { setZoomLevel(prev => (prev + 1) % 5); };
  const changeFilter = (f: any) => { setFilter(f); localStorage.setItem('vito-filter', f); };
  const verifyAccess = (i: string, c: string) => { if (!c || c === '' || i === c) { setAccessGranted(true); if(c !== '') localStorage.setItem('vito-guest-pass-val', i); } else { setAccessGranted(false); } };
  const handleNameChange = (val: string) => { setNombreInvitado(val); };
  const changeTheme = (t: typeof THEMES[0]) => { setCurrentTheme(t); localStorage.setItem('vito-guest-theme', t.name); setShowThemeSelector(false); };
  const rotarIdioma = () => { let nextLang: LangType = 'es'; if (lang === 'es') nextLang = 'en'; else if (lang === 'en') nextLang = 'it'; setLang(nextLang); localStorage.setItem('vito-lang', nextLang); };
  
  const translateText = async (text: string, targetLang: string) => {
    try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURI(text)}`);
        const data = await response.json();
        return data[0][0][0] || text;
    } catch (error) {
        console.error("Error traduciendo", error);
        return text;
    }
  };

  // --- EFECTOS DE CARGA ---
  useEffect(() => {
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(error => console.log('SW error:', error)); }
    const hasSeenOnboarding = localStorage.getItem('vito-onboarding-seen');
    if (!hasSeenOnboarding) setShowOnboarding(true);
    const savedName = localStorage.getItem('vito-guest-name'); if (savedName) setNombreInvitado(savedName);
    const savedTheme = localStorage.getItem('vito-guest-theme'); if (savedTheme) setCurrentTheme(THEMES.find(t => t.name === savedTheme) || THEMES[1]); else setCurrentTheme(THEMES[1]);
    const savedMode = localStorage.getItem('vito-dark-mode'); if (savedMode !== null) setIsDarkMode(savedMode === 'true'); else setIsDarkMode(false);
    const savedLang = localStorage.getItem('vito-lang'); if (savedLang) setLang(savedLang as LangType);
    const savedNotif = localStorage.getItem('vito-notif-enabled'); if (savedNotif === 'true' && typeof Notification !== 'undefined' && Notification.permission === 'granted') setNotifEnabled(true);
    const savedOrden = localStorage.getItem('vito-orden'); if (savedOrden) setOrden(savedOrden as any);
    const savedCompact = localStorage.getItem('vito-compact'); if (savedCompact) setIsCompact(savedCompact === 'true');
    const savedFilter = localStorage.getItem('vito-filter'); if (savedFilter) setFilter(savedFilter as any);
    const savedPass = localStorage.getItem('vito-guest-pass-val'); if(savedPass) setGuestPassInput(savedPass);

    const interval = setInterval(() => { setBannerIndex((prev) => prev + 1); }, 3000);

    const handleBeforeInstallPrompt = (e: any) => { e.preventDefault(); setDeferredPrompt(e); setIsInstallable(true); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const presenceChannel = supabase.channel('online-users');
    presenceChannel.on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const count = Object.values(state).reduce((acc: number, presences: any) => {
            const isGuest = presences.some((p: any) => p.role === 'guest');
            return acc + (isGuest ? 1 : 0);
        }, 0);
        setOnlineUsers(count);
      }).subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            role: 'guest'
          });
        }
      });

    return () => {
        clearInterval(interval);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        supabase.removeChannel(presenceChannel);
    };
  }, []);

  useEffect(() => {
      const logAccess = async () => {
          let sessionId = localStorage.getItem('vito-session-id');
          if (!sessionId) { sessionId = crypto.randomUUID(); localStorage.setItem('vito-session-id', sessionId); }
          const userAgent = navigator.userAgent; let deviceType = "Desktop"; if (/Mobi|Android/i.test(userAgent)) deviceType = "Mobile";
          let browserName = "Unknown"; if (userAgent.indexOf("Chrome") > -1) browserName = "Chrome"; else if (userAgent.indexOf("Safari") > -1) browserName = "Safari"; else if (userAgent.indexOf("Firefox") > -1) browserName = "Firefox";
          let ipData = { ip: null, city: null, country_name: null }; try { const res = await fetch('https://ipapi.co/json/'); if (res.ok) ipData = await res.json(); } catch (e) {}
          const { data: existingLog } = await supabase.from('access_logs').select('id').eq('session_id', sessionId).gt('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()).single();
          if (!existingLog) { await supabase.from('access_logs').insert([{ session_id: sessionId, device: deviceType, browser: browserName, ip: ipData.ip, ciudad: ipData.city, pais: ipData.country_name, invitado_nombre: nombreInvitado || null }]); } 
          else { if (nombreInvitado) { await supabase.from('access_logs').update({ invitado_nombre: nombreInvitado }).eq('id', existingLog.id); } }
      };
      logAccess();
  }, [nombreInvitado]);

  useEffect(() => {
      if (lang === 'es' || pizzas.length === 0) return;
      const translateAll = async () => {
          const newTrans = { ...autoTranslations };
          let hasChanges = false;
          for (const p of pizzas) {
              if (!newTrans[p.id]) newTrans[p.id] = {};
              if (!newTrans[p.id][lang]) {
                  const tName = await translateText(p.nombre, lang);
                  const tDesc = await translateText(p.descripcion || "", lang);
                  newTrans[p.id][lang] = { name: tName, desc: tDesc };
                  hasChanges = true;
              }
          }
          if (hasChanges) setAutoTranslations(newTrans);
          if (config.mensaje_bienvenida) {
              let safeMsg = config.mensaje_bienvenida.replace(/\n/g, ' XX_BR_XX ').replace(/\[nombre\]/gi, 'XX_NAME_XX').replace(/\[fecha\]/gi, 'XX_DATE_XX').replace(/\[hora\]/gi, 'XX_TIME_XX').replace(/\[pizzas\]/gi, 'XX_COUNT_XX');
              let tMsg = await translateText(safeMsg, lang);
              tMsg = tMsg.replace(/XX_BR_XX/gi, '\n').replace(/XX _ BR _ XX/gi, '\n').replace(/XX_NAME_XX/gi, '[nombre]').replace(/XX _ NAME _ XX/gi, '[nombre]').replace(/XX_DATE_XX/gi, '[fecha]').replace(/XX _ DATE _ XX/gi, '[fecha]').replace(/XX_TIME_XX/gi, '[hora]').replace(/XX _ TIME _ XX/gi, '[hora]').replace(/XX_COUNT_XX/gi, '[pizzas]').replace(/XX _ COUNT _ XX/gi, '[pizzas]');
              setTranslatedWelcome(tMsg);
          }
      };
      translateAll();
  }, [lang, pizzas, autoTranslations, config.mensaje_bienvenida]);

  // --- LOGICA FLUJO DE ACCESO ---
  const checkOnboarding = () => { const seen = localStorage.getItem('vito-onboarding-seen'); if (!seen) { setFlowStep('onboarding'); setShowOnboarding(true); } else { setFlowStep('app'); } };
  const handleNameSubmit = () => { if (!nombreInvitado.trim()) return alert("Por favor ingresa tu nombre"); localStorage.setItem('vito-guest-name', nombreInvitado); if (dbPass && dbPass !== '') { setFlowStep('password'); } else { checkOnboarding(); } };
  const handlePasswordSubmit = () => { if (guestPassInput === dbPass) { localStorage.setItem('vito-guest-pass-val', guestPassInput); checkOnboarding(); } else { alert("Contraseña incorrecta"); } };
  const handleInstallClick = async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === 'accepted') setIsInstallable(false); setDeferredPrompt(null); };
  const completeOnboarding = () => { localStorage.setItem('vito-onboarding-seen', 'true'); setShowOnboarding(false); setFlowStep('app'); };

  const fetchConfig = useCallback(async () => {
    const { data } = await supabase.from('configuracion_dia').select('*').single();
    if (data) { setConfig(data); setDbPass(data.password_invitados || ''); }
    const savedName = localStorage.getItem('vito-guest-name');
    const savedPass = localStorage.getItem('vito-guest-pass-val');
    if (savedName && (!data?.password_invitados || savedPass === data.password_invitados)) { setNombreInvitado(savedName); setFlowStep('app'); } else { setFlowStep('landing'); }
    setLoadingConfig(false);
  }, []);
  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // --- FETCH DATOS ---
  const fetchDatos = useCallback(async () => {
    const now = new Date(); const corte = new Date(now); if (now.getHours() < 6) corte.setDate(corte.getDate() - 1); corte.setHours(6, 0, 0, 0); const iso = corte.toISOString();
    const { data: dPed } = await supabase.from('pedidos').select('*').gte('created_at', iso);
    const { data: dPiz } = await supabase.from('menu_pizzas').select('*').eq('activa', true).order('created_at');
    const { data: dInv } = await supabase.from('lista_invitados').select('*');
    const { data: dVal } = await supabase.from('valoraciones').select('*').gte('created_at', iso); 
    if (dVal) setAllRatings(dVal);
    if (dInv) { setInvitadosLista(dInv); const u = dInv.find(u => u.nombre.toLowerCase() === nombreInvitado.toLowerCase()); if (u?.bloqueado) { setUsuarioBloqueado(true); setMotivoBloqueo(u.motivo_bloqueo || ''); } else { setUsuarioBloqueado(false); setMotivoBloqueo(''); } }
    if (dPiz && dPed) {
      setPedidos(dPed); setInvitadosActivos(new Set(dPed.map(p => p.invitado_nombre.toLowerCase().trim())).size); setPizzas(dPiz);
      if (nombreInvitado) {
        const mV = dVal?.filter(v => v.invitado_nombre.toLowerCase() === nombreInvitado.toLowerCase()); if (mV) setMisValoraciones(mV.map(v => v.pizza_id));
        const mis = dPed.filter(p => p.invitado_nombre.toLowerCase() === nombreInvitado.toLowerCase().trim());
        const res: any = {}; const penInfo: Record<string, number> = {}; 
        dPiz.forEach(pz => {
             const m = mis.filter(p => p.pizza_id === pz.id); const c = m.filter(p => p.estado === 'entregado').reduce((acc, x) => acc + x.cantidad_porciones, 0); const p = m.filter(p => p.estado !== 'entregado').reduce((acc, x) => acc + x.cantidad_porciones, 0); res[pz.id] = { pendientes: p, comidos: c };
             if (p > 0) penInfo[pz.id] = p;
             if (!firstLoadRef.current && flowStep === 'app') { 
                 if (!(prevCocinandoData.current[pz.id]) && pz.cocinando && p) { sendNotification(pz.tipo === 'pizza' ? "¡Al Horno!" : "¡En Marcha!", `Tu ${pz.nombre} está ${getCookingText(pz.tipo, 'ing')}.`); }
                 if (prevCocinandoData.current[pz.id] && !pz.cocinando && (prevPendingPerPizzaRef.current[pz.id] > 0)) { mostrarMensaje(`¡Tu ${pz.nombre} ESTÁ LISTA!`, 'exito'); sendNotification(`¡${pz.nombre} Lista!`, `¡Ya está ${getCookingText(pz.tipo, 'ed')}!`, `/?rate=${pz.id}`); }
             } 
             prevCocinandoData.current[pz.id] = pz.cocinando; prevComidosPerPizza.current[pz.id] = c; prevPendingPerPizzaRef.current[pz.id] = p;
        });
        setMiHistorial(res); if (firstLoadRef.current) firstLoadRef.current = false;
      }
    }
    setCargando(false);
  }, [nombreInvitado, flowStep, t]); 
  useEffect(() => { fetchDatos(); const c = supabase.channel('app-realtime').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchDatos()).subscribe(); return () => { supabase.removeChannel(c); }; }, [fetchDatos]);

  // --- CHECK DE SEGURIDAD (PASS UPDATE) ---
  useEffect(() => {
    const checkSecurity = supabase.channel('security-check')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'configuracion_dia' }, (payload: any) => {
            const newPass = payload.new.password_invitados;
            const storedPass = localStorage.getItem('vito-guest-pass-val');
            if (newPass && newPass !== '' && newPass !== storedPass) {
                alert("La contraseña de acceso ha cambiado. Por favor ingresa nuevamente.");
                setFlowStep('password'); setGuestPassInput(''); setDbPass(newPass);
            }
        }).subscribe();
    return () => { supabase.removeChannel(checkSecurity); };
  }, []);

  // --- MEMOS ---
  const activeCategories: string[] = useMemo(() => { try { const parsed = JSON.parse(config.categoria_activa); if (parsed === 'Todas' || (Array.isArray(parsed) && parsed.length === 0)) return []; return Array.isArray(parsed) ? parsed : ['General']; } catch { return ['General']; } }, [config.categoria_activa]);

  const enrichedPizzas = useMemo(() => { const globalAvg = allRatings.length > 0 ? (allRatings.reduce((a, r) => a + r.rating, 0) / allRatings.length) : 0; return pizzas.map(pizza => { const target = pizza.porciones_individuales || config.porciones_por_pizza; const pen = pedidos.filter(p => p.pizza_id === pizza.id && p.estado !== 'entregado').reduce((a, c) => a + c.cantidad_porciones, 0); const totalPotentialStock = (pizza.stock || 0) * target; const stockRestante = Math.max(0, totalPotentialStock - pen); const rats = allRatings.filter(r => r.pizza_id === pizza.id); const avg = rats.length > 0 ? (rats.reduce((a, b) => a + b.rating, 0) / rats.length).toFixed(1) : null; const sortR = rats.length > 0 ? (rats.reduce((a, b) => a + b.rating, 0) / rats.length) : globalAvg; const countRating = rats.length; let displayName = pizza.nombre; let displayDesc = pizza.descripcion; if (lang !== 'es' && autoTranslations[pizza.id] && autoTranslations[pizza.id][lang]) { displayName = autoTranslations[pizza.id][lang].name; displayDesc = autoTranslations[pizza.id][lang].desc; } return { ...pizza, displayName, displayDesc, stockRestante, target, ocupadasActual: pen % target, faltanParaCompletar: target - (pen % target), avgRating: avg, countRating: countRating, sortRating: sortR, totalPendientes: pen }; }); }, [pizzas, pedidos, config, allRatings, lang, autoTranslations]);

  const summaryData = useMemo(() => { if(!summarySheet) return []; return enrichedPizzas.filter(p => { const h = miHistorial[p.id]; if(!h) return false; if(summarySheet === 'wait') return h.pendientes > 0 && !p.cocinando; if(summarySheet === 'oven') return h.pendientes > 0 && p.cocinando; if(summarySheet === 'ready') return h.comidos > 0; if(summarySheet === 'total') return h.pendientes > 0; return false; }).map(p => { const h = miHistorial[p.id]; let count = 0; if(summarySheet === 'wait') count = h.pendientes; else if(summarySheet === 'oven') count = h.pendientes; else if(summarySheet === 'ready') count = h.comidos; else count = h.pendientes; return { ...p, count }; }); }, [summarySheet, enrichedPizzas, miHistorial]); 
  const mySummary = useMemo(() => { let t = 0, w = 0, o = 0, r = 0; pizzas.forEach(p => { const h = miHistorial[p.id]; if(h) { const pen = h.pendientes; if (pen > 0) { if (p.cocinando) o += pen; else w += pen; } r += h.comidos; t += pen; } }); return { total: t, wait: w, oven: o, ready: r }; }, [miHistorial, pizzas]);
  const currentBannerText = useMemo(() => { if (cargando) return t.loading; const msgs = [`${invitadosActivos} ${t.status}`]; const pData = pizzas.map(p => { const vals = allRatings.filter(v => v.pizza_id === p.id); const avg = vals.length > 0 ? vals.reduce((a, b) => a + b.rating, 0) / vals.length : 0; const totS = (p.stock || 0) * (p.porciones_individuales || config.porciones_por_pizza); const us = pedidos.filter(ped => ped.pizza_id === p.id).reduce((a, c) => a + c.cantidad_porciones, 0); let dName = p.nombre; if (lang !== 'es' && autoTranslations[p.id] && autoTranslations[p.id][lang]) { dName = autoTranslations[p.id][lang].name; } return { ...p, displayName: dName, stock: Math.max(0, totS - us), avg, count: vals.length }; }); pData.forEach(p => { if (p.stock === 0) msgs.push(`${p.displayName}: ${t.soldOut} 😭`); else if (p.stock <= 5) msgs.push(`${t.only} ${p.stock} ${t.of} ${p.displayName}! 🏃`); }); const best = [...pData].sort((a,b) => b.avg - a.avg)[0]; if (best && best.avg >= 4.5 && best.count > 1) msgs.push(`${t.topRated} ${best.displayName} (${best.avg.toFixed(1)}★)`); const pop = pData.filter(p => p.avg > 4.7 && p.count > 2); pop.forEach(p => msgs.push(`${t.hotPick} ${p.displayName}!`)); return msgs[bannerIndex % msgs.length]; }, [invitadosActivos, pizzas, pedidos, bannerIndex, cargando, t, config, allRatings, lang, autoTranslations]);

  // --- EFECTOS USANDO VARIABLES YA DECLARADAS ---
  useEffect(() => {
    if (enrichedPizzas.length === 0) return;
    let lista = [...enrichedPizzas];
    if (activeCategories.length > 0 && !activeCategories.includes('Todas')) { lista = lista.filter(p => activeCategories.includes(p.categoria || 'General')); }
    if (filter !== 'all') { lista = lista.filter(p => { if (filter === 'top') return p.avgRating && parseFloat(p.avgRating) >= 4.5; if (filter === 'to_rate') return miHistorial[p.id]?.comidos > 0 && !misValoraciones.includes(p.id); if (filter === 'ordered') return (miHistorial[p.id]?.pendientes > 0 || miHistorial[p.id]?.comidos > 0); if (filter === 'new') return (!miHistorial[p.id]?.pendientes && !miHistorial[p.id]?.comidos); if (filter === 'stock') return p.stockRestante > 0; return true; }); }
    lista.sort((a, b) => { const aReady = !a.cocinando && a.totalPendientes >= a.target; const bReady = !b.cocinando && b.totalPendientes >= b.target; if (aReady && !bReady) return -1; if (!aReady && bReady) return 1; if (a.cocinando && !b.cocinando) return -1; if (!a.cocinando && b.cocinando) return 1; const aStock = a.stockRestante > 0; const bStock = b.stockRestante > 0; if (aStock && !bStock) return -1; if (!aStock && bStock) return 1; if (orden === 'ranking') return b.sortRating - a.sortRating; if (orden === 'nombre') return a.displayName.localeCompare(b.displayName); const aActive = a.ocupadasActual; const bActive = b.ocupadasActual; if (aActive !== bActive) return bActive - aActive; return a.displayName.localeCompare(b.displayName); });
    setOrderedIds(lista.map(p => p.id));
  }, [orden, filter, pizzas.length, JSON.stringify(pizzas.map(p => ({ id: p.id, cocinando: p.cocinando, stock: p.stock }))), JSON.stringify(activeCategories)]);

  useEffect(() => { const params = new URLSearchParams(window.location.search); const rateId = params.get('rate'); if (rateId && enrichedPizzas.length > 0) { const pizza = enrichedPizzas.find(p => p.id === rateId) || pizzas.find(p => p.id === rateId); if (pizza) { openRating(pizza); const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname; window.history.replaceState({ path: newUrl }, '', newUrl); } } }, [enrichedPizzas]); 
  
  useEffect(() => { if(!nombreInvitado || !pizzas.length) return; const storedQueue = localStorage.getItem('vito-review-queue'); let queue: { id: string, pizzaId: string, triggerAt: number }[] = storedQueue ? JSON.parse(storedQueue) : []; let queueChanged = false; const delivered = pedidos.filter(p => p.invitado_nombre === nombreInvitado && p.estado === 'entregado'); delivered.forEach(p => { if (misValoraciones.includes(p.pizza_id)) return; if (queue.find(q => q.id === p.id)) return; if (processedOrderIds.current.has(p.id)) return; processedOrderIds.current.add(p.id); if (!firstLoadRef.current) { const delayMins = config.tiempo_recordatorio_minutos || 10; const triggerTime = Date.now() + (delayMins * 60000); queue.push({ id: p.id, pizzaId: p.pizza_id, triggerAt: triggerTime }); queueChanged = true; } }); if (queueChanged) localStorage.setItem('vito-review-queue', JSON.stringify(queue)); const checker = setInterval(() => { const currentQueueStr = localStorage.getItem('vito-review-queue'); if (!currentQueueStr) return; let currentQueue = JSON.parse(currentQueueStr); const now = Date.now(); const toNotify: any[] = []; const remaining: any[] = []; currentQueue.forEach((item: any) => { if (misValoraciones.includes(item.pizzaId)) return; if (now >= item.triggerAt) toNotify.push(item); else remaining.push(item); }); if (toNotify.length > 0) { const item = toNotify[0]; const pz = enrichedPizzas.find(z => z.id === item.pizzaId) || pizzas.find(z => z.id === item.pizzaId); if (pz) { const delay = config.tiempo_recordatorio_minutos || 10; const nameToShow = pz.displayName || pz.nombre; sendNotification(t.rateQuestion + " " + nameToShow + "?", `${t.ateTimeAgo} ${delay} ${t.minAgo}`, `/?rate=${pz.id}`); setLateRatingPizza(pz); setShowLateRatingModal(true); } localStorage.setItem('vito-review-queue', JSON.stringify(remaining)); } }, 10000); return () => clearInterval(checker); }, [pedidos, nombreInvitado, pizzas, enrichedPizzas, misValoraciones, config]);

  // --- ACTIONS ---
  const openRating = (p: any) => { setPizzaToRate(p); setRatingValue(0); setCommentValue(''); setShowRatingModal(true); };
  const submitRating = async () => { if (ratingValue === 0) return; await supabase.from('valoraciones').insert([{ pizza_id: pizzaToRate.id, invitado_nombre: nombreInvitado, rating: ratingValue, comentario: commentValue }]); setMisValoraciones(prev => [...prev, pizzaToRate.id]); const storedQueue = localStorage.getItem('vito-review-queue'); if (storedQueue) { const queue = JSON.parse(storedQueue); const newQueue = queue.filter((item: any) => item.pizzaId !== pizzaToRate.id); localStorage.setItem('vito-review-queue', JSON.stringify(newQueue)); } setShowRatingModal(false); setShowLateRatingModal(false); fetchDatos(); };
  async function modificarPedido(p: any, acc: 'sumar' | 'restar') { if (!nombreInvitado.trim()) { alert(t.errorName); return; } if (usuarioBloqueado) { alert(`${t.blocked}: ${motivoBloqueo || ''}`); return; } if (acc === 'sumar') { if (p.stockRestante <= 0) { alert("Sin stock :("); return; } setOrderToConfirm(p); } else { if (p.cocinando) { mostrarMensaje(`🔥 ¡Ya está ${getCookingText(p.tipo)}! No se puede cancelar.`, 'alerta'); return; } const pending = pedidos.filter(pd => pd.pizza_id === p.id && pd.invitado_nombre.toLowerCase() === nombreInvitado.toLowerCase().trim() && pd.estado === 'pendiente'); if (pending.length > 0) { const toDelete = pending[0]; const newPedidos = pedidos.filter(x => x.id !== toDelete.id); setPedidos(newPedidos); mostrarMensaje(`${t.successCancel} ${p.displayName}`, 'info'); await supabase.from('pedidos').delete().eq('id', toDelete.id); fetchDatos(); } } }
  const proceedWithOrder = async () => { if(!orderToConfirm) return; const newOrder = { id: `temp-${Date.now()}`, invitado_nombre: nombreInvitado, pizza_id: orderToConfirm.id, cantidad_porciones: 1, estado: 'pendiente', created_at: new Date().toISOString() }; setPedidos(prev => [...prev, newOrder]); setOrderToConfirm(null); mostrarMensaje(`${t.successOrder} ${orderToConfirm.displayName}!`, 'exito'); const { error } = await supabase.from('pedidos').insert([{ invitado_nombre: nombreInvitado, pizza_id: orderToConfirm.id, cantidad_porciones: 1, estado: 'pendiente' }]); if (error) { setPedidos(prev => prev.filter(p => p.id !== newOrder.id)); alert("Error al pedir. Intenta de nuevo."); } else { fetchDatos(); } }

  const base = isDarkMode ? { bg: "bg-neutral-950", text: "text-white", subtext: "text-neutral-500", card: "bg-neutral-900 border-neutral-800", innerCard: "bg-white/5 border border-white/5 text-neutral-300", input: "bg-transparent text-white placeholder-neutral-600", inputContainer: "bg-neutral-900 border-neutral-800", buttonSec: "bg-black/20 text-white hover:bg-black/40 border-white/10", progressBg: "bg-black/40 border-white/5", progressTrack: "bg-neutral-800 border-black/50", badge: "bg-white/10 text-white border border-white/10", activeChip: "bg-white text-black font-bold", inactiveChip: "bg-neutral-900 text-neutral-400 border border-neutral-800", bar: "bg-neutral-900/50 backdrop-blur-md border-white/10 shadow-lg text-white border" } : { bg: "bg-gray-50", text: "text-gray-900", subtext: "text-gray-500", card: "bg-white border-gray-200 shadow-md", innerCard: "bg-neutral-100 border border-transparent text-gray-600", input: "bg-transparent text-gray-900 placeholder-gray-400", inputContainer: "bg-white border-gray-200 shadow-sm", buttonSec: "bg-gray-200 text-gray-600 hover:text-black border-gray-300", progressBg: "bg-gray-100 border-gray-200", progressTrack: "bg-gray-300 border-white/50", badge: "bg-black/5 text-gray-700 border border-black/5", activeChip: "bg-black text-white font-bold", inactiveChip: "bg-white text-gray-500 border border-gray-200", bar: "bg-white/50 backdrop-blur-md border-gray-300 shadow-lg text-gray-900 border" };

  if (loadingConfig || flowStep === 'loading') {
      return (<div className={`min-h-screen flex items-center justify-center p-4 ${base.bg}`}><div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-white' : 'border-black'}`}></div></div>);
  }

  // 1. LANDING PAGE
  if (flowStep === 'landing') {
      return (
          <div className={`min-h-screen flex flex-col items-center justify-center p-6 font-sans ${base.bg}`}>
              <div className="absolute top-6 right-6 z-50">
                  <button onClick={rotarIdioma} className="bg-neutral-100 p-2 rounded-full font-bold text-xs shadow-sm border flex items-center gap-2">
                      <Languages size={14}/> {lang.toUpperCase()}
                  </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm relative z-10">
                  <img src="/logo.png" alt="Logo" className="h-64 w-auto object-contain mb-8 drop-shadow-2xl animate-in fade-in zoom-in duration-700" />
                  
                  <p className={`text-xl font-medium opacity-80 text-center mb-12 ${base.text}`}>
                      {landingTexts[lang].sub}
                  </p>

                  <button 
                      onClick={() => setFlowStep('name')}
                      className={`w-full py-5 rounded-2xl text-xl font-bold shadow-2xl transition-transform active:scale-95 flex items-center justify-center gap-3 ${currentTheme.color} text-white`}
                  >
                      <Crown size={24} /> {landingTexts[lang].btn}
                  </button>

                  <Link href="/admin" className={`mt-8 text-sm font-bold opacity-40 hover:opacity-100 flex items-center gap-2 transition-opacity ${base.text}`}>
                      <Shield size={14} /> {landingTexts[lang].admin}
                  </Link>
              </div>
          </div>
      );
  }

  // 2. NAME INPUT
  if (flowStep === 'name') {
      return (
          <div className={`min-h-screen flex items-center justify-center p-4 ${base.bg}`}>
              <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${base.card} animate-in fade-in slide-in-from-bottom-10`}>
                  <h2 className={`text-2xl font-bold mb-6 text-center ${base.text}`}>Empecemos, ¿cuál es tu nombre?</h2>
                  <input 
                      type="text" 
                      value={nombreInvitado} 
                      onChange={e => setNombreInvitado(e.target.value)} 
                      placeholder="Tu nombre..." 
                      className={`w-full p-4 rounded-xl border outline-none text-lg text-center mb-4 ${base.inputContainer} ${base.text}`} 
                      autoFocus
                  />
                  <button onClick={handleNameSubmit} className={`w-full py-4 rounded-xl font-bold ${currentTheme.color} text-white shadow-lg`}>
                      Continuar <ArrowRight className="inline ml-2"/>
                  </button>
                  <button onClick={() => setFlowStep('landing')} className={`w-full py-3 mt-2 text-sm opacity-50 ${base.text}`}>Volver</button>
              </div>
          </div>
      );
  }

  // 3. PASSWORD INPUT
  if (flowStep === 'password') {
      return (
          <div className={`min-h-screen flex items-center justify-center p-4 ${base.bg}`}>
              <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${base.card} animate-in fade-in slide-in-from-bottom-10`}>
                  <h2 className={`text-xl font-bold mb-6 text-center ${base.text}`}>{t.enterPass}</h2>
                  <div className="relative mb-4">
                      <input 
                          type={showPassword ? "text" : "password"} 
                          value={guestPassInput} 
                          onChange={e => setGuestPassInput(e.target.value)} 
                          className={`w-full p-4 rounded-xl border outline-none text-center text-lg tracking-widest ${base.inputContainer} ${base.text}`} 
                          placeholder="****" 
                          autoFocus
                      />
                      <button 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-4 top-4 opacity-50"
                      >
                          {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                  </div>
                  <button onClick={handlePasswordSubmit} className={`w-full py-4 rounded-xl font-bold ${currentTheme.color} text-white shadow-lg`}>
                      Ingresar
                  </button>
                  <button onClick={() => setFlowStep('name')} className={`w-full py-3 mt-2 text-sm opacity-50 ${base.text}`}>Volver</button>
              </div>
          </div>
      );
  }

  // 4. ONBOARDING
  if (flowStep === 'onboarding') {
      return (
          <OnboardingOverlay 
            show={true} 
            step={onboardingStep} 
            setStep={setOnboardingStep} 
            complete={completeOnboarding} 
            rotarIdioma={rotarIdioma} 
            lang={lang} 
            t={t}
            userName={nombreInvitado}
          />
      );
  }

  // 5. MAIN APP
  return (
    <div className={`min-h-screen font-sans pb-28 transition-colors duration-500 overflow-x-hidden ${base.bg}`}>
      
      <TopBar 
        base={base} notifEnabled={notifEnabled} toggleNotificaciones={toggleNotificaciones} 
        rotarIdioma={rotarIdioma} lang={lang} onlineUsers={onlineUsers} config={config} 
        isDarkMode={isDarkMode} getBtnClass={getBtnClass} cycleTextSize={cycleTextSize} 
        orden={orden} toggleOrden={toggleOrden} isCompact={isCompact} toggleCompact={toggleCompact} 
        toggleDarkMode={toggleDarkMode} showThemeSelector={showThemeSelector} setShowThemeSelector={setShowThemeSelector} 
        THEMES={THEMES} changeTheme={changeTheme} isInstallable={isInstallable} handleInstallClick={handleInstallClick}
      />

      <div className={`w-full p-6 pb-6 rounded-b-[40px] bg-gradient-to-br ${currentTheme.gradient} shadow-2xl relative overflow-hidden`}>
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mt-20 -mr-20 blur-3xl"></div>
         <div className="relative z-10 pt-16">
             <div className="mb-6">
                 {(() => {
                     const msg = getWelcomeMessage();
                     if (msg) {
                         const parts = msg.split('\n');
                         return (
                             <h1 className="text-3xl font-bold leading-tight drop-shadow-md text-white whitespace-pre-wrap">
                                 {parts[0]}
                                 {parts.length > 1 && (
                                     <>
                                         <br/>
                                         <span className="opacity-80 font-normal text-xl">{parts.slice(1).join('\n')}</span>
                                     </>
                                 )}
                             </h1>
                         );
                     } else {
                         return (
                             <>
                                 <h1 className="text-3xl font-bold leading-tight drop-shadow-md text-white">
                                     Bienvenido, <br/> 
                                     <span className="text-4xl">{nombreInvitado}</span>
                                 </h1>
                                 <p className="mt-2 text-lg text-white/80 font-medium">Disfruta de la mejor comida 🍕🍔</p>
                             </>
                         );
                     }
                 })()}
             </div>

             <div className="flex items-center gap-3 text-sm font-medium bg-black/30 p-3 rounded-2xl w-max backdrop-blur-md border border-white/10 text-white animate-in fade-in duration-500 mx-auto mb-4"><span className="text-neutral-300 text-xs font-bold">{currentBannerText}</span></div>
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-2">
                 {['all','stock','top','to_rate','ordered','new'].map(f => (
                     <button key={f} onClick={() => changeFilter(f as any)} className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${filter === f ? base.activeChip : base.inactiveChip}`}>{f === 'all' ? t.fAll : f === 'stock' ? t.fStock : f === 'top' ? t.fTop : f === 'to_rate' ? t.fRate : f === 'ordered' ? t.fOrdered : t.fNew}</button>
                 ))}
             </div>
         </div>
      </div>

      <div className="px-4 mt-6 relative z-20 max-w-lg mx-auto pb-20">
        
        {mensaje && (<div className={`fixed top-20 left-4 right-4 p-3 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[100] flex flex-col items-center justify-center animate-bounce-in text-center ${mensaje.tipo === 'alerta' ? 'border-4 border-neutral-900 font-bold' : 'border-2 border-neutral-200 font-bold'} bg-white text-black`}><div className="flex items-center gap-2 mb-1 text-sm">{mensaje.texto}</div>{mensaje.tipo === 'alerta' && (<button onClick={() => setMensaje(null)} className="mt-1 bg-neutral-900 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg active:scale-95 hover:bg-black transition-transform">{t.okBtn}</button>)}</div>)}
        {imageToView && (<div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setImageToView(null)}><button onClick={() => setImageToView(null)} className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full"><X size={24}/></button><img src={imageToView} alt="Zoom" className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl" /></div>)}

        {orderToConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                <div className={`${base.card} w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative border`}>
                    <h3 className={`text-2xl font-black mb-1 ${base.text}`}>{t.confTitle}</h3>
                    <p className={`text-lg font-medium mb-4 ${currentTheme.text}`}>{orderToConfirm.displayName}</p>
                    <div className={`${base.innerCard} rounded-2xl p-4 mb-6`}><p className={`text-sm leading-relaxed mb-3 ${base.subtext}`}>{orderToConfirm.tipo === 'pizza' ? t.confPizzaDesc : t.confUnitDesc}</p><div className="flex items-center gap-2 font-bold text-sm"><Clock size={18} className={isDarkMode ? 'text-white' : 'text-black'}/><span className={base.text}>{t.confTime} {formatTime(orderToConfirm.tiempo_coccion || 60)}</span></div></div>
                    <div className="flex gap-3"><button onClick={() => setOrderToConfirm(null)} className={`flex-1 py-3 rounded-xl font-bold border ${base.subtext}`}>{t.cancelBtn}</button><button onClick={proceedWithOrder} className={`flex-1 py-3 rounded-xl font-bold shadow-lg ${currentTheme.color} text-white`}>{t.confBtn}</button></div>
                </div>
            </div>
        )}

        {showRatingModal && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"><div className={`${base.card} p-6 rounded-3xl w-full max-w-sm relative shadow-2xl border`}><button onClick={() => setShowRatingModal(false)} className={`absolute top-4 right-4 ${base.subtext} hover:${base.text}`}><X /></button><h3 className={`text-xl font-bold mb-1 ${base.text}`}>{t.rateTitle} {pizzaToRate?.displayName || pizzaToRate?.nombre}</h3><div className="flex justify-center gap-2 mb-6 mt-4">{[1, 2, 3, 4, 5].map(star => (<button key={star} onClick={() => setRatingValue(star)} className="transition-transform hover:scale-110"><Star size={32} fill={star <= ratingValue ? "#eab308" : "transparent"} className={star <= ratingValue ? "text-yellow-500" : "text-neutral-600"} /></button>))}</div><textarea className={`w-full p-3 rounded-xl border outline-none mb-4 resize-none h-24 ${base.input} ${isDarkMode ? 'border-neutral-700 bg-black/50' : 'border-gray-200 bg-gray-50'}`} placeholder="..." value={commentValue} onChange={e => setCommentValue(e.target.value)} /><button onClick={submitRating} disabled={ratingValue === 0} className={`w-full py-3 rounded-xl font-bold shadow-lg ${ratingValue > 0 ? `${currentTheme.color} text-white` : 'bg-neutral-800 text-neutral-500'}`}>{t.sendReview}</button></div></div>)}
        {showLateRatingModal && lateRatingPizza && (<div className="fixed top-24 left-4 right-4 z-[100] animate-bounce-in"><div className={`${base.card} p-4 rounded-2xl shadow-2xl border border-yellow-500/50 flex items-center justify-between gap-3`}><div className="flex items-center gap-3"><div className="bg-yellow-500 p-2 rounded-xl text-black"><Star size={20} fill="black"/></div><div><p className={`text-sm font-bold ${base.text}`}>{t.rateQuestion} {lateRatingPizza.displayName || lateRatingPizza.nombre}?</p><p className={`text-[10px] ${base.subtext}`}>{t.ateTimeAgo} {config.tiempo_recordatorio_minutos || 10} {t.minAgo}</p></div></div><div className="flex gap-2"><button onClick={() => { setShowLateRatingModal(false); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${base.subtext}`}>{t.notNow}</button><button onClick={() => { setShowLateRatingModal(false); openRating(lateRatingPizza); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500 text-black shadow-lg`}>{t.yes}</button></div></div></div>)}

        <BottomSheet summarySheet={summarySheet} setSummarySheet={setSummarySheet} base={base} isDarkMode={isDarkMode} currentTheme={currentTheme} mySummary={mySummary} t={t} summaryData={summaryData} modificarPedido={modificarPedido} />

        <div className="space-y-3 pb-4">
           {cargando ? <p className={`text-center ${base.subtext} mt-10 animate-pulse`}>{t.loading}</p> : 
             orderedIds.length === 0 ? (<div className="text-center py-10 opacity-60"><p className="text-4xl mb-2">👻</p><p className={`text-sm font-bold ${base.subtext}`}>{getEmptyStateMessage()}</p></div>) :
             orderedIds.map(id => {
               const pizza = enrichedPizzas.find(p => p.id === id);
               if (!pizza) return null;
               return (<FoodCard key={pizza.id} pizza={pizza} base={base} isCompact={isCompact} isDarkMode={isDarkMode} currentTheme={currentTheme} zoomLevel={zoomLevel} t={t} DESC_SIZES={DESC_SIZES} STOCK_SIZES={STOCK_SIZES} setImageToView={setImageToView} miHistorial={miHistorial} misValoraciones={misValoraciones} openRating={openRating} modificarPedido={modificarPedido} />);
           })}
        </div>
      </div>
    </div>
  );
}
