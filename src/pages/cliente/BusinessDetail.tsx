import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
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
import { HOTEL_IMAGES } from '../../constants/images';

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
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
        const { data, error } = await supabase
          .from('establishments')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setBusiness(data);
      } catch (err) {
        console.error("Error fetching business:", err);
        // Fallback mock data
        setBusiness({
          id,
          nombre: 'Establecimiento Demo',
          tipo: 'hotel',
          zona: 'Zona Dorada',
          descripcion: 'Una experiencia única frente al mar con los mejores servicios y atención personalizada.',
          estrellas: 4.8,
          telefono: '+52 744 123 4567',
          amenidades: ['wifi', 'pool', 'parking', 'pet'],
          galeria: [HOTEL_IMAGES.EXTERIOR, HOTEL_IMAGES.ROOM, HOTEL_IMAGES.POOL]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', id)
        .order('created_at', { ascending: false });
      
      if (!error) setReviews(data || []);
    };

    fetchReviews();

    const subscription = supabase
      .channel('reviews_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `business_id=eq.${id}` }, () => {
        fetchReviews();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const handleReserve = async () => {
    if (!checkIn || !checkOut) {
      alert('Por favor selecciona las fechas de tu estancia');
      return;
    }
    setReserving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Por favor inicia sesión para reservar');
        return;
      }

      // 1. Guardar en base de datos para historial
      await supabase.from('reservations').insert({
        user_id: session.user.id,
        business_id: id,
        business_name: business.nombre,
        business_image: business.imagen || business.image || business.galeria?.[0] || HOTEL_IMAGES.EXTERIOR,
        status: 'confirmada',
        check_in: checkIn,
        check_out: checkOut,
        nights,
        total_price: totalPrice || basePrice,
        guests
      });

      // 2. Generar mensaje de WhatsApp
      const centralWhatsApp = '+525624222449';
      const customerName = session.user.user_metadata?.full_name || 'Cliente';
      const message = `*NUEVA RESERVA - AcaEnVivo*%0A%0A` +
                     `*Establecimiento:* ${business.nombre}%0A` +
                     `*Categoría:* ${business.tipo.toUpperCase()}%0A` +
                     `*Zona:* ${business.zona || 'Acapulco'}%0A` +
                     `*Entrada:* ${checkIn}%0A` +
                     `*Salida:* ${checkOut}%0A` +
                     `*Noches:* ${nights}%0A` +
                     `*Huéspedes:* ${guests}%0A` +
                     `*Total Estimado:* $${(totalPrice || basePrice).toLocaleString()}%0A%0A` +
                     `*Cliente:* ${customerName}%0A` +
                     `*Email:* ${session.user.email}%0A%0A` +
                     `_Hola, me gustaría confirmar la disponibilidad para estas fechas._`;

      // 3. Abrir WhatsApp
      window.open(`https://wa.me/${centralWhatsApp.replace('+', '')}?text=${message}`, '_blank');

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Por favor inicia sesión para dejar una reseña');
        return;
      }

      const { error } = await supabase.from('reviews').insert({
        business_id: id,
        user_id: session.user.id,
        user_name: session.user.user_metadata?.full_name || 'Usuario',
        user_photo: session.user.user_metadata?.avatar_url || '',
        rating: newReview.rating,
        comment: newReview.comment
      });

      if (error) throw error;
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 px-6 lg:px-0">
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

                <div className="space-y-8">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted font-medium italic">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-none flex items-center justify-center overflow-hidden">
                            {review.user_photo ? (
                              <img src={review.user_photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-dark uppercase tracking-tight">{review.user_name}</p>
                            <p className="text-[10px] text-muted font-bold uppercase">{new Date(review.created_at).toLocaleDateString()}</p>
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
            </div>

            <div className="border-t border-gray-100 pt-8">
              <h2 className="text-xl font-black text-dark mb-4">Descripción</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">
                {business.descripcion}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white p-6 rounded-sm shadow-xl border border-gray-200 sticky top-24 space-y-6">
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
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleReserve}
                  disabled={reserving}
                  className="w-full py-5 bg-primary text-white rounded-none font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {reserving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <Calendar className="w-5 h-5" />
                      Ver disponibilidad
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuccess(false)}
            className="fixed inset-0 z-[300] bg-dark/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-12 rounded-none text-center max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSuccess(false)}
                className="absolute top-4 right-4 text-muted hover:text-dark transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
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
