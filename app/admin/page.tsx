'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  const [errorPass, setErrorPass] = useState('');
  
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ porciones_por_pizza: 8 });

  // Al cargar, intentamos traer datos SOLO si estamos autenticados
  useEffect(() => {
    if (autenticado) {
      cargarDatos();
      // Auto-refrescar pedidos cada 5 segundos
      const intervalo = setInterval(cargarDatos, 5000);
      return () => clearInterval(intervalo);
    }
  }, [autenticado]);

  const ingresar = async () => {
    setErrorPass('');
    // Verificamos password contra la base de datos
    const { data } = await supabase.from('configuracion_dia').select('password_admin').single();
    
    // Si la base de datos devuelve data y la pass coincide
    if (data && data.password_admin === password) {
      setAutenticado(true);
    } else {
      setErrorPass('Contraseña incorrecta');
    }
  };

  const salir = () => {
    setAutenticado(false);
    setPassword('');
    setPedidos([]);
  };

  const cargarDatos = async () => {
    const { data: dataConfig } = await supabase.from('configuracion_dia').select('*').single();
    if (dataConfig) setConfig(dataConfig);

    const { data: dataPizzas } = await supabase.from('menu_pizzas').select('*').eq('activa', true);
    if (dataPizzas) setPizzas(dataPizzas);

    // Traemos pedidos NO entregados
    const { data: dataPedidos } = await supabase.from('pedidos').select('*').neq('estado', 'entregado');
    if (dataPedidos) setPedidos(dataPedidos);
  };

  // --- LÓGICA MATEMÁTICA DEL PIZZAIOLO ---
  const calcularEstadoPizzas = () => {
    const porcionesPorPizza = config.porciones_por_pizza || 8;
    
    return pizzas.map(pizza => {
      // Filtramos pedidos de esta pizza
      const pedidosDeEsta = pedidos.filter(p => p.pizza_id === pizza.id);
      const totalPorciones = pedidosDeEsta.reduce((acc, curr) => acc + curr.cantidad_porciones, 0);
      
      const pizzasCompletas = Math.floor(totalPorciones / porcionesPorPizza);
      const porcionesRestantes = totalPorciones % porcionesPorPizza; // Lo que sobra para la siguiente (la barra)
      
      return {
        ...pizza,
        totalPorciones,
        pizzasCompletas,
        porcionesRestantes,
        porcentaje: (porcionesRestantes / porcionesPorPizza) * 100
      };
    });
  };

  const pizzasCalculadas = calcularEstadoPizzas();

  // --- VISTA LOGIN ---
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans">
        <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 w-full max-w-sm text-center shadow-2xl">
          <div className="text-4xl mb-4">👨‍🍳</div>
          <h1 className="text-2xl font-bold text-orange-500 mb-2">Acceso Cocina</h1>
          <p className="text-neutral-500 mb-6 text-sm">Solo para Vito</p>
          
          <input 
            type="password" 
            placeholder="Contraseña..." 
            className="w-full bg-black text-white p-4 rounded-lg mb-4 border border-neutral-700 focus:border-orange-500 outline-none text-center text-lg tracking-widest"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ingresar()}
          />
          
          {errorPass && <p className="text-red-500 text-sm mb-4">{errorPass}</p>}
          
          <button 
            onClick={ingresar} 
            className="w-full bg-orange-600 text-white font-bold py-4 rounded-lg hover:bg-orange-500 transition-colors"
          >
            ENTRAR
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA PANEL ---
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4 font-sans pb-20">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-neutral-800">
        <div>
           <h1 className="text-2xl font-bold text-orange-500">Panel de Cocina</h1>
           <p className="text-neutral-500 text-xs">Pizzas de {config.porciones_por_pizza} porciones</p>
        </div>
        <button onClick={salir} className="bg-neutral-800 px-4 py-2 rounded text-xs text-red-400 border border-neutral-700 hover:bg-neutral-700">
          Cerrar Sesión
        </button>
      </header>

      {/* PIZZAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pizzasCalculadas.map(pizza => (
          <div key={pizza.id} className={`p-6 rounded-2xl border transition-all ${pizza.pizzasCompletas > 0 ? 'bg-green-900/20 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]' : 'bg-neutral-800 border-neutral-700'}`}>
            
            <div className="flex justify-between items-start mb-4">
               <h2 className="text-xl font-bold">{pizza.nombre}</h2>
               {pizza.pizzasCompletas > 0 && <span className="text-2xl">🔔</span>}
            </div>
            
            {/* CAJA DE AVISO GRANDE */}
            {pizza.pizzasCompletas > 0 ? (
              <div className="bg-green-600 text-white p-6 rounded-xl mb-6 text-center animate-pulse">
                <span className="text-5xl font-black block mb-1">{pizza.pizzasCompletas}</span>
                <span className="text-sm font-bold uppercase tracking-wider opacity-90">Completas para hornear</span>
              </div>
            ) : (
              <div className="text-neutral-500 text-sm mb-6 bg-black/20 p-4 rounded-xl text-center">
                Faltan pedidos para completar una.
              </div>
            )}

            {/* BARRA DE PROGRESO */}
            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-2 uppercase font-bold tracking-wider">
                <span>En cola (Próxima)</span>
                <span>{pizza.porcionesRestantes} / {config.porciones_por_pizza}</span>
              </div>
              <div className="w-full bg-black h-3 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="bg-orange-500 h-full transition-all duration-500" 
                  style={{ width: `${pizza.porcentaje}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Configuración simple al pie */}
      <div className="fixed bottom-0 left-0 w-full bg-neutral-900 border-t border-neutral-800 p-4 flex justify-center gap-4 text-sm text-neutral-500">
        <span>Configuración:</span>
        <button className="hover:text-white" onClick={async () => {
             await supabase.from('configuracion_dia').update({ porciones_por_pizza: 8 }).eq('id', config.id);
             cargarDatos();
        }}>8p</button>
        <button className="hover:text-white" onClick={async () => {
             await supabase.from('configuracion_dia').update({ porciones_por_pizza: 6 }).eq('id', config.id);
             cargarDatos();
        }}>6p</button>
        <button className="hover:text-white" onClick={async () => {
             await supabase.from('configuracion_dia').update({ porciones_por_pizza: 4 }).eq('id', config.id);
             cargarDatos();
        }}>4p</button>
      </div>

    </div>
  );
}