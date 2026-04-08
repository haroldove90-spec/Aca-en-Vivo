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
  Plus,
  X,
  ChevronRight,
  Bell,
  ArrowLeft,
  Settings2,
  AlertCircle,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { CameraModal } from '../../components/CameraModal';
import { HOTEL_IMAGES } from '../../constants/images';
import { useNavigate } from 'react-router-dom';

import { useAcaData } from '../../hooks/useAcaData';
import { BaseEntity, EntityStatus } from '../../constants/mockData';

type View = 'list' | 'edit' | 'notifications' | 'stats';

export default function ClasificadosDashboard() {
  const navigate = useNavigate();
  const { data, updateEntity, deleteEntity, getEntitiesByType } = useAcaData();
  const [view, setView] = useState<View>('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<BaseEntity | null>(null);

  const properties = getEntitiesByType('clasificado');

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      titulo: 'Propiedad Verificada',
      mensaje: 'Tu propiedad "Villa con alberca privada" ha sido verificada por la agencia.',
      fecha: 'Hace 2 horas',
      leida: false,
      tipo: 'success'
    },
    {
      id: '2',
      titulo: 'Anuncio por Expirar',
      mensaje: 'Tu publicación del Penthouse expira en 3 días. Renueva ahora para mantener tu posición.',
      fecha: 'Hace 1 día',
      leida: true,
      tipo: 'warning'
    }
  ]);

  useEffect(() => {
    // Simular carga
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleToggleAvailability = (id: string, currentStatus: string) => {
    updateEntity(id, { status: currentStatus === 'activo' ? 'inactivo' : 'activo' });
  };

  const handleEditProperty = (property: BaseEntity) => {
    setSelectedProperty(property);
    setView('edit');
  };

  const handleSaveProperty = async () => {
    if (!selectedProperty) return;
    setSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500));
    updateEntity(selectedProperty.id, selectedProperty);
    setSaving(false);
    setView('list');
  };

  const handleDeleteProperty = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas dar de baja este anuncio?')) {
      deleteEntity(id);
      setView('list');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-[#FF7F50] animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Cargando tu panel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FF7F50] rounded-none flex items-center justify-center shadow-xl shadow-[#FF7F50]/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-dark tracking-tighter uppercase leading-none">Panel de Anfitrión</h1>
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mt-1">Gestiona tus rentas vacacionales</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setView('notifications')}
            className="relative w-10 h-10 bg-white border border-gray-100 flex items-center justify-center rounded-none hover:bg-gray-50 transition-all"
          >
            <Bell className="w-5 h-5 text-dark" />
            {notifications.some(n => !n.leida) && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 px-4 lg:px-0"
          >
            {/* Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-6 border border-gray-100 shadow-sm space-y-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted">WhatsApp Leads</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-dark leading-none">
                    {properties.length * 12}
                  </span>
                  <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
                </div>
              </div>
              <div className="bg-white p-6 border border-gray-100 shadow-sm space-y-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted">Propiedades</p>
                <span className="text-3xl font-black text-dark leading-none">{properties.length}</span>
              </div>
              <button 
                onClick={() => navigate('/clasificados/registro')}
                className="col-span-2 lg:col-span-1 bg-[#FF7F50] p-6 flex flex-col items-center justify-center gap-2 text-white shadow-xl shadow-[#FF7F50]/20 active:scale-95 transition-all"
              >
                <Plus className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-widest">Publicar Nueva</span>
              </button>
            </div>

            {/* Properties List */}
            <div className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted ml-2">Mis Propiedades</h2>
              <div className="grid grid-cols-1 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="bg-white border border-gray-100 shadow-xl shadow-black/5 overflow-hidden flex flex-col lg:flex-row">
                    <div className="lg:w-64 h-48 lg:h-auto relative">
                      <img src={property.imagen} className="w-full h-full object-cover" alt={property.nombre} referrerPolicy="no-referrer" />
                      <div className="absolute top-4 left-4">
                        <div className={cn(
                          "px-3 py-1.5 text-[8px] font-black uppercase tracking-widest shadow-lg",
                          property.status === 'activo' ? "bg-emerald-500 text-white" : 
                          property.status === 'pendiente' ? "bg-amber-500 text-white" : "bg-gray-500 text-white"
                        )}>
                          {property.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-6 lg:p-8 space-y-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-dark tracking-tighter uppercase leading-tight">{property.nombre}</h3>
                          <div className="flex items-center gap-2 text-muted">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{property.zona}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted">Por noche</p>
                          <p className="text-xl font-black text-[#FF7F50] tracking-tighter">${property.precio}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted" />
                          <span className="text-[10px] font-black text-dark">{property.capacidad} Pers.</span>
                        </div>
                        <div className="flex items-center gap-3 ml-auto">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted">¿Disponible?</span>
                          <button 
                            onClick={() => handleToggleAvailability(property.id, property.status)}
                            className={cn(
                              "w-12 h-6 rounded-none transition-all relative p-1",
                              property.status === 'activo' ? "bg-emerald-500" : "bg-rose-500"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 bg-white shadow-md transition-all",
                              property.status === 'activo' ? "translate-x-6" : "translate-x-0"
                            )} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button 
                          onClick={() => handleEditProperty(property)}
                          className="py-4 bg-gray-50 text-dark border border-gray-100 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"
                        >
                          <Settings2 className="w-4 h-4" />
                          Editar Anuncio
                        </button>
                        <button className="py-4 bg-white text-muted border border-gray-100 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                          <Eye className="w-4 h-4" />
                          Ver Vista Previa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'edit' && selectedProperty && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 px-4 lg:px-0"
          >
            <button 
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-muted hover:text-dark transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Volver a mis propiedades</span>
            </button>

            <div className="bg-white border border-gray-100 shadow-2xl shadow-black/5 overflow-hidden">
              <div className="h-64 relative group">
                <img src={selectedProperty.imagen} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => setShowCamera(true)}
                    className="bg-white text-dark px-6 py-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl"
                  >
                    <Camera className="w-5 h-5 text-[#FF7F50]" />
                    Cambiar Foto Principal
                  </button>
                </div>
              </div>

              <div className="p-8 lg:p-12 space-y-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Título del Anuncio</label>
                    <input 
                      type="text" 
                      value={selectedProperty.nombre}
                      onChange={(e) => setSelectedProperty({...selectedProperty, nombre: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all uppercase tracking-tight"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Descripción</label>
                    <textarea 
                      value={selectedProperty.descripcion}
                      onChange={(e) => setSelectedProperty({...selectedProperty, descripcion: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all h-32 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Precio Temporada</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF7F50]" />
                        <input 
                          type="number" 
                          value={selectedProperty.precio}
                          onChange={(e) => setSelectedProperty({...selectedProperty, precio: Number(e.target.value)})}
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 pl-12 text-sm font-black text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Máx. Personas</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF7F50]" />
                        <input 
                          type="number" 
                          value={selectedProperty.capacidad}
                          onChange={(e) => setSelectedProperty({...selectedProperty, capacidad: Number(e.target.value)})}
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-none p-5 pl-12 text-sm font-black text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2 lg:col-span-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Estado del Anuncio</label>
                      <select 
                        value={selectedProperty.status}
                        onChange={(e) => setSelectedProperty({...selectedProperty, status: e.target.value as EntityStatus})}
                        className={cn(
                          "w-full p-5 font-black text-[10px] uppercase tracking-widest border-2 transition-all appearance-none",
                          selectedProperty.status === 'activo' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                          selectedProperty.status === 'pendiente' ? "bg-amber-50 border-amber-100 text-amber-600" :
                          "bg-rose-50 border-rose-100 text-rose-600"
                        )}
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="pendiente">Pendiente</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 pt-6 border-t border-gray-50">
                  <button 
                    onClick={() => handleDeleteProperty(selectedProperty.id)}
                    className="py-5 bg-rose-50 text-rose-600 font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" /> Dar de Baja
                  </button>
                  <div className="flex-1 flex gap-4">
                    <button 
                      onClick={() => setView('list')}
                      className="flex-1 py-5 bg-gray-100 text-muted font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveProperty}
                      disabled={saving}
                      className="flex-[2] py-5 bg-[#FF7F50] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#FF7F50]/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Guardar Cambios</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 px-4 lg:px-0"
          >
            <button 
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-muted hover:text-dark transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Volver al panel</span>
            </button>

            <div className="space-y-4">
              <h2 className="text-xl font-black text-dark tracking-tighter uppercase">Centro de Notificaciones</h2>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={cn(
                      "p-6 bg-white border-l-4 shadow-sm flex gap-5 items-start",
                      notif.tipo === 'success' ? "border-emerald-500" : 
                      notif.tipo === 'warning' ? "border-amber-500" : "border-primary"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-none flex items-center justify-center shrink-0",
                      notif.tipo === 'success' ? "bg-emerald-50 text-emerald-500" : 
                      notif.tipo === 'warning' ? "bg-amber-50 text-amber-500" : "bg-primary/10 text-primary"
                    )}>
                      {notif.tipo === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
                       notif.tipo === 'warning' ? <AlertCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-dark">{notif.titulo}</h4>
                        <span className="text-[8px] font-bold text-muted uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {notif.fecha}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-muted leading-relaxed">{notif.mensaje}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CameraModal 
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(img) => {
          if (selectedProperty) {
            setSelectedProperty({ ...selectedProperty, imagen: img });
          }
          setShowCamera(false);
        }}
      />
    </div>
  );
}
