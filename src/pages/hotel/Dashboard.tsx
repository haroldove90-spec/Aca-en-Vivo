import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Minus, 
  AlertCircle, 
  Loader2, 
  Clock, 
  Settings, 
  Save, 
  Camera, 
  Trash2, 
  Wifi, 
  Waves, 
  Dog, 
  ParkingCircle, 
  Phone, 
  CheckCircle2,
  X,
  Star,
  User,
  RotateCcw,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CameraModal } from '../../components/CameraModal';
import { HOTEL_IMAGES } from '../../constants/images';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAcaData } from '../../hooks/useAcaData';
import { BaseEntity, EntityStatus } from '../../constants/mockData';

type Tab = 'inventario' | 'perfil' | 'galeria' | 'promociones' | 'reservas';

export default function HotelDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, updateEntity, deleteEntity, getEntitiesByType } = useAcaData();
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = (queryParams.get('tab') as Tab) || 'inventario';

  const setActiveTab = (tab: Tab) => {
    navigate(`/hotel?tab=${tab}`);
  };

  const hotels = getEntitiesByType('hotel');
  // For demo, we'll use the first hotel as the "current" one
  const [selectedHotel, setSelectedHotel] = useState<BaseEntity | null>(hotels[0] || null);
  
  const [loading, setLoading] = useState(true);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [reservas, setReservas] = useState<any[]>([
    { id: '1', user_id: 'user_12345', created_at: new Date().toISOString(), guests: 2, status: 'pendiente' },
    { id: '2', user_id: 'user_67890', created_at: new Date().toISOString(), guests: 4, status: 'confirmada' },
  ]);
  const [amenities, setAmenities] = useState<string[]>(['wifi', 'pool']);
  const [promo, setPromo] = useState('Desayuno buffet incluido en tu estancia este fin de semana.');
  const [isPremium, setIsPremium] = useState(true);

  useEffect(() => {
    if (hotels.length > 0 && !selectedHotel) {
      setSelectedHotel(hotels[0]);
    }
    setTimeout(() => setLoading(false), 800);
  }, [hotels]);

  const handleUpdateInventory = async (delta: number) => {
    if (!selectedHotel) return;
    const current = optimisticCount ?? selectedHotel.capacidad ?? 0;
    const next = Math.max(0, current + delta);
    setOptimisticCount(next);
    updateEntity(selectedHotel.id, { capacidad: next });
  };

  const handleQuickAction = async (value: number) => {
    if (!selectedHotel) return;
    setOptimisticCount(value);
    updateEntity(selectedHotel.id, { capacidad: value });
  };

  const handleSaveChanges = async () => {
    if (!selectedHotel) return;
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateEntity(selectedHotel.id, selectedHotel);
    setSaving(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeleteHotel = () => {
    if (!selectedHotel) return;
    if (window.confirm('¿Estás seguro de que deseas dar de baja este hotel?')) {
      deleteEntity(selectedHotel.id);
      setSelectedHotel(null);
    }
  };

  const handleAddPhoto = (img: string) => {
    if (selectedHotel) {
      updateEntity(selectedHotel.id, { imagen: img });
    }
    setShowCamera(false);
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedHotel) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateEntity(selectedHotel.id, { imagen: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateReservaStatus = (id: string, status: string) => {
    setReservas(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const toggleAmenity = (id: string) => {
    setAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  if (loading || !selectedHotel) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="w-12 h-12 text-[#00A8CC] animate-spin" />
      </div>
    );
  }

  const displayCount = optimisticCount ?? selectedHotel.capacidad ?? 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center shadow-lg shadow-primary/20">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-dark tracking-tighter uppercase leading-none">Admin <span className="text-primary">Pro</span></h1>
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mt-1 truncate max-w-[200px]">
              {selectedHotel.nombre}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-none border border-gray-100 shadow-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black text-dark uppercase tracking-widest">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 lg:px-0">
        <AnimatePresence mode="wait">
          {activeTab === 'inventario' && (
            <motion.div
              key="inventario"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-none p-6 lg:p-10 shadow-xl shadow-black/5 border border-gray-100 text-center space-y-6 lg:space-y-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-4">Disponibles Ahora</p>
                  <div className={cn(
                    "text-[8rem] lg:text-[12rem] font-black leading-none tabular-nums transition-colors duration-500 tracking-tighter",
                    displayCount > 5 ? "text-emerald-500" : displayCount > 0 ? "text-amber-500" : "text-rose-500"
                  )}>
                    {displayCount}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 lg:gap-10">
                  <button
                    onClick={() => handleUpdateInventory(-1)}
                    disabled={displayCount <= 0}
                    className="w-16 h-16 lg:w-24 lg:h-24 rounded-none bg-gray-50 flex items-center justify-center active:scale-90 transition-all disabled:opacity-20 hover:bg-gray-100"
                  >
                    <Minus className="w-6 h-6 lg:w-10 lg:h-10 text-dark stroke-[3]" />
                  </button>
                  <button
                    onClick={() => handleUpdateInventory(1)}
                    className="w-16 h-16 lg:w-24 lg:h-24 rounded-none bg-primary/10 border-2 border-primary/20 flex items-center justify-center active:scale-90 transition-all hover:bg-primary/20"
                  >
                    <Plus className="w-6 h-6 lg:w-10 lg:h-10 text-primary stroke-[3]" />
                  </button>
                </div>
 
                <div className="grid grid-cols-2 gap-3 lg:gap-4 pt-4 lg:pt-6">
                  <button
                    onClick={() => handleQuickAction(0)}
                    className="py-4 lg:py-5 rounded-none bg-rose-50 text-rose-600 font-black text-[8px] lg:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-rose-100"
                  >
                    <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                    Agotado
                  </button>
                  <button
                    onClick={() => handleQuickAction(100)}
                    className="py-4 lg:py-5 rounded-none bg-gray-50 text-dark font-black text-[8px] lg:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-gray-100"
                  >
                    <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5" />
                    Restablecer
                  </button>
                </div>
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
                    value={selectedHotel.nombre}
                    onChange={(e) => setSelectedHotel({...selectedHotel, nombre: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all uppercase tracking-tight"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Descripción Corta</label>
                  <textarea 
                    value={selectedHotel.descripcion}
                    onChange={(e) => setSelectedHotel({...selectedHotel, descripcion: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 text-sm font-bold text-dark focus:outline-none focus:border-primary/30 transition-all h-32 resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">WhatsApp de Reservas</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input 
                      type="tel" 
                      value={selectedHotel.whatsapp}
                      onChange={(e) => setSelectedHotel({...selectedHotel, whatsapp: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 pl-14 text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all tracking-widest"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Estado del Hotel</label>
                  <select 
                    value={selectedHotel.status}
                    onChange={(e) => setSelectedHotel({...selectedHotel, status: e.target.value as EntityStatus})}
                    className={cn(
                      "w-full p-5 font-black text-[10px] uppercase tracking-widest border-2 transition-all appearance-none",
                      selectedHotel.status === 'activo' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                      selectedHotel.status === 'pendiente' ? "bg-amber-50 border-amber-100 text-amber-600" :
                      "bg-rose-50 border-rose-100 text-rose-600"
                    )}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
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
                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative aspect-square rounded-none overflow-hidden group shadow-sm">
                      <img src={selectedHotel.imagen} alt="Hotel" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => setShowCamera(true)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </div>
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

          {activeTab === 'reservas' && (
            <motion.div
              key="reservas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-dark uppercase tracking-tight">Reservas Entrantes</h2>
                <span className="bg-primary/10 text-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                  {reservas.length} Total
                </span>
              </div>

              {reservas.length === 0 ? (
                <div className="bg-white p-12 text-center border border-gray-100 space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-none flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">No hay reservas pendientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservas.map((res) => (
                    <div key={res.id} className="bg-white p-6 border border-gray-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-none flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-dark uppercase tracking-tight">Cliente #{res.user_id.slice(0, 5)}</p>
                            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
                              {new Date(res.created_at).toLocaleDateString()} • {res.guests || 2} Personas
                            </p>
                          </div>
                        </div>
                        <span className={cn(
                          "px-3 py-1 text-[9px] font-black uppercase tracking-widest",
                          res.status === 'confirmada' ? "bg-emerald-100 text-emerald-600" : 
                          res.status === 'cancelada' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                        )}>
                          {res.status}
                        </span>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-50">
                        {res.status !== 'confirmada' && (
                          <button 
                            onClick={() => handleUpdateReservaStatus(res.id, 'confirmada')}
                            className="flex-1 py-3 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all"
                          >
                            Aceptar
                          </button>
                        )}
                        {res.status !== 'cancelada' && (
                          <button 
                            onClick={() => handleUpdateReservaStatus(res.id, 'cancelada')}
                            className="flex-1 py-3 bg-rose-50 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all"
                          >
                            Rechazar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40 flex gap-4">
        <button
          onClick={handleDeleteHotel}
          className="w-20 h-20 bg-rose-500 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all"
        >
          <Trash2 className="w-8 h-8" />
        </button>
        <button
          onClick={handleSaveChanges}
          disabled={saving}
          className="flex-1 py-6 bg-primary text-white rounded-none font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-primary/90"
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
        onCapture={handleAddPhoto}
      />
    </div>
  );
}
