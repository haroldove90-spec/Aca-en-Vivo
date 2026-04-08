import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { 
  Loader2, 
  Search, 
  MapPin,
  Star,
  Hotel,
  Utensils,
  Ship,
  ShoppingBag,
  Palmtree,
  Bike,
  Stethoscope,
  Heart,
  ChevronRight,
  Filter,
  Mountain,
  Tent,
  Trees,
  Waves,
  Sun,
  Grid,
  Home,
  Store,
  Calendar,
  Users
} from 'lucide-react';
import { useRealtimeAvailability } from '../../hooks/useRealtimeAvailability';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useSearch } from '../../contexts/SearchContext';
import { useCart } from '../../contexts/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { DemoAccess } from '../../components/DemoAccess';
import { HOTEL_IMAGES } from '../../constants/images';

import { useNavigate, useLocation } from 'react-router-dom';

// --- Categories Definition ---
const CATEGORIES = [
  { id: 'all', label: 'Todo', icon: Grid, color: 'bg-dark' },
  { id: 'hotel', label: 'Hoteles', icon: Hotel, color: 'bg-blue-500' },
  { id: 'negocio', label: 'Negocios', icon: Store, color: 'bg-amber-500' },
  { id: 'clasificados', label: 'Rentas', icon: Home, color: 'bg-purple-600' },
  { id: 'yates', label: 'Yates', icon: Ship, color: 'bg-cyan-500' },
  { id: 'medicos', label: 'Médicos', icon: Stethoscope, color: 'bg-rose-500' },
];

// --- Popular Card ---
function PopularCard({ business }: { business: any, key?: string }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addItem } = useCart();
  const { disponibles } = useRealtimeAvailability(business.id);
  const navigate = useNavigate();
  const active = isFavorite(business.id);

  const handleReserve = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addDoc(collection(db, 'reservas'), {
        userId: auth.currentUser?.uid || 'demo-user',
        businessId: business.id,
        businessName: business.nombre,
        businessImage: business.image || HOTEL_IMAGES.EXTERIOR,
        status: 'confirmada',
        date: new Date().toISOString(),
        createdAt: Timestamp.now()
      });
      navigate('/reservas');
    } catch (err) {
      console.error("Error reserving:", err);
    }
  };

  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/business/${business.id}`)}
      className="bg-white rounded-none shadow-sm border border-gray-200 group flex flex-col cursor-pointer relative hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <img 
          src={business.image || HOTEL_IMAGES.EXTERIOR} 
          alt={business.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          referrerPolicy="no-referrer"
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite({
              id: business.id,
              name: business.nombre,
              category: business.tipo,
              image: business.image || HOTEL_IMAGES.EXTERIOR,
              price: business.tipo === 'hotel' ? '$2,500' : '$1,200',
              rating: business.estrellas || 4.5
            });
          }}
          className={cn(
            "absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all z-20",
            active 
              ? "bg-rose-500 text-white" 
              : "bg-white/80 text-dark hover:bg-white"
          )}
        >
          <Heart className={cn("w-5 h-5", active && "fill-current")} />
        </button>
        {business.tipo === 'hotel' && (
          <div className="absolute bottom-3 left-3 bg-primary text-white px-2 py-1 rounded-sm text-[10px] font-bold flex items-center gap-1.5 shadow-lg z-20">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            {disponibles !== null ? `${disponibles} disponibles` : 'Cargando...'}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-dark text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">{business.nombre}</h3>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 bg-navy text-white px-1.5 py-0.5 rounded-sm">
              <span className="text-xs font-bold">{business.estrellas || 4.5}</span>
            </div>
            <span className="text-[10px] font-medium text-muted mt-1">Excelente</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{business.zona || 'Acapulco'}</span>
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted font-medium">Desde</span>
            <span className="text-lg font-black text-dark">{business.tipo === 'hotel' ? '$2,500' : '$1,200'}</span>
            <span className="text-[10px] text-muted">Incluye impuestos</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                addItem({
                  id: business.id,
                  name: business.nombre,
                  category: business.tipo,
                  image: business.image || HOTEL_IMAGES.EXTERIOR,
                  price: business.tipo === 'hotel' ? '$2,500' : '$1,200'
                });
              }}
              className="w-10 h-10 border border-primary text-primary flex items-center justify-center rounded-sm hover:bg-primary/5 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button 
              onClick={handleReserve}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-sm hover:bg-primary/90 transition-all"
            >
              Ver disponibilidad
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ClienteFeed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery, dates, setDates, guests, setGuests } = useSearch();
  const [establecimientos, setEstablecimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get('cat') || 'all';

  const setSelectedCategory = (cat: string) => {
    if (cat === 'all') {
      navigate('/');
    } else {
      navigate(`/?cat=${cat}`);
    }
  };

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('aca_onboarding_completed') !== 'true';
  });

  const handleCompleteOnboarding = () => {
    localStorage.setItem('aca_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const DEMO_ROLES = [
    { id: 'admin-dev', label: 'Dev', path: '/admin-dev', color: 'bg-yellow-400' },
    { id: 'admin-agencia', label: 'Agencia', path: '/admin-agencia', color: 'bg-emerald-400' },
    { id: 'hotel', label: 'Hotel', path: '/hotel', color: 'bg-blue-500' },
    { id: 'negocio', label: 'Negocio', path: '/negocio', color: 'bg-amber-500' },
    { id: 'clasificados', label: 'Rentas', path: '/clasificados', color: 'bg-orange-400' },
  ];

  useEffect(() => {
    const seedData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'establecimientos'));
        const existingNames = snapshot.docs.map(doc => doc.data().nombre);
        
        const mockData = [
          { nombre: 'Hotel Emporio Acapulco', tipo: 'hotel', zona: 'Zona Dorada', estrellas: 4.8, createdAt: Timestamp.now(), descripcion: 'Lujo frente al mar.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800' },
          { nombre: 'Princess Mundo Imperial', tipo: 'hotel', zona: 'Diamante', estrellas: 4.9, createdAt: Timestamp.now(), descripcion: 'Arquitectura icónica.', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800' },
          { nombre: 'Yates Bonanza', tipo: 'yates', zona: 'Zona Tradicional', estrellas: 4.9, createdAt: Timestamp.now(), descripcion: 'Paseos por la bahía.', image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=800' },
          { nombre: 'La Cabaña de Caleta', tipo: 'negocio', zona: 'Caleta', estrellas: 4.5, createdAt: Timestamp.now(), descripcion: 'Mariscos frescos.', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800' },
          { nombre: 'Dr. García - Médico 24/7', tipo: 'medicos', zona: 'Zona Dorada', estrellas: 4.9, createdAt: Timestamp.now(), descripcion: 'Atención médica inmediata.', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800' },
          { nombre: 'Condo Diamante Lakes', tipo: 'clasificados', zona: 'Zona Diamante', estrellas: 4.9, createdAt: Timestamp.now(), descripcion: 'Renta vacacional de lujo.', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800' },
          { nombre: 'Villa Vista Mar', tipo: 'clasificados', zona: 'Las Brisas', estrellas: 4.8, createdAt: Timestamp.now(), descripcion: 'Privacidad y vista.', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800' },
          { nombre: 'Motos Express', tipo: 'negocio', zona: 'Costera', estrellas: 4.6, createdAt: Timestamp.now(), descripcion: 'Renta de motonetas.', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800' },
          { nombre: 'Yate Sea Ray 45', tipo: 'yates', zona: 'Marina', estrellas: 4.8, createdAt: Timestamp.now(), descripcion: 'Lujo en el mar.', image: 'https://images.unsplash.com/photo-1544413647-ad6717a26f98?auto=format&fit=crop&q=80&w=800' },
          { nombre: 'Clínica del Mar', tipo: 'medicos', zona: 'Costera', estrellas: 4.7, createdAt: Timestamp.now(), descripcion: 'Urgencias y consultas.', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800' },
          { nombre: 'Penthouse Bay View', tipo: 'clasificados', zona: 'Zona Dorada', estrellas: 5.0, createdAt: Timestamp.now(), descripcion: 'Vista panorámica increíble.', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800' },
          { nombre: 'Estudio Moderno Costera', tipo: 'clasificados', zona: 'Costera', estrellas: 4.7, createdAt: Timestamp.now(), descripcion: 'Ideal para parejas.', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800' },
        ];

        for (const item of mockData) {
          if (!existingNames.includes(item.nombre)) {
            await addDoc(collection(db, 'establecimientos'), item);
          }
        }
      } catch (err) {
        console.error("Error seeding data:", err);
      }
    };
    seedData();

    const q = query(collection(db, 'establecimientos'), orderBy('nombre'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEstablecimientos(ests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredBusinesses = useMemo(() => {
    return establecimientos.filter(e => {
      const matchesCategory = e.tipo === selectedCategory || selectedCategory === 'all';
      const matchesSearch = e.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (e.zona && e.zona.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Smart Date Filtering (Simulated)
      // If dates are selected, we simulate availability
      let matchesDates = true;
      if (dates.checkIn && dates.checkOut && e.tipo === 'hotel') {
        // For demo: hotels with "Princess" in name are "unavailable" on weekends
        const isWeekend = new Date(dates.checkIn).getDay() === 0 || new Date(dates.checkIn).getDay() === 6;
        if (isWeekend && e.nombre.includes('Princess')) {
          matchesDates = false;
        }
      }

      return matchesCategory && matchesSearch && matchesDates;
    });
  }, [establecimientos, selectedCategory, searchQuery, dates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="fixed inset-0 z-[100] bg-dark overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1920" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark/90" />
        
        <div className="absolute bottom-0 left-0 right-0 p-10 pb-20 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
              ¡Disfruta de este<br />
              <span className="text-primary">Mundo Hermoso!</span>
            </h1>
            <p className="text-white/60 text-lg lg:text-xl font-medium max-w-md">
              Explora nuevos lugares en el mundo y obtén nuevas experiencias
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap gap-3"
          >
            {DEMO_ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => navigate(role.path)}
                className={cn(
                  "px-6 py-3 rounded-none text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95",
                  role.color
                )}
              >
                {role.label}
              </button>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCompleteOnboarding}
            className="w-full lg:w-auto px-10 py-6 bg-primary text-white rounded-none font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 group"
          >
            Empezar
            <div className="w-10 h-10 bg-white/20 rounded-none flex items-center justify-center group-hover:translate-x-2 transition-transform">
              <ChevronRight className="w-6 h-6" />
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section with Search */}
      <section className="relative bg-navy pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full -mr-64 -mt-64 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full -ml-32 -mb-32 blur-[80px]" />

        <div className="relative z-10 px-6 lg:px-12 max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-tight">
              Encuentra tu próximo <br />
              <span className="text-accent">destino en Acapulco</span>
            </h1>
            <p className="text-white/70 text-lg lg:text-xl font-medium max-w-2xl">
              Busca ofertas en hoteles, casas de renta, experiencias únicas y mucho más...
            </p>
          </div>

          {/* Booking-style Search Bar */}
          <div className="bg-accent p-1 rounded-sm shadow-2xl flex flex-col lg:flex-row items-stretch gap-1">
            <div className="flex-[1.5] bg-white flex items-center gap-3 px-4 py-4 border-r border-accent/20">
              <Search className="w-5 h-5 text-muted" />
              <input 
                type="text"
                placeholder="¿A dónde vas?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-dark font-bold placeholder:text-muted/60"
              />
            </div>
            
            <div className="flex-1 bg-white relative">
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full h-full flex items-center gap-3 px-4 py-4 border-r border-accent/20 hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-5 h-5 text-muted" />
                <span className="text-dark font-bold whitespace-nowrap text-sm">
                  {dates.checkIn ? `${dates.checkIn} — ${dates.checkOut}` : 'Entrada — Salida'}
                </span>
              </button>
              
              <AnimatePresence>
                {showDatePicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 bg-white p-6 shadow-2xl border border-gray-100 z-[100] w-[320px] space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted">Check-in</label>
                      <input 
                        type="date" 
                        value={dates.checkIn}
                        onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted">Check-out</label>
                      <input 
                        type="date" 
                        value={dates.checkOut}
                        onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-none text-sm font-bold"
                      />
                    </div>
                    <button 
                      onClick={() => setShowDatePicker(false)}
                      className="w-full py-3 bg-dark text-white font-black text-[10px] uppercase tracking-widest"
                    >
                      Aplicar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 bg-white relative">
              <button 
                onClick={() => setShowGuestPicker(!showGuestPicker)}
                className="w-full h-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <Users className="w-5 h-5 text-muted" />
                <span className="text-dark font-bold whitespace-nowrap text-sm">
                  {guests} adultos · 1 habitación
                </span>
              </button>

              <AnimatePresence>
                {showGuestPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 bg-white p-6 shadow-2xl border border-gray-100 z-[100] w-[280px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-dark uppercase tracking-tight">Adultos</span>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="w-8 h-8 border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{guests}</span>
                        <button 
                          onClick={() => setGuests(guests + 1)}
                          className="w-8 h-8 border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowGuestPicker(false)}
                      className="w-full py-3 bg-dark text-white font-black text-[10px] uppercase tracking-widest mt-6"
                    >
                      Listo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="bg-primary text-white px-12 py-4 font-black text-lg uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95">
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* Categories Grid (Visual Tiles) */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex flex-col items-center gap-3 p-6 bg-white shadow-xl shadow-black/5 border transition-all group",
                selectedCategory === cat.id ? "border-primary ring-2 ring-primary/10 scale-105" : "border-gray-100 hover:border-primary/30"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                selectedCategory === cat.id ? "bg-primary text-white" : "bg-gray-50 text-primary group-hover:bg-primary/10"
              )}>
                <cat.icon className="w-6 h-6" />
              </div>
              <span className={cn(
                "text-xs font-black uppercase tracking-widest text-center",
                selectedCategory === cat.id ? "text-primary" : "text-muted"
              )}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Popular Section */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-dark tracking-tight">Destinos populares en Acapulco</h2>
            <p className="text-muted text-sm font-medium">Las mejores opciones elegidas por viajeros como tú</p>
          </div>
          <button className="text-primary text-sm font-black uppercase tracking-widest hover:underline flex items-center gap-2">
            Ver todo <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBusinesses.map(business => (
            <PopularCard key={business.id} business={business} />
          ))}
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-white rounded-none flex items-center justify-center mx-auto shadow-sm">
              <Palmtree className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-sm font-bold text-muted uppercase tracking-widest">No se encontraron destinos en esta categoría</p>
          </div>
        )}
      </section>
    </div>
  );
}


