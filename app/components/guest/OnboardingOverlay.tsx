import { Languages, Download, LayoutTemplate, Flame, Palette, PartyPopper, ChevronRight, Check } from 'lucide-react';
import { useState, TouchEvent } from 'react';

export const OnboardingOverlay = ({ show, step, setStep, complete, rotarIdioma, lang, t, userName }: any) => {
    
    // --- Lógica de Swipe (Deslizar) ---
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            if (step < 3) setStep((prev: number) => prev + 1);
            else complete();
        }
        if (isRightSwipe) {
            if (step > 0) setStep((prev: number) => prev - 1);
        }
    };
    // ----------------------------------

    if (!show) return null;

    return (
        <div 
          className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center text-neutral-900 animate-in fade-in duration-500 select-none"
          onTouchStart={onTouchStart} // Eventos agregados
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
            <div className="absolute top-6 right-6">
                <button onClick={rotarIdioma} className="bg-neutral-100 p-2 rounded-full font-bold text-xs shadow-sm border flex items-center gap-2">
                    <Languages size={14}/> {lang.toUpperCase()}
                </button>
            </div>

            <div className="max-w-md w-full relative h-[70vh] flex flex-col justify-center">
                {step === 0 && (
                    <div className="flex flex-col items-center gap-6 animate-in slide-in-from-right-10 duration-500">
                        <img src="/logo.png" alt="Logo" className="h-40 w-auto object-contain drop-shadow-xl" />
                        
                        {/* TEXTOS MODIFICADOS SEGÚN PEDIDO */}
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-700">
                            Bienvenido, {userName}!
                        </h1>
                        <p className="text-neutral-500 text-lg leading-relaxed px-4">
                            Esta web te servirá para estar organizados, pidiendo y calificando en tiempo real.
                        </p>
                    </div>
                )}
                
                {step === 1 && (<div className="flex flex-col items-center gap-6 animate-in slide-in-from-right-10 duration-500"><div className="w-32 h-32 rounded-full bg-teal-50 flex items-center justify-center mb-2 shadow-inner"><Download size={64} className="text-teal-500 animate-bounce" strokeWidth={1.5} /></div><h1 className="text-3xl font-bold text-neutral-800">{t.onb_inst_title}</h1><p className="text-neutral-500 text-lg leading-relaxed px-4">{t.onb_inst_desc}</p></div>)}
                
                {step === 2 && (<div className="flex flex-col items-center gap-4 animate-in slide-in-from-right-10 duration-500 text-left w-full"><h1 className="text-3xl font-bold text-neutral-800 text-center w-full mb-2">{t.onb_how_title}</h1><div className="bg-white p-3 rounded-2xl flex items-center gap-4 w-full border border-neutral-100 shadow-sm"><div className="bg-teal-50 p-3 rounded-xl text-teal-600"><LayoutTemplate size={24}/></div><div className="flex-1"><p className="font-bold text-base text-neutral-800 mb-1">{t.feat_prog_title}</p><div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden"><div className="h-full w-1/2 bg-teal-500 rounded-full"></div></div><p className="text-sm text-neutral-500 mt-1">{t.feat_prog_desc}</p></div></div><div className="bg-white p-3 rounded-2xl flex items-center gap-4 w-full border border-neutral-100 shadow-sm"><div className="bg-orange-50 p-3 rounded-xl text-orange-600"><Flame size={24}/></div><div className="flex-1"><p className="font-bold text-base text-neutral-800 mb-1">{t.feat_oven_title}</p><span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">EN HORNO</span><p className="text-sm text-neutral-500 mt-1">{t.feat_oven_desc}</p></div></div><div className="bg-white p-3 rounded-2xl flex items-center gap-4 w-full border border-neutral-100 shadow-sm"><div className="bg-purple-50 p-3 rounded-xl text-purple-600"><Palette size={24}/></div><div className="flex-1"><p className="font-bold text-base text-neutral-800 mb-1">{t.feat_ctrl_title}</p><div className="flex gap-2 mb-1"><div className="w-4 h-4 rounded-full bg-neutral-200"></div><div className="w-4 h-4 rounded-full bg-neutral-200"></div><div className="w-4 h-4 rounded-full bg-neutral-200"></div></div><p className="text-sm text-neutral-500">{t.feat_ctrl_desc}</p></div></div></div>)}
                
                {step === 3 && (<div className="flex flex-col items-center gap-6 animate-in slide-in-from-right-10 duration-500"><div className="w-32 h-32 rounded-full bg-yellow-50 flex items-center justify-center mb-2 shadow-inner"><PartyPopper size={64} className="text-yellow-500" strokeWidth={1.5} /></div><h1 className="text-3xl font-bold text-neutral-800">{t.onb_enjoy_title}</h1><p className="text-neutral-500 text-lg leading-relaxed px-4">{t.onb_enjoy_desc}</p></div>)}
            </div>

            {/* NAVIGATION */}
            <div className="fixed bottom-10 left-0 right-0 flex flex-col items-center gap-6 px-8">
                <div className="flex gap-2">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'bg-teal-600 w-8' : 'bg-neutral-200 w-2'}`}></div>
                    ))}
                </div>
                <button 
                    onClick={() => {
                        if (step < 3) setStep((prev: number) => prev + 1);
                        else complete();
                    }}
                    className="bg-neutral-900 text-white w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
                >
                    {step === 3 ? t.onb_btn_start : t.onb_btn_next} {step < 3 ? <ChevronRight size={18} /> : <Check size={18}/>}
                </button>
            </div>
        </div>
    );
};
