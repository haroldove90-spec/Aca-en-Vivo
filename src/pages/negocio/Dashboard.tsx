import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Zap, 
  Users, 
  MapPin, 
  Eye, 
  Save,
  Loader2,
  CheckCircle2,
  Ship,
  Store,
  Clock,
  MessageCircle,
  Camera,
  Trash2,
  TrendingUp,
  Navigation,
  X,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { CameraModal } from '../../components/CameraModal';
import { HOTEL_IMAGES } from '../../constants/images';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAcaData } from '../../hooks/useAcaData';
import { BaseEntity, EntityStatus } from '../../constants/mockData';

type Tab = 'estado' | 'perfil' | 'ofertas' | 'multimedia' | 'impacto' | 'reservas';

export default function NegocioDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, updateEntity, deleteEntity, getEntitiesByType } = useAcaData();
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = (queryParams.get('tab') as Tab) || 'estado';

  const setActiveTab = (tab: Tab) => {
    navigate(`/negocio?tab=${tab}`);
  };

  const businesses = getEntitiesByType('negocio');
  const [selectedBusiness, setSelectedBusiness] = useState<BaseEntity | null>(businesses[0] || null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'cover' | 'menu' | null>(null);
  const [reservas, setReservas] = useState<any[]>([
    { id: '1', user_id: 'user_12345', created_at: new Date().toISOString(), status: 'pendiente' },
    { id: '2', user_id: 'user_67890', created_at: new Date().toISOString(), status: 'confirmada' },
  ]);

  useEffect(() => {
    if (businesses.length > 0 && !selectedBusiness) {
      setSelectedBusiness(businesses[0]);
    }
    setTimeout(() => setLoading(false), 800);
  }, [businesses]);

  const handleUpdateReservaStatus = (id: string, status: string) => {
    setReservas(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleSaveChanges = async () => {
    if (!selectedBusiness) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('entities')
        .update({
          nombre: selectedBusiness.nombre,
          zona: selectedBusiness.zona,
          whatsapp: selectedBusiness.whatsapp,
          status: selectedBusiness.status,
          descripcion: selectedBusiness.descripcion,
          imagen: selectedBusiness.imagen,
          afluencia: selectedBusiness.afluencia
        })
        .eq('id', selectedBusiness.id);
      
      if (error) throw error;
      
      updateEntity(selectedBusiness.id, selectedBusiness);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error saving business changes:", error);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBusiness = () => {
    if (!selectedBusiness) return;
    if (window.confirm('¿Estás seguro de que deseas dar de baja este negocio?')) {
      deleteEntity(selectedBusiness.id);
      setSelectedBusiness(null);
    }
  };

  const handleToggleOpen = () => {
    if (!selectedBusiness) return;
    const newStatus = selectedBusiness.status === 'activo' ? 'inactivo' : 'activo';
    setSelectedBusiness({...selectedBusiness, status: newStatus as EntityStatus});
    updateEntity(selectedBusiness.id, { status: newStatus as EntityStatus });
  };

  if (loading || !selectedBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F2E1C1]">
        <Loader2 className="w-12 h-12 text-[#142850] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center shadow-lg shadow-primary/20">
            <Ship className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-dark tracking-tighter uppercase leading-none">{selectedBusiness.nombre}</h1>
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
              <Store className="w-3 h-3 text-primary" /> {selectedBusiness.zona}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-none border border-gray-100 shadow-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black text-dark uppercase tracking-widest">Estado en Vivo</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'estado' && (
            <motion.div
              key="estado"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className={cn(
                "p-8 rounded-none shadow-xl border transition-all duration-500",
                selectedBusiness.status === 'activo' ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-200"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-none flex items-center justify-center shadow-lg",
                      selectedBusiness.status === 'activo' ? "bg-emerald-500 text-white" : "bg-gray-400 text-white"
                    )}>
                      <Store className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted">Estado Actual</p>
                      <p className={cn("text-xl font-black uppercase tracking-tight mt-1", selectedBusiness.status === 'activo' ? "text-emerald-700" : "text-gray-600")}>
                        {selectedBusiness.status === 'activo' ? "Abierto / Disponible" : "Cerrado / No Disponible"}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleOpen}
                    className={cn(
                      "w-16 h-8 rounded-none transition-all relative p-1.5",
                      selectedBusiness.status === 'activo' ? "bg-emerald-500" : "bg-gray-300"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-none bg-white shadow-md transition-all",
                      selectedBusiness.status === 'activo' ? "translate-x-8" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-none p-10 shadow-xl shadow-black/5 border border-gray-100 space-y-8">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-dark flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  Nivel de Afluencia
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'baja', label: 'Libre', color: 'emerald', icon: CheckCircle2 },
                    { id: 'media', label: 'Casi Lleno', color: 'amber', icon: Clock },
                    { id: 'alta', label: 'Espera', color: 'rose', icon: AlertCircle },
                  ].map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedBusiness({...selectedBusiness, afluencia: level.id as any})}
                      className={cn(
                        "flex flex-col items-center gap-4 p-6 rounded-none border-2 transition-all active:scale-95",
                        selectedBusiness.afluencia === level.id 
                          ? `bg-${level.color}-50 border-${level.color}-500 text-${level.color}-700 shadow-lg shadow-${level.color}-500/10` 
                          : "bg-gray-50 border-transparent text-muted"
                      )}
                    >
                      <level.icon className="w-8 h-8" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{level.label}</span>
                    </button>
                  ))}
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Nombre Comercial</label>
                  <input 
                    type="text" 
                    value={selectedBusiness.nombre}
                    onChange={(e) => setSelectedBusiness({...selectedBusiness, nombre: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all uppercase tracking-tight"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Zona / Ubicación</label>
                  <input 
                    type="text" 
                    value={selectedBusiness.zona}
                    onChange={(e) => setSelectedBusiness({...selectedBusiness, zona: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all uppercase tracking-tight"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">WhatsApp de Contacto</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input 
                      type="tel" 
                      value={selectedBusiness.whatsapp}
                      onChange={(e) => setSelectedBusiness({...selectedBusiness, whatsapp: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 pl-14 text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all uppercase tracking-tight"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Estado del Negocio</label>
                  <select 
                    value={selectedBusiness.status}
                    onChange={(e) => setSelectedBusiness({...selectedBusiness, status: e.target.value as EntityStatus})}
                    className={cn(
                      "w-full p-5 font-black text-[10px] uppercase tracking-widest border-2 transition-all appearance-none",
                      selectedBusiness.status === 'activo' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                      selectedBusiness.status === 'pendiente' ? "bg-amber-50 border-amber-100 text-amber-600" :
                      "bg-rose-50 border-rose-100 text-rose-600"
                    )}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ofertas' && (
            <motion.div
              key="ofertas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-none p-10 shadow-xl shadow-black/5 border border-gray-100 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Oferta del Día ⚡</label>
                  <textarea 
                    value={selectedBusiness.descripcion}
                    onChange={(e) => setSelectedBusiness({...selectedBusiness, descripcion: e.target.value})}
                    placeholder="Ej: Cubetazo 5x4..."
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-primary/30 transition-all h-32 resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'multimedia' && (
            <motion.div
              key="multimedia"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-none p-10 shadow-xl shadow-black/5 border border-gray-100 space-y-10">
                <div className="space-y-5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Foto de Portada</label>
                  <div className="relative aspect-video rounded-none overflow-hidden bg-gray-100 group shadow-sm">
                    <img src={selectedBusiness.imagen} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => { setCameraTarget('cover'); setShowCamera(true); }}
                        className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-none flex items-center justify-center border border-white/30 text-white"
                      >
                        <Camera className="w-8 h-8" />
                      </button>
                    </div>
                  </div>
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
                <h2 className="text-xl font-black text-dark uppercase tracking-tight">Reservas / Pedidos</h2>
                <span className="bg-primary/10 text-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                  {reservas.length} Total
                </span>
              </div>

              {reservas.length === 0 ? (
                <div className="bg-white p-12 text-center border border-gray-100 space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-none flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">No hay pedidos pendientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservas.map((res) => (
                    <div key={res.id} className="bg-white p-6 border border-gray-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-none flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-dark uppercase tracking-tight">Cliente #{res.user_id.slice(0, 5)}</p>
                            <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
                              {new Date(res.created_at).toLocaleDateString()}
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
                            Confirmar
                          </button>
                        )}
                        {res.status !== 'cancelada' && (
                          <button 
                            onClick={() => handleUpdateReservaStatus(res.id, 'cancelada')}
                            className="flex-1 py-3 bg-rose-50 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all"
                          >
                            Cancelar
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
          onClick={handleDeleteBusiness}
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
            <span className="text-[10px] font-black uppercase tracking-widest">Negocio actualizado con éxito</span>
            <button onClick={() => setShowToast(false)}>
              <X className="w-5 h-5 opacity-50" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CameraModal 
        isOpen={showCamera}
        onClose={() => { setShowCamera(false); setCameraTarget(null); }}
        onCapture={(img) => {
          if (selectedBusiness) {
            updateEntity(selectedBusiness.id, { imagen: img });
          }
          setShowCamera(false);
          setCameraTarget(null);
        }}
      />
    </div>
  );
}
