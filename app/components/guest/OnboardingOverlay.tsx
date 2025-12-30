import { ArrowRight, Check, Globe } from 'lucide-react';
import { useState, TouchEvent } from 'react';

export const OnboardingOverlay = ({ show, step, setStep, complete, rotarIdioma, lang, t, userName }: any) => {
    
    // Estados para el SWIPE (Deslizamiento)
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50; // Distancia mínima para considerar un swipe

    if (!show) return null;

    // Lógica de Swipe
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
            // Deslizar a la izquierda (Siguiente)
            if (step < 2) setStep(step + 1);
            else complete();
        }
        if (isRightSwipe) {
            // Deslizar a la derecha (Anterior)
            if (step > 0) setStep(step - 1);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Botón Idioma (Estilo Minimalista) */}
            <div className="absolute top-6 right-6 z-50">
                <button 
                    onClick={rotarIdioma} 
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 active:scale-95 transition-all"
                >
                    {lang === 'es' ? '🇪🇸' : lang === 'en' ? '🇺🇸' : '🇮🇹'}
                </button>
            </div>

            {/* Contenido */}
            <div className="w-full max-w-sm flex-1 flex flex-col justify-center relative">
                
                {/* Animación de entrada para cada paso */}
                <div key={step} className="animate-in fade-in slide-in-from-bottom-8 duration-500 flex flex-col items-center text-center">
                    
                    {/* Imagen / Icono */}
                    <div className="mb-8 relative">
                        <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-purple-500/20 to-orange-500/20 blur-3xl absolute inset-0 animate-pulse"></div>
                        {step === 0 && <img src="/logo.png" className="w-40 h-40 object-contain relative z-10 drop-shadow-2xl" alt="Welcome" />}
                        {step === 1 && <div className="text-8xl relative z-10">🍕</div>}
                        {step === 2 && <div className="text-8xl relative z-10">⭐</div>}
                    </div>

                    {/* Texto Dinámico */}
                    {step === 0 && (
                        <>
                            <h2 className="text-3xl font-bold mb-4">Bienvenido, {userName}! 👋</h2>
                            <p className="text-lg text-neutral-400 leading-relaxed">
                                Esta web te servirá para estar organizados, pidiendo y calificando en tiempo real.
                            </p>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <h2 className="text-3xl font-bold mb-4">{t.step1Title}</h2>
                            <p className="text-lg text-neutral-400 leading-relaxed">{t.step1Desc}</p>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2 className="text-3xl font-bold mb-4">{t.step2Title}</h2>
                            <p className="text-lg text-neutral-400 leading-relaxed">{t.step2Desc}</p>
                        </>
                    )}
                </div>
            </div>

            {/* Controles Inferiores */}
            <div className="w-full max-w-sm mt-8">
                <div className="flex justify-center gap-2 mb-8">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} />
                    ))}
                </div>

                <button 
                    onClick={() => step < 2 ? setStep(step + 1) : complete()}
                    className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    {step < 2 ? (
                        <>{t.nextBtn} <ArrowRight size={20}/></>
                    ) : (
                        <>{t.startBtn} <Check size={20}/></>
                    )}
                </button>
            </div>
        </div>
    );
};
