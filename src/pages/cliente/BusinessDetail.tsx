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
  Calendar,
  Users,
  Hotel,
  Palmtree
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { HOTEL_IMAGES } from '../../constants/images';

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addItem } = useCart();
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
              HOTEL_IMAGES.EXTERIOR,
              HOTEL_IMAGES.ROOM,
              HOTEL_IMAGES.POOL
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
        businessImage: business.image || business.galeria?.[0] || HOTEL_IMAGES.EXTERIOR,
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
    <div className="pb-24 bg-white lg:bg-bg">
      {/* Top Navigation Bar (Mobile only, desktop has global header) */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-dark" />
        </button>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-dark" />
          </button>
          <button 
            onClick={() => toggleFavorite({
              id: business.id,
              name: business.nombre,
              category: business.tipo,
              image: business.image || business.galeria?.[0] || HOTEL_IMAGES.EXTERIOR,
              price: '$2,500',
              rating: business.estrellas
            })}
            className={cn("p-2 rounded-full transition-colors", active ? "text-rose-500" : "text-dark")}
          >
            <Heart className={cn("w-6 h-6", active && "fill-current")} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:px-12 lg:py-8">
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 h-[400px] lg:h-[500px] overflow-hidden lg:rounded-lg">
          <div className="lg:col-span-2 h-full relative group cursor-pointer">
            <img 
              src={business.image || business.galeria?.[0] || HOTEL_IMAGES.EXTERIOR} 
              alt={business.nombre}
              className="w-full h-full object-cover group-hover:brightness-90 transition-all"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="hidden lg:grid grid-cols-2 grid-rows-2 gap-2 lg:col-span-2 h-full">
            {[HOTEL_IMAGES.ROOM, HOTEL_IMAGES.POOL, HOTEL_IMAGES.RESTAURANT, HOTEL_IMAGES.BEACH].map((img, i) => (
              <div key={i} className="relative group cursor-pointer overflow-hidden">
                <img 
                  src={img} 
                  alt={`Gallery ${i}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                {i === 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+12 fotos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 px-6 lg:px-0">
          {/* Left Column: Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="bg-primary text-white px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider">{business.tipo}</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-3 h-3", i < Math.floor(business.estrellas) ? "fill-accent text-accent" : "text-gray-300")} />
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-start">
                <h1 className="text-3xl lg:text-4xl font-black text-dark tracking-tight">{business.nombre}</h1>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-dark leading-none">Excelente</p>
                    <p className="text-xs text-muted mt-1">1,240 comentarios</p>
                  </div>
                  <div className="bg-navy text-white w-10 h-10 flex items-center justify-center rounded-sm font-bold text-lg">
                    {business.estrellas}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <MapPin className="w-4 h-4" />
                <span>{business.zona || 'Acapulco, Guerrero'}</span>
                <span className="text-muted mx-1">·</span>
                <button className="hover:underline">Excelente ubicación — ver mapa</button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8">
              <h2 className="text-xl font-black text-dark mb-4">Lo que ofrece este lugar</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { id: 'wifi', label: 'WiFi gratis', icon: Wifi },
                  { id: 'pool', label: 'Alberca al aire libre', icon: Waves },
                  { id: 'pet', label: 'Se aceptan mascotas', icon: Dog },
                  { id: 'parking', label: 'Estacionamiento', icon: ParkingCircle },
                ].map((item) => (
                  <div key={item.id} className={cn(
                    "flex items-center gap-3",
                    business.amenidades?.includes(item.id) ? "text-dark" : "text-gray-300"
                  )}>
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
              <button className="mt-6 text-primary font-bold text-sm hover:underline">Mostrar las 24 amenidades</button>
            </div>

            <div className="border-t border-gray-100 pt-8">
              <h2 className="text-xl font-black text-dark mb-4">Descripción</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">
                {business.descripcion}
              </p>
            </div>
          </div>

          {/* Right Column: Booking Card */}
          <div className="relative">
            <div className="bg-white p-6 rounded-sm shadow-xl border border-gray-200 sticky top-24 space-y-6">
              <div className="bg-primary/5 p-4 rounded-sm border border-primary/10">
                <p className="text-xs font-bold text-primary mb-1">Oferta por tiempo limitado</p>
                <p className="text-[10px] text-muted">Ahorra un 15% si reservas hoy mismo</p>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-muted line-through text-sm">$2,950</span>
                  <span className="text-2xl font-black text-dark">$2,500</span>
                </div>
                <p className="text-xs text-muted">por noche (impuestos incluidos)</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-sm flex items-center gap-3 cursor-pointer hover:border-primary transition-colors">
                  <Calendar className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase">Entrada — Salida</p>
                    <p className="text-xs font-bold text-dark">Seleccionar fechas</p>
                  </div>
                </div>
                <div className="p-3 border border-gray-200 rounded-sm flex items-center gap-3 cursor-pointer hover:border-primary transition-colors">
                  <Users className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase">Huéspedes</p>
                    <p className="text-xs font-bold text-dark">2 adultos · 1 habitación</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleReserve}
                  disabled={reserving}
                  className="w-full py-4 bg-primary text-white rounded-sm font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {reserving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Ver disponibilidad'}
                </button>
                <button 
                  onClick={() => addItem({
                    id: business.id,
                    name: business.nombre,
                    category: business.tipo,
                    image: business.image || business.galeria?.[0] || HOTEL_IMAGES.EXTERIOR,
                    price: '$2,500'
                  })}
                  className="w-full py-4 bg-white text-primary border border-primary rounded-sm font-black text-sm uppercase tracking-widest hover:bg-primary/5 transition-all"
                >
                  Añadir al carrito
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Reserva ahora y paga después</span>
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
