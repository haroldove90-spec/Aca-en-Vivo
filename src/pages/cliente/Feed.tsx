import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { HotelCard } from '../../components/HotelCard';
import { Loader2 } from 'lucide-react';
import { useRealtimeAvailability } from '../../hooks/useRealtimeAvailability';

function HotelCardWithRealtime({ hotel }: { hotel: any, key?: any }) {
  const { disponibles } = useRealtimeAvailability(hotel.id);
  
  return (
    <HotelCard
      nombre={hotel.nombre}
      zona={hotel.zona as 'Diamante' | 'Dorada' | 'Tradicional'}
      estrellas={hotel.estrellas}
      disponibles={disponibles ?? 0}
      onReservaRapida={() => alert(`Iniciando reserva para ${hotel.nombre}`)}
    />
  );
}

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#00A8CC] tracking-tighter">AcaEnVivo</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acapulco en tiempo real</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#00A8CC]/20 flex items-center justify-center border border-[#00A8CC]/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="p-4 max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black text-[#142850] uppercase tracking-widest">Disponibilidad Hotelera</h2>
          <span className="text-[10px] bg-[#F2E1C1] text-[#142850] px-2 py-1 rounded font-black uppercase">
            {establecimientos.length} Hoteles
          </span>
        </div>

        <div className="grid gap-6">
          {establecimientos.map((hotel) => (
            <HotelCardWithRealtime key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </main>

      {/* Bottom Nav Placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 flex justify-around items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
        <button className="flex flex-col items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-[#00A8CC]" />
          <span className="text-[#00A8CC] font-black text-[10px] uppercase tracking-widest">Explorar</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-30">
          <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Negocios</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-30">
          <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

