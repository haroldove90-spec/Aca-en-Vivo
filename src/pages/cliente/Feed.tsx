import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Loader2, 
  Search, 
  Mic, 
  Map as MapIcon, 
  Zap, 
  ChevronRight, 
  Star, 
  MapPin,
  Clock,
  TrendingUp,
  Utensils,
  Hotel,
  ShoppingBag,
  Palmtree,
  Ship,
  Bike,
  Stethoscope,
  Filter,
  Navigation,
  Heart
} from 'lucide-react';
import { useRealtimeAvailability } from '../../hooks/useRealtimeAvailability';
import { AIChatSearch } from '../../components/AIChatSearch';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

// --- Categories Definition ---
const CATEGORIES = [
  { id: 'hotel', label: 'Hoteles', icon: Hotel, color: 'bg-blue-500' },
  { id: 'restaurante', label: 'Comida', icon: Utensils, color: 'bg-orange-500' },
  { id: 'yate', label: 'Yates', icon: Ship, color: 'bg-cyan-500' },
  { id: 'tienda', label: 'Tiendas', icon: ShoppingBag, color: 'bg-pink-500' },
  { id: 'artesania', label: 'Artesanías', icon: Palmtree, color: 'bg-amber-600' },
  { id: 'renta', label: 'Rentas', icon: Bike, color: 'bg-purple-500' },
  { id: 'salud', label: 'Salud', icon: Stethoscope, color: 'bg-rose-500' },
];

// --- Business Card (Dynamic) ---
function BusinessCard({ business }: { business: any, key?: any }) {
  const { disponibles } = useRealtimeAvailability(business.id);
  
  const getBadge = () => {
    if (business.tipo === 'hotel') {
      if (disponibles > 5) return { color: 'bg-emerald-500', label: 'Disponible' };
      if (disponibles > 0) return { color: 'bg-amber-500', label: '¡Últimas!' };
      return { color: 'bg-rose-500', label: 'Lleno' };
    }
    if (business.tipo === 'restaurante') {
      const afluencia = business.afluencia || 'baja';
      if (afluencia === 'baja') return { color: 'bg-emerald-500', label: 'Mesas Libres' };
      if (afluencia === 'media') return { color: 'bg-amber-500', label: 'Casi Lleno' };
      return { color: 'bg-rose-500', label: 'Lista de Espera' };
    }
    if (business.promocion) {
      return { color: 'bg-[#00A8CC]', label: 'Oferta Activa ⚡' };
    }
    return { color: 'bg-slate-400', label: 'Abierto' };
  };
  
  const badge = getBadge();

  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden group"
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${business.id}/600/450`} 
          alt={business.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-black text-[#142850]">{business.estrellas || 4.5}</span>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", badge.color)} />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{badge.label}</span>
          </div>
        </div>
        <button className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
          <Heart className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-black text-[#142850] text-lg leading-tight uppercase tracking-tight">{business.nombre}</h3>
            <div className="flex items-center gap-1 text-gray-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#00A8CC]" />
              <span className="text-[11px] font-bold uppercase tracking-tight">{business.zona || 'Zona Dorada'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-[#00A8CC] tracking-tighter">
              {business.tipo === 'hotel' ? '$1,450' : business.tipo === 'restaurante' ? '$$' : 'Ver Precios'}
            </p>
            <p className="text-[9px] font-bold text-gray-400 uppercase">Promedio</p>
          </div>
        </div>
        {business.promocion && (
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <p className="text-[10px] font-bold text-amber-700 line-clamp-1">{business.promocion}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ClienteFeed() {
  const [establecimientos, setEstablecimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('hotel');
  const [activeFilter, setActiveFilter] = useState('all');
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

  const filteredBusinesses = useMemo(() => {
    let results = establecimientos.filter(e => e.tipo === selectedCategory);
    
    if (aiFilters) {
      results = results.filter(b => {
        let match = true;
        if (aiFilters.zona && b.zona !== aiFilters.zona) match = false;
        if (aiFilters.keywords && aiFilters.keywords.length > 0) {
          const text = `${b.nombre} ${b.zona} ${b.giro || ''}`.toLowerCase();
          const keywordMatch = aiFilters.keywords.some((k: string) => text.includes(k.toLowerCase()));
          if (!keywordMatch) match = false;
        }
        return match;
      });
    }

    if (activeFilter === 'top') {
      results = results.sort((a, b) => (b.estrellas || 0) - (a.estrellas || 0));
    } else if (activeFilter === 'cheap') {
      // Mock price sorting
    }

    return results;
  }, [establecimientos, selectedCategory, aiFilters, activeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-8 h-8 text-[#00A8CC] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      {/* Airbnb Style Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="px-6 pt-6 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#00A8CC] rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black text-[#142850] tracking-tighter uppercase">AcaEnVivo</h1>
            </div>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#142850]" />
            </button>
          </div>

          {/* AI Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#00A8CC] transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="¿Qué buscas hoy en Acapulco?"
              className="w-full bg-white border-2 border-gray-100 rounded-full py-4 pl-12 pr-12 text-sm font-bold placeholder:text-gray-400 focus:border-[#00A8CC]/30 focus:ring-4 focus:ring-[#00A8CC]/5 transition-all shadow-sm"
            />
            <button className="absolute inset-y-0 right-4 flex items-center">
              <Mic className="w-5 h-5 text-[#00A8CC]" />
            </button>
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex gap-8 overflow-x-auto px-6 pb-4 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex flex-col items-center gap-2 flex-shrink-0 transition-all border-b-2 pb-2",
                selectedCategory === cat.id 
                  ? "border-[#00A8CC] opacity-100" 
                  : "border-transparent opacity-40 hover:opacity-60"
              )}
            >
              <cat.icon className={cn("w-6 h-6", selectedCategory === cat.id ? "text-[#00A8CC]" : "text-gray-600")} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                selectedCategory === cat.id ? "text-[#142850]" : "text-gray-500"
              )}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 pt-6 space-y-8">
        {/* Near Me Indicator */}
        <section className="flex items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Navigation className="w-5 h-5 text-[#00A8CC]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cerca de ti</p>
              <p className="text-xs font-bold text-[#142850]">Zona Dorada • a 500m</p>
            </div>
          </div>
          <button className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#00A8CC] shadow-sm border border-slate-100">
            Ver Mapa
          </button>
        </section>

        {/* Filter Pills */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Todos', icon: Filter },
            { id: 'top', label: 'Mejor Calificados', icon: Star },
            { id: 'cheap', label: 'Más Baratos', icon: TrendingUp },
            { id: 'open', label: 'Abiertos Ahora', icon: Clock },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                activeFilter === filter.id 
                  ? "bg-[#142850] text-white border-[#142850] shadow-lg" 
                  : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
              )}
            >
              <filter.icon className="w-3.5 h-3.5" />
              {filter.label}
            </button>
          ))}
        </div>

        {/* AI Chat Integration */}
        <AIChatSearch 
          onFilter={(filters) => setAiFilters(filters)} 
          onClear={() => setAiFilters(null)} 
        />

        {/* Dynamic Feed */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#142850] uppercase tracking-[0.2em]">
              {CATEGORIES.find(c => c.id === selectedCategory)?.label} en Acapulco
            </h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              {filteredBusinesses.length} resultados
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {filteredBusinesses.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay resultados para esta categoría</p>
            </div>
          )}
        </section>
      </main>

      {/* Modern Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 bg-[#142850]/95 backdrop-blur-xl rounded-[2.5rem] p-4 flex justify-around items-center shadow-2xl border border-white/10 z-50">
        <button className="flex flex-col items-center gap-1.5 group">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00A8CC] mb-0.5" />
          <span className="text-[#00A8CC] font-black text-[9px] uppercase tracking-[0.2em]">Explorar</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 opacity-40 group hover:opacity-100 transition-opacity">
          <Zap className="w-5 h-5 text-white" />
          <span className="text-white font-black text-[9px] uppercase tracking-[0.2em]">Ofertas</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 opacity-40 group hover:opacity-100 transition-opacity">
          <MapIcon className="w-5 h-5 text-white" />
          <span className="text-white font-black text-[9px] uppercase tracking-[0.2em]">Mapa</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 opacity-40 group hover:opacity-100 transition-opacity">
          <Heart className="w-5 h-5 text-white" />
          <span className="text-white font-black text-[9px] uppercase tracking-[0.2em]">Favoritos</span>
        </button>
      </nav>
    </div>
  );
}


