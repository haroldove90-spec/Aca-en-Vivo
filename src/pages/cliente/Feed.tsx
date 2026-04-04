import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { HotelCard } from '../../components/HotelCard';
import { Loader2 } from 'lucide-react';

export default function ClienteFeed() {
  const [establecimientos, setEstablecimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'establecimientos'), orderBy('nombre'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEstablecimientos(ests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [inventario, setInventario] = useState<Record<string, number>>({});

  useEffect(() => {
    const q = collection(db, 'inventario_hotel');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inv: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        inv[doc.id] = doc.data().disponibles_ahora;
      });
      setInventario(inv);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#00A8CC] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-[#142850] text-white p-6 sticky top-0 z-10 shadow-md">
        <h1 className="text-2xl font-bold text-[#00A8CC]">AcaEnVivo</h1>
        <p className="text-xs text-gray-300">Disponibilidad en tiempo real - Acapulco</p>
      </header>

      {/* Feed */}
      <main className="p-4 max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#142850]">Hoteles Disponibles</h2>
          <span className="text-xs bg-[#F2E1C1] text-[#142850] px-2 py-1 rounded-full font-bold">
            {establecimientos.length} resultados
          </span>
        </div>

        <div className="grid gap-6">
          {establecimientos.map((hotel) => (
            <HotelCard
              key={hotel.id}
              nombre={hotel.nombre}
              zona={hotel.zona as 'Diamante' | 'Dorada' | 'Tradicional'}
              estrellas={hotel.estrellas}
              disponibles={inventario[hotel.id] ?? 0}
              onReservaRapida={() => alert(`Iniciando reserva para ${hotel.nombre}`)}
            />
          ))}
        </div>
      </main>

      {/* Bottom Nav Placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-around items-center shadow-lg">
        <button className="text-[#00A8CC] font-bold text-xs uppercase tracking-wider">Explorar</button>
        <button className="text-gray-400 font-bold text-xs uppercase tracking-wider">Negocios</button>
        <button className="text-gray-400 font-bold text-xs uppercase tracking-wider">Perfil</button>
      </nav>
    </div>
  );
}
