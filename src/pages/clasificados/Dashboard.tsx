import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Zap, 
  Camera, 
  Calendar,
  TrendingUp,
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  CheckCircle2, 
  Save, 
  Loader2, 
  Smartphone, 
  Eye, 
  MessageCircle,
  Trash2,
  Plus,
  X,
  ChevronRight,
  Heart,
  ShieldCheck,
  Waves,
  Dog
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { CameraModal } from '../../components/CameraModal';
import { HOTEL_IMAGES } from '../../constants/images';

import { useNavigate, useLocation } from 'react-router-dom';

type Tab = 'anuncio' | 'disponibilidad' | 'contacto' | 'fotos' | 'rendimiento';

export default function ClasificadosDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = (queryParams.get('tab') as Tab) || 'anuncio';

  const setActiveTab = (tab: Tab) => {
    navigate(`/clasificados?tab=${tab}`);
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);

  // Property State
  const [title, setTitle] = useState("Depa con vista al mar en Condesa");
  const [description, setDescription] = useState("Hermoso departamento remodelado con la mejor vista de la bahía. Totalmente equipado.");
  const [price, setPrice] = useState(2500);
  const [capacity, setCapacity] = useState({ people: 6, bedrooms: 3, bathrooms: 2 });
  const [amenities, setAmenities] = useState<string[]>(['Alberca privada', 'Seguridad 24h']);

  // Availability State
  const [isAvailable, setIsAvailable] = useState(true);

  // Contact State
  const [whatsapp, setWhatsapp] = useState("+52 744 123 4567");
  const [showExactLocation, setShowExactLocation] = useState(false);

  // Photos State
  const [photos, setPhotos] = useState<string[]>([
    HOTEL_IMAGES.EXTERIOR,
    HOTEL_IMAGES.ROOM,
    HOTEL_IMAGES.POOL
  ]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);

  // Stats State
  const stats = {
    phoneClicks: 84,
    views: 1240,
    interestedToday: 12
  };

  useEffect(() => {
    const fetchEstablishment = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', session.user.id)
        .eq('tipo', 'clasificados')
        .single();

      if (data) {
        setEstablishmentId(data.id);
        setTitle(data.nombre);
        setDescription(data.descripcion || "");
        setPrice(data.promocion ? parseInt(data.promocion.replace(/[^0-9]/g, '')) : 2500);
        setIsAvailable(data.abierto);
        setWhatsapp(data.whatsapp || "");
        setPhotos(data.galeria || [HOTEL_IMAGES.EXTERIOR]);
        setAmenities(data.amenidades || []);
      }
      setLoading(false);
    };

    fetchEstablishment();
  }, []);

  const handleSaveChanges = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const updateData = {
        nombre: title,
        descripcion: description,
        promocion: `$${price} MXN`,
        abierto: isAvailable,
        whatsapp: whatsapp,
        galeria: photos,
        amenidades: amenities,
        owner_id: session.user.id,
        tipo: 'clasificados'
      };

      let error;
      if (establishmentId) {
        const { error: err } = await supabase
          .from('establishments')
          .update(updateData)
          .eq('id', establishmentId);
        error = err;
      } else {
        const { data, error: err } = await supabase
          .from('establishments')
          .insert(updateData)
          .select()
          .single();
        error = err;
        if (data) setEstablishmentId(data.id);
      }

      if (error) throw error;

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Error saving establishment:", err);
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    if (mainPhotoIndex === index) setMainPhotoIndex(0);
    else if (mainPhotoIndex > index) setMainPhotoIndex(prev => prev - 1);
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center shadow-lg shadow-primary/20">
            <Home className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-dark tracking-tighter uppercase leading-none">Mis Clasificados</h1>
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" /> Autogestión de Rentas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-none border border-gray-100 shadow-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black text-dark uppercase tracking-widest">Gestión de Anuncios</span>
        </div>
      </div>

      {/* Main Content */}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto w-full px-4 lg:px-0">
        <AnimatePresence mode="wait">
          {activeTab === 'anuncio' && (
            <motion.div
              key="anuncio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-none p-6 lg:p-10 shadow-xl shadow-black/5 border border-gray-100 space-y-6 lg:space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Título del Anuncio</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-4 lg:p-5 text-xs lg:text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all uppercase tracking-tight"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Descripción</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-4 lg:p-5 text-xs lg:text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all h-32 resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Precio por Noche (MXN)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-4 lg:p-5 pl-12 lg:pl-14 text-xs lg:text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all tracking-widest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 lg:gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-muted ml-1 lg:ml-2">Personas</label>
                    <div className="flex items-center bg-gray-50 rounded-none border-2 border-gray-100 p-3 lg:p-4">
                      <Users className="w-3 h-3 lg:w-4 lg:h-4 text-primary mr-2 lg:mr-3" />
                      <input type="number" value={capacity.people} onChange={(e) => setCapacity({...capacity, people: Number(e.target.value)})} className="bg-transparent w-full text-[10px] lg:text-xs font-black focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-muted ml-1 lg:ml-2">Cuartos</label>
                    <div className="flex items-center bg-gray-50 rounded-none border-2 border-gray-100 p-3 lg:p-4">
                      <Bed className="w-3 h-3 lg:w-4 lg:h-4 text-primary mr-2 lg:mr-3" />
                      <input type="number" value={capacity.bedrooms} onChange={(e) => setCapacity({...capacity, bedrooms: Number(e.target.value)})} className="bg-transparent w-full text-[10px] lg:text-xs font-black focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-muted ml-1 lg:ml-2">Baños</label>
                    <div className="flex items-center bg-gray-50 rounded-none border-2 border-gray-100 p-3 lg:p-4">
                      <Bath className="w-3 h-3 lg:w-4 lg:h-4 text-primary mr-2 lg:mr-3" />
                      <input type="number" value={capacity.bathrooms} onChange={(e) => setCapacity({...capacity, bathrooms: Number(e.target.value)})} className="bg-transparent w-full text-[10px] lg:text-xs font-black focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Amenidades</label>
                  <div className="grid grid-cols-2 gap-2 lg:gap-3">
                    {[
                      { id: 'Alberca privada', icon: Waves },
                      { id: 'Acceso a playa', icon: MapPin },
                      { id: 'Seguridad 24h', icon: ShieldCheck },
                      { id: 'Pet Friendly', icon: Dog },
                    ].map((amenity) => (
                      <button
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={cn(
                          "flex items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-none border-2 transition-all text-left",
                          amenities.includes(amenity.id) 
                            ? "bg-primary/5 border-primary/20 text-primary" 
                            : "bg-gray-50 border-transparent text-muted"
                        )}
                      >
                        <amenity.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">{amenity.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'disponibilidad' && (
            <motion.div
              key="disponibilidad"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className={cn(
                "p-10 rounded-none shadow-xl border transition-all duration-500",
                isAvailable ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
              )}>
                <div className="flex flex-col items-center text-center space-y-8">
                  <div className={cn(
                    "w-24 h-24 rounded-none flex items-center justify-center shadow-lg",
                    isAvailable ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                  )}>
                    <Calendar className="w-12 h-12" />
                  </div>
                  <div>
                    <h2 className={cn("text-2xl font-black uppercase tracking-tighter", isAvailable ? "text-emerald-700" : "text-rose-700")}>
                      {isAvailable ? "Disponible este fin" : "No Disponible"}
                    </h2>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mt-3">
                      {isAvailable ? "Tu anuncio es visible para todos" : "Tu anuncio está oculto temporalmente"}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={cn(
                      "w-20 h-10 rounded-none transition-all relative p-1.5",
                      isAvailable ? "bg-emerald-500" : "bg-rose-500"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-none bg-white shadow-md transition-all",
                      isAvailable ? "translate-x-10" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'contacto' && (
            <motion.div
              key="contacto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-none p-10 shadow-xl shadow-black/5 border border-gray-100 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">WhatsApp de Contacto</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <input 
                      type="tel" 
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 pl-14 text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all tracking-widest"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-none border-2 border-gray-100">
                  <div>
                    <p className="text-xs font-black text-primary uppercase tracking-widest">Ubicación Exacta</p>
                    <p className="text-[9px] font-bold text-muted uppercase mt-1">Mostrar mapa en el anuncio</p>
                  </div>
                  <button 
                    onClick={() => setShowExactLocation(!showExactLocation)}
                    className={cn(
                      "w-14 h-7 rounded-none transition-all relative p-1.5",
                      showExactLocation ? "bg-primary" : "bg-gray-300"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-none bg-white shadow-md transition-all",
                      showExactLocation ? "translate-x-7" : "translate-x-0"
                    )} />
                  </button>
                </div>

                <button className="w-full py-5 bg-emerald-500 text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Eye className="w-5 h-5" />
                  Ver cómo me contactarán
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'fotos' && (
            <motion.div
              key="fotos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-none p-10 shadow-xl shadow-black/5 border border-gray-100 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Galería de Fotos</h3>
                  <button 
                    onClick={() => setShowCamera(true)}
                    className="bg-primary text-white p-3 rounded-none cursor-pointer hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-none overflow-hidden group border-2 border-gray-100 shadow-sm">
                      <img src={photo} alt={`Property ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                        <button 
                          onClick={() => setMainPhotoIndex(index)}
                          className={cn(
                            "w-full py-2 rounded-none text-[9px] font-black uppercase tracking-widest transition-all",
                            mainPhotoIndex === index ? "bg-emerald-500 text-white" : "bg-white text-primary"
                          )}
                        >
                          {mainPhotoIndex === index ? 'Principal' : 'Hacer Principal'}
                        </button>
                        <button 
                          onClick={() => removePhoto(index)}
                          className="w-full py-2 bg-rose-500 text-white rounded-none text-[9px] font-black uppercase tracking-widest"
                        >
                          Eliminar
                        </button>
                      </div>
                      {mainPhotoIndex === index && (
                        <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 rounded-none text-[8px] font-black uppercase tracking-widest shadow-lg">
                          Foto Principal
                        </div>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowCamera(true)}
                    className="aspect-square rounded-none border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-all"
                  >
                    <Camera className="w-8 h-8 text-muted" />
                    <span className="text-[9px] font-black text-muted uppercase tracking-widest">Añadir Foto</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rendimiento' && (
            <motion.div
              key="rendimiento"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-dark rounded-none p-10 text-white shadow-2xl space-y-10 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-none blur-3xl" />
                
                <div className="flex items-center justify-between relative z-10">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Rendimiento del Anuncio</h2>
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>

                <div className="grid grid-cols-1 gap-6 relative z-10">
                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-none border border-white/10">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-primary/20 rounded-none flex items-center justify-center">
                        <Eye className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Vistas Totales</span>
                    </div>
                    <span className="text-3xl font-black tracking-tighter">{stats.views}</span>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-none border border-white/10">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-emerald-400/20 rounded-none flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Clics WhatsApp</span>
                    </div>
                    <span className="text-3xl font-black tracking-tighter">{stats.phoneClicks}</span>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-none border border-white/10">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-amber-400/20 rounded-none flex items-center justify-center">
                        <Users className="w-6 h-6 text-amber-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Interesados Hoy</span>
                    </div>
                    <span className="text-3xl font-black tracking-tighter">{stats.interestedToday}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-none p-8 border border-gray-100 text-center space-y-3 shadow-sm">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Consejo de Harold</p>
                <p className="text-xs font-bold text-dark tracking-tight leading-relaxed">"Sube fotos de la alberca con buena luz para aumentar tus clics en un 40%"</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
        <button
          onClick={handleSaveChanges}
          disabled={saving}
          className="w-full py-6 bg-primary text-white rounded-none font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-primary/90"
        >
          {saving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Save className="w-6 h-6" />
              Guardar Anuncio
            </>
          )}
        </button>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-36 left-1/2 bg-dark text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 border border-white/10"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Anuncio actualizado con éxito</span>
            <button onClick={() => setShowToast(false)}>
              <X className="w-5 h-5 opacity-50" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CameraModal 
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(img) => setPhotos(prev => [...prev, img])}
      />
    </div>
  );
}
