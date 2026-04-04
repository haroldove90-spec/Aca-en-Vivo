import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Minus, AlertCircle, Loader2, Clock, Bell, BellOff, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function HotelDashboard() {
  const [inventario, setInventario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  
  const hotelId = "hotel-2"; // Mock ID for Hotel Emporio/Calinda context

  useEffect(() => {
    const docRef = doc(db, 'inventario_hotel', hotelId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setInventario(data);
        setOptimisticCount(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hotelId]);

  const handleUpdate = async (delta: number) => {
    if (!inventario) return;
    
    const current = optimisticCount ?? inventario.disponibles_ahora;
    const next = Math.max(0, Math.min(inventario.habitaciones_totales, current + delta));
    
    setOptimisticCount(next);

    try {
      await updateDoc(doc(db, 'inventario_hotel', hotelId), {
        disponibles_ahora: next,
        ultima_actualizacion: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating inventory:", error);
      setOptimisticCount(null);
    }
  };

  const handleQuickAction = async (value: number) => {
    if (!inventario) return;
    setOptimisticCount(value);
    try {
      await updateDoc(doc(db, 'inventario_hotel', hotelId), {
        disponibles_ahora: value,
        ultima_actualizacion: serverTimestamp(),
      });
    } catch (error) {
      setOptimisticCount(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#142850]">
        <Loader2 className="w-12 h-12 text-[#00A8CC] animate-spin" />
      </div>
    );
  }

  const displayCount = optimisticCount ?? inventario?.disponibles_ahora ?? 0;
  
  // Dynamic Background Color Logic
  const getBgColor = () => {
    if (displayCount > 5) return "bg-emerald-500";
    if (displayCount > 0) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getTimeAgo = () => {
    if (!inventario?.ultima_actualizacion) return "Recién iniciado";
    const date = inventario.ultima_actualizacion.toDate();
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (diff < 1) return "hace unos segundos";
    return `hace ${diff} minutos`;
  };

  return (
    <motion.div 
      initial={false}
      animate={{ backgroundColor: displayCount > 5 ? '#10b981' : displayCount > 0 ? '#f59e0b' : '#f43f5e' }}
      className="min-h-screen flex flex-col items-center justify-between p-6 text-white font-sans transition-colors duration-500"
    >
      {/* Header Info */}
      <header className="w-full max-w-md text-center pt-4">
        <h1 className="text-2xl font-black tracking-tighter uppercase drop-shadow-md">
          Hotel Calinda Acapulco
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1 opacity-80">
          <Clock className="w-3 h-3" />
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Última actualización: {getTimeAgo()}
          </p>
        </div>
      </header>

      {/* Main Hero Counter */}
      <main className="flex flex-col items-center justify-center w-full max-w-md space-y-8">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">Habitaciones Disponibles</p>
          <AnimatePresence mode="wait">
            <motion.div 
              key={displayCount}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="text-[14rem] font-black leading-none tabular-nums drop-shadow-2xl"
            >
              {displayCount}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Remote Control Buttons */}
        <div className="flex items-center justify-center gap-10 w-full">
          <button
            onClick={() => handleUpdate(-1)}
            disabled={displayCount <= 0}
            className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-lg border-4 border-white/30 flex items-center justify-center active:scale-90 transition-all shadow-2xl disabled:opacity-20"
          >
            <Minus className="w-12 h-12 stroke-[4]" />
          </button>

          <button
            onClick={() => handleUpdate(1)}
            disabled={displayCount >= (inventario?.habitaciones_totales ?? 99)}
            className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-lg border-4 border-white/30 flex items-center justify-center active:scale-90 transition-all shadow-2xl"
          >
            <Plus className="w-12 h-12 stroke-[4]" />
          </button>
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="w-full max-w-md space-y-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickAction(0)}
            className="py-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 flex items-center justify-center gap-2 active:scale-95 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <AlertCircle className="w-4 h-4 text-white" />
            Sold Out
          </button>
          <button
            onClick={() => handleQuickAction(inventario?.habitaciones_totales ?? 50)}
            className="py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center gap-2 active:scale-95 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <RotateCcw className="w-4 h-4 text-white" />
            Restablecer
          </button>
        </div>

        {/* Alerts Switch */}
        <div className="flex items-center justify-between p-4 bg-black/10 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            {alertsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4 opacity-50" />}
            <span className="text-[10px] font-black uppercase tracking-widest">Alertas de Reserva</span>
          </div>
          <button 
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={cn(
              "w-12 h-6 rounded-full transition-all relative",
              alertsEnabled ? "bg-white" : "bg-white/20"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 rounded-full transition-all",
              alertsEnabled ? "right-1 bg-emerald-500" : "left-1 bg-white/50"
            )} />
          </button>
        </div>
      </footer>
    </motion.div>
  );
}


