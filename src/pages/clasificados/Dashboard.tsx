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
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type Tab = 'anuncio' | 'disponibilidad' | 'contacto' | 'fotos' | 'rendimiento';

export default function ClasificadosDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('anuncio');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
    "https://picsum.photos/seed/condesa1/800/600",
    "https://picsum.photos/seed/condesa2/800/600",
    "https://picsum.photos/seed/condesa3/800/600"
  ]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);

  // Stats State
  const stats = {
    phoneClicks: 84,
    views: 1240,
    interestedToday: 12
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
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
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D3436] font-sans pb-32">
      {/* Header */}
      <header className="bg-[#FF7F50] text-white px-6 py-8 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <Home className="w-8 h-8 text-[#FF7F50]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Mis Clasificados</h1>
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Autogestión de Rentas
            </p>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="flex gap-2 p-4 overflow-x-auto no-scrollbar bg-white border-b border-orange-50 sticky top-0 z-30 shadow-sm">
        {[
          { id: 'anuncio', label: 'Anuncio', icon: Home },
          { id: 'disponibilidad', label: 'Disponibilidad', icon: Calendar },
          { id: 'contacto', label: 'Contacto', icon: Smartphone },
          { id: 'fotos', label: 'Fotos', icon: Camera },
          { id: 'rendimiento', label: 'Rendimiento', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-[#FF7F50] text-white shadow-lg scale-105" 
                : "bg-orange-50 text-orange-300 hover:bg-orange-100"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'anuncio' && (
            <motion.div
              key="anuncio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-orange-50 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-300 ml-1">Título del Anuncio</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-orange-50/30 border-2 border-orange-50 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#FF7F50]/30 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-300 ml-1">Descripción</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-orange-50/30 border-2 border-orange-50 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#FF7F50]/30 transition-all h-32 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-300 ml-1">Precio por Noche (MXN)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-orange-50/30 border-2 border-orange-50 rounded-2xl p-4 pl-12 text-sm font-bold focus:outline-none focus:border-[#FF7F50]/30 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-orange-300 ml-1">Personas</label>
                    <div className="flex items-center bg-orange-50/30 rounded-2xl border-2 border-orange-50 p-2">
                      <Users className="w-3 h-3 text-orange-400 mr-2" />
                      <input type="number" value={capacity.people} onChange={(e) => setCapacity({...capacity, people: Number(e.target.value)})} className="bg-transparent w-full text-xs font-bold focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-orange-300 ml-1">Cuartos</label>
                    <div className="flex items-center bg-orange-50/30 rounded-2xl border-2 border-orange-50 p-2">
                      <Bed className="w-3 h-3 text-orange-400 mr-2" />
                      <input type="number" value={capacity.bedrooms} onChange={(e) => setCapacity({...capacity, bedrooms: Number(e.target.value)})} className="bg-transparent w-full text-xs font-bold focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-orange-300 ml-1">Baños</label>
                    <div className="flex items-center bg-orange-50/30 rounded-2xl border-2 border-orange-50 p-2">
                      <Bath className="w-3 h-3 text-orange-400 mr-2" />
                      <input type="number" value={capacity.bathrooms} onChange={(e) => setCapacity({...capacity, bathrooms: Number(e.target.value)})} className="bg-transparent w-full text-xs font-bold focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-300 ml-1">Amenidades</label>
                  <div className="grid grid-cols-2 gap-2">
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
                          "flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left",
                          amenities.includes(amenity.id) 
                            ? "bg-orange-50 border-[#FF7F50] text-[#FF7F50]" 
                            : "bg-gray-50 border-transparent text-gray-400"
                        )}
                      >
                        <amenity.icon className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">{amenity.id}</span>
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
              className="space-y-6"
            >
              <div className={cn(
                "p-8 rounded-[2.5rem] shadow-xl border transition-all duration-500",
                isAvailable ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
              )}>
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className={cn(
                    "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg",
                    isAvailable ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                  )}>
                    <Calendar className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className={cn("text-xl font-black uppercase tracking-tighter", isAvailable ? "text-emerald-700" : "text-rose-700")}>
                      {isAvailable ? "Disponible este fin" : "No Disponible"}
                    </h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                      {isAvailable ? "Tu anuncio es visible para todos" : "Tu anuncio está oculto temporalmente"}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={cn(
                      "w-20 h-10 rounded-full transition-all relative p-1",
                      isAvailable ? "bg-emerald-500" : "bg-rose-500"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full bg-white shadow-md transition-all",
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
              className="space-y-6"
            >
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-orange-50 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-300 ml-1">WhatsApp de Contacto</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input 
                      type="tel" 
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-orange-50/30 border-2 border-orange-50 rounded-2xl p-4 pl-12 text-sm font-bold focus:outline-none focus:border-[#FF7F50]/30 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50/30 rounded-2xl border-2 border-orange-50">
                  <div>
                    <p className="text-xs font-black text-[#FF7F50] uppercase">Ubicación Exacta</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Mostrar mapa en el anuncio</p>
                  </div>
                  <button 
                    onClick={() => setShowExactLocation(!showExactLocation)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative p-1",
                      showExactLocation ? "bg-[#FF7F50]" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white shadow-md transition-all",
                      showExactLocation ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>

                <button className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
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
              className="space-y-6"
            >
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-orange-50 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-300 ml-1">Galería de Fotos</h3>
                  <label className="bg-[#FF7F50] text-white p-2 rounded-xl cursor-pointer hover:bg-[#FF7F50]/90 transition-colors shadow-lg shadow-orange-500/20">
                    <Plus className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-orange-50">
                      <img src={photo} alt={`Property ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        <button 
                          onClick={() => setMainPhotoIndex(index)}
                          className={cn(
                            "w-full py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                            mainPhotoIndex === index ? "bg-emerald-500 text-white" : "bg-white text-[#FF7F50]"
                          )}
                        >
                          {mainPhotoIndex === index ? 'Principal' : 'Hacer Principal'}
                        </button>
                        <button 
                          onClick={() => removePhoto(index)}
                          className="w-full py-1.5 bg-rose-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest"
                        >
                          Eliminar
                        </button>
                      </div>
                      {mainPhotoIndex === index && (
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                          Foto Principal
                        </div>
                      )}
                    </div>
                  ))}
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-orange-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-orange-50 transition-all">
                    <Camera className="w-6 h-6 text-orange-300" />
                    <span className="text-[8px] font-black text-orange-300 uppercase">Añadir Foto</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
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
              className="space-y-6"
            >
              <div className="bg-[#FF7F50] rounded-[2.5rem] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                
                <div className="flex items-center justify-between relative z-10">
                  <h2 className="text-sm font-black uppercase tracking-widest text-orange-100">Rendimiento del Anuncio</h2>
                  <TrendingUp className="w-5 h-5 text-orange-100" />
                </div>

                <div className="grid grid-cols-1 gap-6 relative z-10">
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                        <Eye className="w-5 h-5 text-[#FF7F50]" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">Vistas Totales</span>
                    </div>
                    <span className="text-2xl font-black">{stats.views}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">Clics WhatsApp</span>
                    </div>
                    <span className="text-2xl font-black">{stats.phoneClicks}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">Interesados Hoy</span>
                    </div>
                    <span className="text-2xl font-black">{stats.interestedToday}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 border border-orange-50 text-center space-y-2">
                <p className="text-[10px] font-black text-orange-300 uppercase tracking-widest">Consejo de Harold</p>
                <p className="text-xs font-bold text-[#2D3436]">"Sube fotos de la alberca con buena luz para aumentar tus clics en un 40%"</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
        <button
          onClick={handleSaveChanges}
          disabled={saving}
          className="w-full py-5 bg-[#FF7F50] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
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
            className="fixed bottom-32 left-1/2 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Anuncio actualizado con éxito</span>
            <button onClick={() => setShowToast(false)}>
              <X className="w-4 h-4 opacity-50" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
