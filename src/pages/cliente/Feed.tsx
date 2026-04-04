import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
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
  Sun
} from 'lucide-react';
import { useRealtimeAvailability } from '../../hooks/useRealtimeAvailability';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Layout } from '../../components/Layout';
import { DemoAccess } from '../../components/DemoAccess';

import { useNavigate } from 'react-router-dom';

// --- Categories Definition ---
const CATEGORIES = [
  { id: 'hotel', label: 'Hoteles', icon: Hotel, color: 'bg-blue-500' },
  { id: 'restaurante', label: 'Restaurantes', icon: Utensils, color: 'bg-orange-500' },
  { id: 'yate', label: 'Yates', icon: Ship, color: 'bg-cyan-500' },
  { id: 'tienda', label: 'Tiendas', icon: ShoppingBag, color: 'bg-pink-500' },
  { id: 'artesania', label: 'Artesanías', icon: Palmtree, color: 'bg-amber-600' },
  { id: 'moto', label: 'Motos', icon: Bike, color: 'bg-indigo-500' },
  { id: 'medico', label: 'Médico', icon: Stethoscope, color: 'bg-emerald-500' },
];

// --- Popular Card ---
function PopularCard({ business }: { business: any, key?: string }) {
  const { disponibles } = useRealtimeAvailability(business.id);
  
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-[2.5rem] p-3 shadow-xl shadow-black/5 border border-gray-100 group flex flex-col gap-3"
    >
      <div className="aspect-[4/5] relative overflow-hidden rounded-[2rem]">
        <img 
          src={`https://picsum.photos/seed/${business.id}/600/750`} 
          alt={business.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
          <Heart className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg">
          <h3 className="font-black text-dark text-sm leading-tight uppercase tracking-tight truncate">{business.nombre}</h3>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1 text-muted">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-tight">{business.zona || 'Acapulco'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-accent text-accent" />
              <span className="text-[10px] font-black text-dark">{business.estrellas || 4.5}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ClienteFeed() {
  const navigate = useNavigate();
  const [establecimientos, setEstablecimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('hotel');
  const [showOnboarding, setShowOnboarding] = useState(true);

  const DEMO_ROLES = [
    { id: 'admin-dev', label: 'Dev', path: '/admin-dev', color: 'bg-yellow-400' },
    { id: 'admin-agencia', label: 'Agencia', path: '/admin-agencia', color: 'bg-emerald-400' },
    { id: 'hotel', label: 'Hotel', path: '/hotel', color: 'bg-blue-500' },
    { id: 'negocio', label: 'Negocio', path: '/negocio', color: 'bg-amber-500' },
    { id: 'clasificados', label: 'Rentas', path: '/clasificados', color: 'bg-orange-400' },
  ];

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
    return establecimientos.filter(e => e.tipo === selectedCategory || selectedCategory === 'all');
  }, [establecimientos, selectedCategory]);

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
              Let's Enjoy The<br />
              <span className="text-primary">Beautiful World!</span>
            </h1>
            <p className="text-white/60 text-lg lg:text-xl font-medium max-w-md">
              Explorer new places in the world and get new experiences
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
                  "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95",
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
            onClick={() => setShowOnboarding(false)}
            className="w-full lg:w-auto px-10 py-6 bg-primary text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 group"
          >
            Get Started
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform">
              <ChevronRight className="w-6 h-6" />
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-10">
        {/* Featured Card */}
        <section className="relative aspect-[16/9] lg:aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl group">
          <img 
            src="https://images.unsplash.com/photo-1506929199175-60933ee89334?auto=format&fit=crop&q=80&w=1920" 
            alt="Featured" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          <div className="absolute inset-y-0 left-0 p-8 lg:p-12 flex flex-col justify-center space-y-4">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 w-fit">
              <span className="text-white text-[10px] font-black uppercase tracking-widest">Featured Destination</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter leading-tight">
              Acapulco Bay<br />Experience
            </h2>
            <button className="bg-white text-dark px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl w-fit hover:bg-primary hover:text-white transition-all">
              Explore Now
            </button>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-dark tracking-tight">Category</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex flex-col items-center gap-3 flex-shrink-0 group"
              >
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg",
                  selectedCategory === cat.id 
                    ? "bg-primary text-white scale-110" 
                    : "bg-white text-muted hover:bg-primary/10 hover:text-primary"
                )}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  selectedCategory === cat.id ? "text-primary" : "text-muted"
                )}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Popular Section */}
        <section className="space-y-6 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-dark tracking-tight">Popular</h2>
            <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">See all</button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBusinesses.map(business => (
              <PopularCard key={business.id} business={business} />
            ))}
          </div>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Palmtree className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">No destinations found in this category</p>
            </div>
          )}
        </section>

        {/* Demo Access Section */}
        <DemoAccess />
      </div>
    </Layout>
  );
}


