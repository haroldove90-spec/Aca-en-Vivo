import React, { useState, useEffect, useRef } from 'react';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Plus, 
  Minus, 
  AlertCircle, 
  Loader2, 
  Clock, 
  Bell, 
  BellOff, 
  RotateCcw, 
  Settings, 
  Image as ImageIcon, 
  Zap, 
  Save, 
  Camera, 
  Trash2, 
  Wifi, 
  Waves, 
  Dog, 
  ParkingCircle, 
  Phone, 
  FileText,
  CheckCircle2,
  X,
  Star
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CameraModal } from '../../components/CameraModal';

import { useNavigate, useLocation } from 'react-router-dom';

type Tab = 'inventario' | 'perfil' | 'galeria' | 'promociones';

export default function HotelDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = (queryParams.get('tab') as Tab) || 'inventario';

  const setActiveTab = (tab: Tab) => {
    navigate(`/hotel?tab=${tab}`);
  };
  const [inventario, setInventario] = useState<any>(null);
  const [establecimiento, setEstablecimiento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Form states
  const [hotelName, setHotelName] = useState("Hotel Emporio Acapulco");
  const [description, setDescription] = useState("Ubicado en el corazón de la Zona Dorada, con la mejor vista a la Bahía de Santa Lucía.");
  const [phone, setPhone] = useState("+52 744 469 1000");
  const [amenities, setAmenities] = useState<string[]>(['wifi', 'pool', 'parking']);
  const [promo, setPromo] = useState("Desayuno incluido en estancias de 2 noches");
  const [isPremium, setIsPremium] = useState(true);
  const [images, setImages] = useState<string[]>([
    "https://picsum.photos/seed/h1/300/200",
    "https://picsum.photos/seed/h2/300/200",
    "https://picsum.photos/seed/h3/300/200"
  ]);

  const hotelId = "hotel-2"; // Hotel Emporio Acapulco

  useEffect(() => {
    const invRef = doc(db, 'inventario_hotel', hotelId);
    const estRef = doc(db, 'establecimientos', hotelId);

    const unsubInv = onSnapshot(invRef, (snapshot) => {
      if (snapshot.exists()) {
        setInventario(snapshot.data());
        setOptimisticCount(null);
      }
    });

    const unsubEst = onSnapshot(estRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setEstablecimiento(data);
        setHotelName(data.nombre || "");
      }
      setLoading(false);
    });

    return () => {
      unsubInv();
      unsubEst();
    };
  }, [hotelId]);

  const handleUpdateInventory = async (delta: number) => {
    if (!inventario) return;
    const current = optimisticCount ?? inventario.disponibles_ahora;
    const next = Math.max(0, Math.min(inventario.habitaciones_totales, current + delta));
    setOptimisticCount(next);
    try {
      await updateDoc(doc(db, 'inventario_hotel', hotelId), {
        disponibles_ahora: next,
        ultima_actualizacion: serverTimestamp(),
      });
    } catch (error) {
      setOptimisticCount(null);
    }
  };

  const handleQuickAction = async (value: number) => {
    if (!inventario) return;
    setOptimisticCount(value);
    try {
      await updateDoc(doc(db, 'inventario_hotel', hotelId), {
        disponibles_ahora: value,
        ultima_actualizacion: serverTimestamp(),
      });
    } catch (error) {
      setOptimisticCount(null);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Update establecimiento profile
      await updateDoc(doc(db, 'establecimientos', hotelId), {
        nombre: hotelName,
        descripcion: description,
        telefono: phone,
        amenidades: amenities,
        promocion: promo,
        premium: isPremium,
        ultima_edicion: serverTimestamp()
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (id: string) => {
    setAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="w-12 h-12 text-[#00A8CC] animate-spin" />
      </div>
    );
  }

  const displayCount = optimisticCount ?? inventario?.disponibles_ahora ?? 0;

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center shadow-lg shadow-primary/20">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-dark tracking-tighter uppercase leading-none">Admin <span className="text-primary">Pro</span></h1>
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mt-1 truncate max-w-[200px]">
              {hotelName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-none border border-gray-100 shadow-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black text-dark uppercase tracking-widest">
            {inventario?.ultima_actualizacion?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Sincronizando...'}
          </span>
        </div>
      </div>

      {/* Main Content */}

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'inventario' && (
            <motion.div
              key="inventario"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Critical Inventory Card */}
              <div className="bg-white rounded-none p-10 shadow-xl shadow-black/5 border border-gray-100 text-center space-y-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-4">Disponibles Ahora</p>
                  <div className={cn(
                    "text-[12rem] font-black leading-none tabular-nums transition-colors duration-500 tracking-tighter",
                    displayCount > 5 ? "text-emerald-500" : displayCount > 0 ? "text-amber-500" : "text-rose-500"
                  )}>
                    {displayCount}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-10">
                  <button
                    onClick={() => handleUpdateInventory(-1)}
                    disabled={displayCount <= 0}
                    className="w-24 h-24 rounded-none bg-gray-50 flex items-center justify-center active:scale-90 transition-all disabled:opacity-20 hover:bg-gray-100"
                  >
                    <Minus className="w-10 h-10 text-dark stroke-[3]" />
                  </button>
                  <button
                    onClick={() => handleUpdateInventory(1)}
                    disabled={displayCount >= (inventario?.habitaciones_totales ?? 99)}
                    className="w-24 h-24 rounded-none bg-primary/10 border-2 border-primary/20 flex items-center justify-center active:scale-90 transition-all hover:bg-primary/20"
                  >
                    <Plus className="w-10 h-10 text-primary stroke-[3]" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6">
                  <button
                    onClick={() => handleQuickAction(0)}
                    className="py-5 rounded-none bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-rose-100"
                  >
                    <AlertCircle className="w-5 h-5" />
                    Agotado
                  </button>
                  <button
                    onClick={() => handleQuickAction(inventario?.habitaciones_totales ?? 50)}
                    className="py-5 rounded-none bg-gray-50 text-dark font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-gray-100"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Restablecer
                  </button>
                </div>
              </div>

              {/* Emergency Toggle */}
              <div className="bg-white p-8 rounded-none shadow-xl shadow-black/5 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-none flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Estado de Emergencia</p>
                    <p className="text-xs font-bold text-dark uppercase mt-1">Cerrar preventas al instante</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleQuickAction(0)}
                  className={cn(
                    "w-14 h-7 rounded-none transition-all relative",
                    displayCount === 0 ? "bg-rose-500" : "bg-gray-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-5 h-5 rounded-none bg-white transition-all shadow-sm",
                    displayCount === 0 ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'perfil' && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-none p-10 shadow-xl shadow-black/5 border border-gray-100 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Nombre del Hotel</label>
                  <input 
                    type="text" 
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all uppercase tracking-tight"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Descripción Corta</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={150}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 text-sm font-bold text-dark focus:outline-none focus:border-primary/30 transition-all h-32 resize-none"
                  />
                  <p className="text-right text-[10px] font-black text-muted uppercase tracking-widest">{description.length}/150</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Teléfono Recepción</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 pl-14 text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all tracking-widest"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Amenidades Activas</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'wifi', label: 'WiFi Gratis', icon: Wifi },
                      { id: 'pool', label: 'Alberca', icon: Waves },
                      { id: 'pet', label: 'Pet Friendly', icon: Dog },
                      { id: 'parking', label: 'Estacionamiento', icon: ParkingCircle },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleAmenity(item.id)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-none border-2 transition-all",
                          amenities.includes(item.id) 
                            ? "bg-primary/5 border-primary/20 text-primary" 
                            : "bg-gray-50 border-transparent text-muted"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'galeria' && (
            <motion.div
              key="galeria"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-none p-10 shadow-xl shadow-black/5 border border-gray-100 space-y-8">
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Media Center</label>
                  
                  {/* Dropzone Simulation */}
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleUploadImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="h-48 border-4 border-dashed border-gray-100 rounded-none flex flex-col items-center justify-center gap-4 group-hover:bg-gray-50 transition-all">
                      <button 
                        onClick={() => setShowCamera(true)}
                        className="w-14 h-14 bg-primary/10 rounded-none flex items-center justify-center"
                      >
                        <Camera className="w-7 h-7 text-primary" />
                      </button>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted">Tomar Foto o Subir</p>
                    </div>
                  </div>
 
                  {/* Image Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-none overflow-hidden group shadow-sm">
                        <img src={img} alt="Hotel" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          onClick={() => deleteImage(idx)}
                          className="absolute top-2 right-2 w-8 h-8 bg-rose-500 rounded-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'promociones' && (
            <motion.div
              key="promociones"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-none p-10 shadow-xl shadow-black/5 border border-gray-100 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Promoción del Día</label>
                  <div className="relative">
                    <Zap className="absolute left-5 top-5 w-5 h-5 text-amber-500" />
                    <textarea 
                      value={promo}
                      onChange={(e) => setPromo(e.target.value)}
                      placeholder="Ej: Desayuno incluido..."
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 pl-14 text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all h-32 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-amber-50 rounded-none border border-amber-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-none flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Banner Destacado</p>
                      <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest mt-1">Suscripción Premium Activa</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsPremium(!isPremium)}
                    className={cn(
                      "w-14 h-7 rounded-none transition-all relative",
                      isPremium ? "bg-amber-500" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-5 h-5 rounded-none bg-white transition-all shadow-sm",
                      isPremium ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
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
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-36 left-1/2 bg-dark text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 border border-white/10"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Cambios guardados con éxito</span>
            <button onClick={() => setShowToast(false)}>
              <X className="w-5 h-5 opacity-50" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CameraModal 
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(img) => setImages(prev => [...prev, img])}
      />
    </div>
  );
}


