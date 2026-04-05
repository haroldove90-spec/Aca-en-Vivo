import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { 
  MapPin, 
  Star, 
  Phone, 
  Clock, 
  Wifi, 
  Waves, 
  Dog, 
  ParkingCircle, 
  ChevronLeft,
  Heart,
  Share2,
  CheckCircle2,
  Loader2,
  Zap,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useFavorites } from '../../contexts/FavoritesContext';

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'establecimientos', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBusiness({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Fallback mock data if not found in DB
          setBusiness({
            id,
            nombre: 'Establecimiento Demo',
            tipo: 'hotel',
            zona: 'Zona Dorada',
            descripcion: 'Una experiencia única frente al mar con los mejores servicios y atención personalizada.',
            estrellas: 4.8,
            telefono: '+52 744 123 4567',
            amenidades: ['wifi', 'pool', 'parking', 'pet'],
            galeria: [
              `https://picsum.photos/seed/${id}1/1200/800`,
              `https://picsum.photos/seed/${id}2/1200/800`,
              ` Entra en vivo con nosotros.`
            ]
          });
        }
      } catch (err) {
        console.error("Error fetching business:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [id]);

  const handleReserve = async () => {
    setReserving(true);
    try {
      await addDoc(collection(db, 'reservas'), {
        userId: auth.currentUser?.uid || 'demo-user',
        businessId: id,
        businessName: business.nombre,
        businessImage: business.galeria?.[0] || `https://picsum.photos/seed/${id}/600/400`,
        status: 'confirmada',
        date: new Date().toISOString(),
        createdAt: Timestamp.now()
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/reservas');
      }, 2000);
    } catch (err) {
      console.error("Error reserving:", err);
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const active = isFavorite(id || '');

  return (
    <div className="pb-24">
      {/* Hero Gallery */}
      <div className="relative h-[50vh] lg:h-[60vh] bg-dark overflow-hidden">
        <img 
          src={business.galeria?.[0] || `https://picsum.photos/seed/${id}/1200/800`} 
          alt={business.nombre}
          className="w-full h-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
        
        {/* Top Controls */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-none flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-4">
            <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-none flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => toggleFavorite({
                id: business.id,
                name: business.nombre,
                category: business.tipo,
                image: business.galeria?.[0] || `https://picsum.photos/seed/${id}/600/400`,
                price: '$2,500',
                rating: business.estrellas
              })}
              className={cn(
                "w-12 h-12 backdrop-blur-md rounded-none flex items-center justify-center border transition-all",
                active ? "bg-rose-500 border-rose-500 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              )}
            >
              <Heart className={cn("w-6 h-6", active && "fill-current")} />
            </button>
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-12 left-8 right-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-none">
                {business.tipo}
              </span>
              <div className="flex items-center gap-1 bg-accent/90 backdrop-blur-md px-3 py-1.5 rounded-none">
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span className="text-[11px] font-black text-white">{business.estrellas}</span>
              </div>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-none mb-4">
              {business.nombre}
            </h1>
            <div className="flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold uppercase tracking-widest">{business.zona || 'Acapulco, Guerrero'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold uppercase tracking-widest">Abierto ahora</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-dark uppercase tracking-tight border-l-4 border-primary pl-6">Descripción</h2>
            <p className="text-lg text-muted leading-relaxed font-medium">
              {business.descripcion}
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black text-dark uppercase tracking-tight border-l-4 border-primary pl-6">Amenidades</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { id: 'wifi', label: 'WiFi Gratis', icon: Wifi },
                { id: 'pool', label: 'Alberca', icon: Waves },
                { id: 'pet', label: 'Pet Friendly', icon: Dog },
                { id: 'parking', label: 'Parking', icon: ParkingCircle },
              ].map((item) => (
                <div 
                  key={item.id}
                  className={cn(
                    "flex flex-col items-center gap-4 p-8 border-2 transition-all",
                    business.amenidades?.includes(item.id) 
                      ? "bg-primary/5 border-primary/20 text-primary" 
                      : "bg-gray-50 border-transparent text-gray-300 opacity-50"
                  )}
                >
                  <item.icon className="w-8 h-8" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black text-dark uppercase tracking-tight border-l-4 border-primary pl-6">Galería</h2>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-video bg-gray-100 rounded-none overflow-hidden group">
                  <img 
                    src={`https://picsum.photos/seed/${id}${i}/800/600`} 
                    alt="Gallery" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Booking Card */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-none shadow-2xl shadow-black/5 border border-gray-100 sticky top-32">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Desde</p>
                <h3 className="text-4xl font-black text-dark tracking-tighter">$2,500 <span className="text-sm font-bold text-muted uppercase">MXN</span></h3>
              </div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Disponible</span>
            </div>

            <div className="space-y-4 mb-10">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-none flex items-center gap-4">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest">Fecha de Entrada</p>
                  <p className="text-xs font-bold text-dark">Seleccionar fecha</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-none flex items-center gap-4">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest">Oferta Especial</p>
                  <p className="text-xs font-bold text-dark">15% de descuento hoy</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleReserve}
              disabled={reserving}
              className="w-full py-6 bg-primary text-white rounded-none font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {reserving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Reservar Ahora'}
            </button>

            <p className="text-[10px] text-center text-muted font-bold uppercase tracking-widest mt-6">
              No se realizará ningún cargo todavía
            </p>
          </div>

          <div className="bg-dark p-8 rounded-none text-white space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-none flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Contacto Directo</p>
                <p className="text-sm font-black uppercase tracking-tight">{business.telefono}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-dark/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-12 rounded-none text-center max-w-md w-full shadow-2xl"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-none flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-dark uppercase tracking-tighter mb-4">¡Reserva Exitosa!</h2>
              <p className="text-muted font-bold uppercase tracking-widest text-xs leading-relaxed">
                Tu reserva ha sido confirmada. Redirigiendo a tus reservas...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
