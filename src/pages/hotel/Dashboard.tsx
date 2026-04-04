import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Minus, Loader2, Save } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function HotelDashboard() {
  const [inventario, setInventario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Mock hotel ID for this prototype
  const hotelId = "hotel-1";

  useEffect(() => {
    const docRef = doc(db, 'inventario_hotel', hotelId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setInventario(snapshot.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hotelId]);

  const updateInventory = async (delta: number) => {
    if (!inventario) return;
    setUpdating(true);
    
    const newDisponibles = Math.max(0, Math.min(inventario.habitaciones_totales, inventario.disponibles_ahora + delta));
    
    try {
      // Direct Firestore update (Client-side)
      await updateDoc(doc(db, 'inventario_hotel', hotelId), {
        disponibles_ahora: newDisponibles,
        ultima_actualizacion: serverTimestamp(),
      });

      // Simulating a Server Action call to the Express backend
      await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_establecimiento: hotelId, delta }),
      });

    } catch (error) {
      console.error("Error updating inventory:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#00A8CC] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[#142850]">Panel de Hotel</h1>
        <p className="text-sm text-gray-500">Gestiona tu disponibilidad en tiempo real</p>
      </header>

      <main className="max-w-md mx-auto space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Habitaciones Disponibles</h2>
            <div className="text-7xl font-black text-[#142850] tabular-nums">
              {inventario?.disponibles_ahora ?? 0}
            </div>
            <p className="text-xs text-gray-400">de {inventario?.habitaciones_totales ?? 0} totales</p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => updateInventory(-1)}
              disabled={updating || (inventario?.disponibles_ahora ?? 0) <= 0}
              className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
            >
              <Minus className="w-8 h-8" />
            </button>

            <button
              onClick={() => updateInventory(1)}
              disabled={updating || (inventario?.disponibles_ahora ?? 0) >= (inventario?.habitaciones_totales ?? 0)}
              className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>

          <div className="pt-4 border-t border-gray-50">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#00A8CC] uppercase">
              <Save className="w-4 h-4" />
              <span>Actualización Automática</span>
            </div>
          </div>
        </div>

        <div className="bg-[#142850] p-4 rounded-xl text-white flex items-center justify-between">
          <span className="text-sm font-medium">Estado del Semáforo:</span>
          <div className="flex items-center gap-2">
            <span className={cn("w-3 h-3 rounded-full", 
              (inventario?.disponibles_ahora ?? 0) > 5 ? "bg-green-500" : 
              (inventario?.disponibles_ahora ?? 0) > 0 ? "bg-yellow-500" : "bg-red-500"
            )} />
            <span className="text-sm font-bold uppercase">
              {(inventario?.disponibles_ahora ?? 0) > 5 ? "Disponible" : 
               (inventario?.disponibles_ahora ?? 0) > 0 ? "¡Últimas!" : "Lleno"}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
