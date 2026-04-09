import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
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
import { useAcaData } from '../../hooks/useAcaData';
import { AuthModal } from '../../components/AuthModal';
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
  { id: 'clasificado', label: 'Rentas', icon: Home, color: 'bg-purple-600' },
  { id: 'yates', label: 'Yates', icon: Ship, color: 'bg-cyan-500' },
];

// --- Popular Card ---
function PopularCard({ business, onAuthRequired }: { business: any, onAuthRequired: (msg: string) => void, key?: string }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { disponibles } = useRealtimeAvailability(business.id);
  const navigate = useNavigate();
  const active = isFavorite(business.id);

  const handleReserve = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onAuthRequired('Inicia sesión para reservar este destino');
        return;
      }

      // 1. Guardar en base de datos para historial
      await supabase.from('reservations').insert({
        user_id: session.user.id,
        business_id: business.id,
        business_name: business.nombre,
        business_image: business.imagen || business.image || HOTEL_IMAGES.EXTERIOR,
        status: 'confirmada',
        total_price: business.precio || (business.tipo === 'hotel' ? 2500 : 1200),
        guests: 2
      });

      // 2. Generar mensaje de WhatsApp
      const centralWhatsApp = '+525624222449';
      const customerName = session.user.user_metadata?.full_name || 'Cliente';
      const message = `*NUEVA RESERVA - AcaEnVivo*%0A%0A` +
                     `*Establecimiento:* ${business.nombre}%0A` +
                     `*Categoría:* ${business.tipo.toUpperCase()}%0A` +
                     `*Zona:* ${business.zona || 'Acapulco'}%0A` +
                     `*Precio:* $${business.precio || (business.tipo === 'hotel' ? 2500 : 1200)}%0A%0A` +
                     `*Cliente:* ${customerName}%0A` +
                     `*Email:* ${session.user.email}%0A%0A` +
                     `_Hola, me gustaría confirmar la disponibilidad para este destino._`;

      // 3. Abrir WhatsApp
      window.open(`https://wa.me/${centralWhatsApp.replace('+', '')}?text=${message}`, '_blank');
      
      // 4. Notificar éxito localmente
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
          src={business.imagen || business.image || HOTEL_IMAGES.EXTERIOR} 
          alt={business.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          referrerPolicy="no-referrer"
        />
        <button 
          onClick={async (e) => {
            e.stopPropagation();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              onAuthRequired('Inicia sesión para guardar tus favoritos');
              return;
            }
            toggleFavorite({
              id: business.id,
              name: business.nombre,
              category: business.tipo,
              image: business.imagen || business.image || HOTEL_IMAGES.EXTERIOR,
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
            <span className="text-lg font-black text-dark">${business.precio || (business.tipo === 'hotel' ? '2,500' : '1,200')}</span>
            <span className="text-[10px] text-muted">Incluye impuestos</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleReserve}
              className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
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
  const { data: establecimientos, loading } = useAcaData();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | undefined>(undefined);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Special check for default admin email
        if (session.user.email === 'haroldove90@gmail.com') {
          setUserRole('admin');
          return;
        }
        // First check metadata
        const role = session.user.user_metadata?.role;
        if (role) {
          setUserRole(role);
        } else {
          // Fallback to profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (profile) setUserRole(profile.role);
        }
      } else {
        setUserRole(null);
      }
    };

    checkUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);
  
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
    { id: 'clasificado', label: 'Rentas', path: '/clasificados', color: 'bg-orange-400' },
  ];

  const filteredBusinesses = useMemo(() => {
    return establecimientos.filter(e => {
      // Only show active establishments to clients
      if (e.status !== 'activo') return false;

      const matchesCategory = e.tipo === selectedCategory || selectedCategory === 'all';
      const matchesSearch = e.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (e.zona && e.zona.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Smart Date Filtering (Simulated)
      let matchesDates = true;
      if (dates.checkIn && dates.checkOut && e.tipo === 'hotel') {
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
            <Palmtree className="w-16 h-16 text-primary" />
            <h1 className="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none">
              BIENVENIDO A <br />
              <span className="text-primary">ACAPULCO</span>
            </h1>
            <p className="text-white/60 text-xl font-medium max-w-2xl">
              La guía definitiva para vivir el puerto como un local. Hoteles, negocios, rentas y experiencias únicas.
            </p>
          </motion.div>

          {(userRole === 'admin' || userRole === 'admin-dev') && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              {DEMO_ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => navigate(role.path)}
                  className={cn(
                    "px-6 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all border border-white/20 hover:bg-white hover:text-dark",
                    role.color.replace('bg-', 'text-')
                  )}
                >
                  {role.label}
                </button>
              ))}
            </motion.div>
          )}

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
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        message={authMessage}
      />
      {/* Hero Section with Search */}
      <section className="relative bg-navy pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
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
            <PopularCard 
              key={business.id} 
              business={business} 
              onAuthRequired={(msg) => {
                setAuthMessage(msg);
                setShowAuthModal(true);
              }}
            />
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
