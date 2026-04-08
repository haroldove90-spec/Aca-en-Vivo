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
  Palmtree,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { HOTEL_IMAGES } from '../../constants/images';
import { query, orderBy, onSnapshot, where } from 'firebase/firestore';

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addItem } = useCart();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [guests, setGuests] = useState(2);
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const basePrice = 2500;

  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setNights(diffDays);
        setTotalPrice(diffDays * basePrice);
      } else {
        setNights(0);
        setTotalPrice(0);
      }
    } else {
      setNights(0);
      setTotalPrice(0);
    }
  }, [checkIn, checkOut]);

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

  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, 'reviews'),
      where('businessId', '==', id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewsData);
    });
    return () => unsubscribe();
  }, [id]);

  const handleReserve = async () => {
    if (!checkIn || !checkOut) {
      alert('Por favor selecciona las fechas de tu estancia');
      return;
    }
    setReserving(true);
    try {
      await addDoc(collection(db, 'reservas'), {
        userId: auth.currentUser?.uid || 'demo-user',
        businessId: id,
        businessName: business.nombre,
        businessImage: business.image || business.galeria?.[0] || HOTEL_IMAGES.EXTERIOR,
        status: 'confirmada',
        checkIn,
        checkOut,
        nights,
        totalPrice: totalPrice || basePrice,
        guests,
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

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        businessId: id,
        userId: auth.currentUser?.uid || 'demo-user',
        userName: auth.currentUser?.displayName || 'Usuario Demo',
        userPhoto: auth.currentUser?.photoURL || '',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: Timestamp.now()
      });
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      console.error("Error adding review:", err);
    } finally {
      setSubmittingReview(false);
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
                <button 
                  onClick={() => setShowMap(true)}
                  className="hover:underline"
                >
                  Excelente ubicación — ver mapa
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8">
              <h2 className="text-xl font-black text-dark mb-6">Reseñas de huéspedes</h2>
              
              <div className="space-y-8">
                {/* Review Form */}
                <form onSubmit={handleAddReview} className="bg-gray-50 p-6 rounded-none space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-dark">Escribe tu opinión</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star className={cn("w-6 h-6", star <= newReview.rating ? "fill-accent text-accent" : "text-gray-300")} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Cuéntanos tu experiencia..."
                    className="w-full bg-white border border-gray-200 rounded-none p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview || !newReview.comment.trim()}
                    className="px-8 py-3 bg-dark text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50"
                  >
                    {submittingReview ? 'Enviando...' : 'Publicar reseña'}
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-8">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted font-medium italic">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-none flex items-center justify-center overflow-hidden">
                            {review.userPhoto ? (
                              <img src={review.userPhoto} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-dark uppercase tracking-tight">{review.userName}</p>
                            <p className="text-[10px] text-muted font-bold uppercase">{review.createdAt?.toDate().toLocaleDateString()}</p>
                          </div>
                          <div className="ml-auto flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={cn("w-3 h-3", i < review.rating ? "fill-accent text-accent" : "text-gray-200")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted leading-relaxed font-medium">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
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
                  <span className="text-2xl font-black text-dark">
                    {totalPrice > 0 ? `$${totalPrice.toLocaleString()}` : `$${basePrice.toLocaleString()}`}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  {nights > 0 ? `Total por ${nights} noches` : 'por noche'} (impuestos incluidos)
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 border border-gray-200 rounded-sm space-y-1 focus-within:border-primary transition-colors">
                    <label className="text-[10px] font-black text-muted uppercase block">Entrada</label>
                    <input 
                      type="date" 
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-dark outline-none cursor-pointer"
                    />
                  </div>
                  <div className="p-3 border border-gray-200 rounded-sm space-y-1 focus-within:border-primary transition-colors">
                    <label className="text-[10px] font-black text-muted uppercase block">Salida</label>
                    <input 
                      type="date" 
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-dark outline-none cursor-pointer"
                    />
                  </div>
                </div>
                <div className="p-3 border border-gray-200 rounded-sm flex items-center justify-between cursor-pointer hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted" />
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase">Huéspedes</p>
                      <p className="text-xs font-bold text-dark">{guests} adultos · 1 habitación</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-6 h-6 border border-gray-200 flex items-center justify-center text-dark hover:bg-gray-50">-</button>
                    <button onClick={() => setGuests(guests + 1)} className="w-6 h-6 border border-gray-200 flex items-center justify-center text-dark hover:bg-gray-50">+</button>
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
                    price: totalPrice > 0 ? `$${totalPrice.toLocaleString()}` : `$${basePrice.toLocaleString()}`
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

        {/* Recommended Sponsors Section */}
        <div className="mt-20 border-t border-gray-100 pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-dark tracking-tight">Patrocinadores Recomendados</h2>
              <p className="text-muted text-sm font-medium">Otros lugares que podrían interesarte en Acapulco</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: '1', name: 'Hotel Emporio', price: '$2,800', rating: 4.8, img: HOTEL_IMAGES.EXTERIOR },
              { id: '2', name: 'Princess Mundo Imperial', price: '$3,500', rating: 4.9, img: HOTEL_IMAGES.ROOM },
              { id: '3', name: 'Las Brisas Acapulco', price: '$4,200', rating: 4.7, img: HOTEL_IMAGES.POOL },
            ].map((sponsor) => (
              <div key={sponsor.id} className="bg-white rounded-sm border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <div className="aspect-video relative overflow-hidden">
                  <img src={sponsor.img} alt={sponsor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    <span className="text-[10px] font-bold text-dark">{sponsor.rating}</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-dark group-hover:text-primary transition-colors">{sponsor.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-black text-sm">{sponsor.price} <span className="text-[10px] text-muted font-bold">/ noche</span></span>
                    <button className="text-[10px] font-black uppercase tracking-widest text-dark hover:text-primary">Ver más</button>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Map Modal */}
      <AnimatePresence>
        {showMap && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMap(false)}
              className="absolute inset-0 bg-dark/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl h-[80vh] rounded-none overflow-hidden relative shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-dark uppercase tracking-tight">{business.nombre}</h3>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{business.zona}, Acapulco</p>
                </div>
                <button 
                  onClick={() => setShowMap(false)}
                  className="w-10 h-10 bg-gray-50 rounded-none flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-gray-100">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(business.nombre + ' ' + (business.zona || 'Acapulco'))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="grayscale contrast-125"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
