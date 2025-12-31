import { ArrowRight, Check } from 'lucide-react';
import { useState, TouchEvent } from 'react';

export const OnboardingOverlay = ({ show, step, setStep, complete, rotarIdioma, lang, t, userName }: any) => {
    
    // Estados para el SWIPE (Deslizamiento)
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50; 

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
            if (step < 2) setStep(step + 1);
            else complete();
        }
        if (isRightSwipe) {
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
            {/* Botón Idioma Minimalista (Banderita) */}
            <div className="absolute top-6 right-6 z-50">
                <button 
                    onClick={rotarIdioma} 
                    className="text-2xl opacity-80 hover:opacity-100 transition-opacity active:scale-95"
                >
                    {lang === 'es' ? '🇪🇸' : lang === 'en' ? '🇺🇸' : '🇮🇹'}
                </button>
            </div>

            {/* Contenido Central */}
            <div className="w-full max-w-sm flex-1 flex flex-col justify-center relative">
                
                {/* Paso 1: Bienvenida */}
                {step === 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 flex flex-col items-center text-center">
                        <div className="mb-8 relative">
                             {/* Efecto de luz de fondo */}
                            <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-purple-500/20 to-orange-500/20 blur-3xl absolute inset-0 animate-pulse m-auto"></div>
                            <img src="/logo.png" className="w-48 h-auto object-contain relative z-10 drop-shadow-2xl mx-auto" alt="Welcome" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Bienvenido, {userName}! 👋</h2>
                        <p className="text-lg text-neutral-400 leading-relaxed px-2">
                            Esta web te servirá para estar organizados, pidiendo y calificando en tiempo real.
                        </p>
                    </div>
                )}

                {/* Paso 2: Explicación Pedidos */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col items-center text-center">
                        <div className="mb-8 relative flex justify-center items-center h-48">
                            <div className="w-40 h-40 rounded-full bg-orange-500/10 blur-2xl absolute animate-pulse"></div>
                            <span className="text-9xl relative z-10 drop-shadow-xl">🍕</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">{t.step1Title}</h2>
                        <p className="text-lg text-neutral-400 leading-relaxed px-4">
                            {t.step1Desc}
                        </p>
                    </div>
                )}

                {/* Paso 3: Explicación Calificación */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col items-center text-center">
                        <div className="mb-8 relative flex justify-center items-center h-48">
                            <div className="w-40 h-40 rounded-full bg-yellow-500/10 blur-2xl absolute animate-pulse"></div>
                            <span className="text-9xl relative z-10 drop-shadow-xl">⭐</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">{t.step2Title}</h2>
                        <p className="text-lg text-neutral-400 leading-relaxed px-4">
                            {t.step2Desc}
                        </p>
                    </div>
                )}
            </div>

            {/* Controles Inferiores (Puntos y Botón) */}
            <div className="w-full max-w-sm mt-8 pb-8">
                {/* Indicadores de página */}
                <div className="flex justify-center gap-3 mb-8">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} />
                    ))}
                </div>

                <button 
                    onClick={() => step < 2 ? setStep(step + 1) : complete()}
                    className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-neutral-100"
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
