import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Loader2, 
  Sparkles, 
  Search, 
  Mic, 
  Map as MapIcon, 
  Zap, 
  ChevronRight, 
  Star, 
  MapPin,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useRealtimeAvailability } from '../../hooks/useRealtimeAvailability';
import { AIChatSearch } from '../../components/AIChatSearch';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

// --- Compact Hotel Card for Horizontal Scroll ---
function CompactHotelCard({ hotel }: { hotel: any, key?: any }) {
  const { disponibles } = useRealtimeAvailability(hotel.id);
  
  const getStatus = () => {
    if (disponibles > 5) return { color: 'bg-emerald-500', label: 'Disponible' };
    if (disponibles > 0) return { color: 'bg-amber-500', label: '¡Últimas!' };
    return { color: 'bg-rose-500', label: 'Lleno' };
  };
  
  const status = getStatus();

  return (
    <motion.div 
      whileTap={{ scale: 0.95 }}
      className="flex-shrink-0 w-64 bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden"
    >
      <div className="h-32 bg-[#142850] relative overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${hotel.id}/400/200`} 
          alt={hotel.nombre}
          className="w-full h-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-black text-[#142850]">{hotel.estrellas || 4}</span>
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={cn("w-2 h-2 rounded-full", status.color)} 
            />
            <span className="text-[9px] font-black text-white uppercase tracking-widest">{status.label}</span>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-black text-[#142850] text-sm truncate uppercase tracking-tight">{hotel.nombre}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-400">
            <MapPin className="w-3 h-3 text-[#00A8CC]" />
            <span className="text-[10px] font-bold uppercase tracking-tight">{hotel.zona}</span>
          </div>
          <p className="text-xs font-black text-[#00A8CC]">$1,250<span className="text-[8px] text-gray-400 font-bold">/noche</span></p>
        </div>
      </div>
    </motion.div>
  );
}

// --- Offer Story Card ---
function OfferStoryCard({ offer }: { offer: any, key?: any }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.9 }}
      className="flex-shrink-0 w-24 space-y-2 text-center"
    >
      <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-400 to-[#00A8CC] animate-gradient-xy">
        <div className="w-20 h-20 rounded-full bg-white p-1">
          <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden relative">
            <img 
              src={`https://picsum.photos/seed/${offer.id}/200/200`} 
              alt={offer.nombre}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <p className="text-[9px] font-black text-[#142850] uppercase truncate px-1 tracking-tighter">{offer.nombre}</p>
    </motion.div>
  );
}

export default function ClienteFeed() {
  const [establecimientos, setEstablecimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiFilters, setAiFilters] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'establecimientos'), orderBy('nombre'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEstablecimientos(ests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredHoteles = useMemo(() => {
    const hotels = establecimientos.filter(e => e.tipo === 'hotel');
    if (!aiFilters) return hotels;

    return hotels.filter(hotel => {
      let match = true;
      if (aiFilters.zona && hotel.zona !== aiFilters.zona) match = false;
      if (aiFilters.minEstrellas && (hotel.estrellas || 0) < aiFilters.minEstrellas) match = false;
      if (aiFilters.keywords && aiFilters.keywords.length > 0) {
        const text = `${hotel.nombre} ${hotel.zona}`.toLowerCase();
        const keywordMatch = aiFilters.keywords.some((k: string) => text.includes(k.toLowerCase()));
        if (!keywordMatch) match = false;
      }
      return match;
    });
  }, [establecimientos, aiFilters]);

  const flashOffers = [
    { id: 'off-1', nombre: 'Yates Bonanza', desc: '20% OFF Atardecer' },
    { id: 'off-2', nombre: 'La Cabaña', desc: 'Margaritas 2x1' },
    { id: 'off-3', nombre: 'Tacos Acapulco', desc: 'Orden Gratis' },
    { id: 'off-4', nombre: 'Jet Ski Tours', desc: 'Promo Parejas' },
    { id: 'off-5', nombre: 'Sky Bar', desc: 'No Cover' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-8 h-8 text-[#00A8CC] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      {/* Super App Header */}
      <header className="bg-white px-6 pt-8 pb-4 sticky top-0 z-30 border-b border-gray-50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00A8CC] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-[#142850] tracking-tighter uppercase">AcaEnVivo</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">En Vivo</span>
            </div>
          </div>
        </div>

        {/* AI Search Hero */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#00A8CC] transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="¿Qué buscas hoy en Acapulco?"
            className="w-full bg-gray-100 border-none rounded-2xl py-4 pl-12 pr-12 text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-[#00A8CC]/20 transition-all"
          />
          <button className="absolute inset-y-0 right-4 flex items-center">
            <Mic className="w-5 h-5 text-[#00A8CC]" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-gray-400 font-bold px-2">
          Sugerido: <span className="text-[#00A8CC]">Hotel con alberca zona Dorada menos de $1500</span>
        </p>
      </header>

      <main className="space-y-8 pt-4">
        {/* Flash Offers Stories */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-sm font-black text-[#142850] uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              Ofertas Flash ⚡
            </h2>
            <button className="text-[10px] font-black text-[#00A8CC] uppercase tracking-widest flex items-center gap-1">
              Ver Todas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 pb-2 no-scrollbar">
            {flashOffers.map(offer => (
              <OfferStoryCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>

        {/* AI Chat Integration (Visual Placeholder) */}
        <div className="px-6">
          <AIChatSearch 
            onFilter={(filters) => setAiFilters(filters)} 
            onClear={() => setAiFilters(null)} 
          />
        </div>

        {/* Live Hotels Scroll */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-sm font-black text-[#142850] uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00A8CC]" />
              Disponibilidad en Vivo
            </h2>
          </div>
          <div className="flex gap-6 overflow-x-auto px-6 pb-4 no-scrollbar">
            {filteredHoteles.map(hotel => (
              <CompactHotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        </section>

        {/* Simulated Map Section */}
        <section className="px-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#142850] uppercase tracking-widest flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-[#00A8CC]" />
              Explora el Mapa
            </h2>
          </div>
          <div className="h-48 bg-[#F2E1C1] rounded-[2.5rem] relative overflow-hidden shadow-inner border border-[#00A8CC]/10">
            {/* Map Pins Simulation */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00A8CC_1px,transparent_1px)] [background-size:20px_20px]" />
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-10 left-20"
            >
              <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              className="absolute bottom-12 right-24"
            >
              <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-lg" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              className="absolute top-20 right-10"
            >
              <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest text-[#142850] shadow-xl border border-white/50">
                Abrir Mapa Interactivo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 bg-[#142850]/90 backdrop-blur-xl rounded-[2rem] p-4 flex justify-around items-center shadow-2xl border border-white/10 z-40">
        <button className="flex flex-col items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00A8CC] mb-1" />
          <span className="text-[#00A8CC] font-black text-[9px] uppercase tracking-widest">Explorar</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-40">
          <Zap className="w-4 h-4 text-white" />
          <span className="text-white font-black text-[9px] uppercase tracking-widest">Ofertas</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-40">
          <MapIcon className="w-4 h-4 text-white" />
          <span className="text-white font-black text-[9px] uppercase tracking-widest">Mapa</span>
        </button>
      </nav>
    </div>
  );
}


