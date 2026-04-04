import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Minus, AlertCircle, Loader2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function HotelDashboard() {
  const [inventario, setInventario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
  
  const hotelId = "hotel-1"; // Mock ID

  useEffect(() => {
    const docRef = doc(db, 'inventario_hotel', hotelId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setInventario(data);
        // Reset optimistic count when real data arrives
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
    
    // 1. Optimistic Update (Instant UI feedback)
    setOptimisticCount(next);

    try {
      // 2. Firestore Update
      await updateDoc(doc(db, 'inventario_hotel', hotelId), {
        disponibles_ahora: next,
        ultima_actualizacion: serverTimestamp(),
      });

      // 3. Server Action (Backend sync)
      await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_establecimiento: hotelId, delta }),
      });
    } catch (error) {
      console.error("Error updating inventory:", error);
      setOptimisticCount(null); // Revert on error
    }
  };

  const handleMarkFull = async () => {
    if (!window.confirm("¿Confirmar que el hotel está LLENO?")) return;
    
    setOptimisticCount(0);
    try {
      await updateDoc(doc(db, 'inventario_hotel', hotelId), {
        disponibles_ahora: 0,
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

  return (
    <div className="min-h-screen bg-[#142850] flex flex-col items-center justify-between p-8 text-white font-sans">
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-[#00A8CC] tracking-tighter">AcaEnVivo</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Panel Hotelero v1.0</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <Clock className="w-3 h-3 text-[#00A8CC]" />
          <span className="text-[10px] font-bold text-gray-300">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </header>

      {/* Main Counter */}
      <main className="flex flex-col items-center justify-center space-y-12 w-full max-w-md">
        <div className="text-center space-y-4">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Disponibles Ahora</h2>
          <div className="relative">
            <div className={cn(
              "text-[12rem] font-black leading-none tabular-nums transition-all duration-300",
              displayCount > 5 ? "text-[#00A8CC]" : displayCount > 0 ? "text-yellow-400" : "text-red-500"
            )}>
              {displayCount}
            </div>
            {optimisticCount !== null && (
              <div className="absolute -top-4 -right-4 w-4 h-4 bg-[#00A8CC] rounded-full animate-ping" />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-8 w-full">
          <button
            onClick={() => handleUpdate(-1)}
            disabled={displayCount <= 0}
            className="h-32 rounded-3xl bg-red-500/10 border-4 border-red-500/20 flex items-center justify-center active:scale-90 transition-all hover:bg-red-500/20 disabled:opacity-20"
          >
            <Minus className="w-16 h-16 text-red-500 stroke-[3]" />
          </button>

          <button
            onClick={() => handleUpdate(1)}
            disabled={displayCount >= (inventario?.habitaciones_totales ?? 99)}
            className="h-32 rounded-3xl bg-[#00A8CC]/10 border-4 border-[#00A8CC]/20 flex items-center justify-center active:scale-90 transition-all hover:bg-[#00A8CC]/20"
          >
            <Plus className="w-16 h-16 text-[#00A8CC] stroke-[3]" />
          </button>
        </div>
      </main>

      {/* Panic Button */}
      <footer className="w-full max-w-md space-y-6">
        <button
          onClick={handleMarkFull}
          disabled={displayCount === 0}
          className="w-full py-6 rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-red-500/10 hover:border-red-500/30 group"
        >
          <AlertCircle className="w-6 h-6 text-red-500 group-hover:animate-pulse" />
          <span className="font-black text-sm uppercase tracking-widest">Marcar como Lleno</span>
        </button>
        
        <div className="text-center">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Acapulco, Guerrero • México
          </p>
        </div>
      </footer>
    </div>
  );
}


