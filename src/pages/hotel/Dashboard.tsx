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

type Tab = 'inventario' | 'perfil' | 'galeria' | 'promociones';

export default function HotelDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('inventario');
  const [inventario, setInventario] = useState<any>(null);
  const [establecimiento, setEstablecimiento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

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
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans pb-32">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00A8CC] rounded-xl flex items-center justify-center shadow-lg shadow-[#00A8CC]/20">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-400 leading-none">Admin Pro</h1>
            <p className="text-lg font-black text-[#142850] tracking-tight truncate max-w-[180px]">
              {hotelName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
          <Clock className="w-3 h-3 text-[#00A8CC]" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            {inventario?.ultima_actualizacion?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Sincronizando...'}
          </span>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="flex gap-2 p-4 overflow-x-auto no-scrollbar bg-white border-b border-slate-100 sticky top-[73px] z-20">
        {[
          { id: 'inventario', label: 'Inventario', icon: RotateCcw },
          { id: 'perfil', label: 'Perfil', icon: FileText },
          { id: 'galeria', label: 'Galería', icon: ImageIcon },
          { id: 'promociones', label: 'Promos', icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-[#00A8CC] text-white shadow-lg shadow-[#00A8CC]/20 scale-105" 
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="p-6 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'inventario' && (
            <motion.div
              key="inventario"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Critical Inventory Card */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center space-y-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Disponibles Ahora</p>
                  <div className={cn(
                    "text-[10rem] font-black leading-none tabular-nums transition-colors duration-500",
                    displayCount > 5 ? "text-emerald-500" : displayCount > 0 ? "text-amber-500" : "text-rose-500"
                  )}>
                    {displayCount}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={() => handleUpdateInventory(-1)}
                    disabled={displayCount <= 0}
                    className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center active:scale-90 transition-all disabled:opacity-20"
                  >
                    <Minus className="w-8 h-8 text-slate-600 stroke-[3]" />
                  </button>
                  <button
                    onClick={() => handleUpdateInventory(1)}
                    disabled={displayCount >= (inventario?.habitaciones_totales ?? 99)}
                    className="w-20 h-20 rounded-full bg-[#00A8CC]/10 border-2 border-[#00A8CC]/20 flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Plus className="w-8 h-8 text-[#00A8CC] stroke-[3]" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={() => handleQuickAction(0)}
                    className="py-4 rounded-2xl bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Sold Out
                  </button>
                  <button
                    onClick={() => handleQuickAction(inventario?.habitaciones_totales ?? 50)}
                    className="py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restablecer
                  </button>
                </div>
              </div>

              {/* Emergency Toggle */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado de Emergencia</p>
                    <p className="text-xs font-bold text-slate-600">Cerrar preventas al instante</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleQuickAction(0)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    displayCount === 0 ? "bg-rose-500" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
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
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Hotel</label>
                  <input 
                    type="text" 
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#00A8CC]/30 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción Corta</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={150}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-[#00A8CC]/30 transition-all h-24 resize-none"
                  />
                  <p className="text-right text-[8px] font-bold text-slate-400 uppercase">{description.length}/150</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono Recepción</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:outline-none focus:border-[#00A8CC]/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amenidades Activas</label>
                  <div className="grid grid-cols-2 gap-3">
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
                          "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all",
                          amenities.includes(item.id) 
                            ? "bg-[#00A8CC]/5 border-[#00A8CC]/20 text-[#00A8CC]" 
                            : "bg-slate-50 border-transparent text-slate-400"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase">{item.label}</span>
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
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Media Center</label>
                  
                  {/* Dropzone Simulation */}
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleUploadImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="h-40 border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center gap-3 group-hover:bg-slate-50 transition-all">
                      <div className="w-12 h-12 bg-[#00A8CC]/10 rounded-2xl flex items-center justify-center">
                        <Camera className="w-6 h-6 text-[#00A8CC]" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tomar Foto o Subir</p>
                    </div>
                  </div>

                  {/* Image Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                        <img src={img} alt="Hotel" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          onClick={() => deleteImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-rose-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
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
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Promoción del Día</label>
                  <div className="relative">
                    <Zap className="absolute left-4 top-4 w-4 h-4 text-amber-500" />
                    <textarea 
                      value={promo}
                      onChange={(e) => setPromo(e.target.value)}
                      placeholder="Ej: Desayuno incluido..."
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:outline-none focus:border-[#00A8CC]/30 transition-all h-24 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Banner Destacado</p>
                      <p className="text-[8px] font-bold text-amber-600 uppercase">Suscripción Premium Activa</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsPremium(!isPremium)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      isPremium ? "bg-amber-500" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                      isPremium ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
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
          className="w-full py-5 bg-[#00A8CC] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#00A8CC]/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
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
            className="fixed bottom-32 left-1/2 bg-[#142850] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-white/10"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Cambios guardados con éxito</span>
            <button onClick={() => setShowToast(false)}>
              <X className="w-4 h-4 opacity-50" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


