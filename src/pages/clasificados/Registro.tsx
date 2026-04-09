import React, { useState } from 'react';
import { 
  Home, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  DollarSign, 
  Camera, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Loader2,
  Waves,
  Wifi,
  Car,
  Dog,
  Wind,
  Umbrella,
  X,
  Zap,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../lib/supabase';
import { useAcaData } from '../../hooks/useAcaData';

const ZONES = ['Diamante', 'Dorada', 'Tradicional', 'Pie de la Cuesta', 'Las Brisas'];

const AMENITIES = [
  { id: 'alberca', label: 'Alberca', icon: Waves },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'estacionamiento', label: 'Estacionamiento', icon: Car },
  { id: 'playa', label: 'Acceso Playa', icon: Umbrella },
  { id: 'pet', label: 'Pet Friendly', icon: Dog },
  { id: 'ac', label: 'Aire Acond.', icon: Wind },
];

export default function ClasificadosRegistro() {
  const navigate = useNavigate();
  const { addEntity } = useAcaData();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    zona: '',
    direccion: '',
    mapsLink: '',
    capacidad: 2,
    cuartos: 1,
    banos: 1,
    precio: '',
    amenidades: [] as string[],
    fotos: [] as string[],
    whatsapp: ''
  });

  const toggleAmenity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      amenidades: prev.amenidades.includes(id)
        ? prev.amenidades.filter(a => a !== id)
        : [...prev.amenidades, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: newEnt, error } = await supabase
        .from('entities')
        .insert([{
          nombre: formData.nombre,
          descripcion: `Dirección: ${formData.direccion}. ${formData.cuartos} Recámaras, ${formData.banos} Baños.`,
          zona: formData.zona,
          precio: Number(formData.precio),
          capacidad: formData.capacidad,
          whatsapp: formData.whatsapp,
          tipo: 'clasificados',
          status: 'pendiente',
          imagen: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'
        }])
        .select()
        .single();

      if (error) throw error;

      addEntity({
        id: newEnt.id,
        nombre: newEnt.nombre,
        descripcion: newEnt.descripcion,
        precio: newEnt.precio,
        zona: newEnt.zona,
        imagen: newEnt.imagen,
        status: newEnt.status,
        tipo: newEnt.tipo,
        whatsapp: newEnt.whatsapp,
        capacidad: newEnt.capacidad
      });

      setShowSuccess(true);
    } catch (error) {
      console.error("Error registering property:", error);
      alert('Error al registrar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] py-10 px-4 pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/clasificados')}
            className="flex items-center gap-2 text-muted hover:text-dark transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Volver al Panel</span>
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-black text-dark tracking-tighter uppercase leading-none">Nuevo Anuncio</h1>
            <p className="text-[9px] font-bold text-[#FF7F50] uppercase tracking-widest mt-1">Dueño Particular</p>
          </div>
        </div>

        {/* Main Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] shadow-2xl shadow-black/5 overflow-hidden border border-gray-100">
          <div className="p-8 lg:p-12 space-y-12">
            
            {/* Section 1: Lo Básico */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FF7F50]/10 rounded-full flex items-center justify-center">
                  <Home className="w-4 h-4 text-[#FF7F50]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-dark">1. Lo Básico</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Título del Anuncio</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej. Penthouse con vista a la Bahía"
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-sm font-bold text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Precio por Noche</label>
                    <div className="relative">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF7F50]" />
                      <input 
                        required
                        type="number" 
                        placeholder="0.00"
                        value={formData.precio}
                        onChange={e => setFormData({...formData, precio: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 pl-14 text-sm font-bold text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Zona</label>
                    <select 
                      required
                      value={formData.zona}
                      onChange={e => setFormData({...formData, zona: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-sm font-bold text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all appearance-none"
                    >
                      <option value="">Selecciona zona</option>
                      {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-gray-100 w-full" />

            {/* Section 2: Capacidad */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FF7F50]/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#FF7F50]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-dark">2. Capacidad</h2>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3 text-center">
                  <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-3 group hover:border-[#FF7F50]/20 transition-all">
                    <Users className="w-6 h-6 text-[#FF7F50]" />
                    <input 
                      type="number" 
                      value={formData.capacidad}
                      onChange={e => setFormData({...formData, capacidad: Number(e.target.value)})}
                      className="bg-transparent w-full text-center text-lg font-black focus:outline-none" 
                    />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted">Personas</p>
                </div>
                <div className="space-y-3 text-center">
                  <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-3 group hover:border-[#FF7F50]/20 transition-all">
                    <Bed className="w-6 h-6 text-[#FF7F50]" />
                    <input 
                      type="number" 
                      value={formData.cuartos}
                      onChange={e => setFormData({...formData, cuartos: Number(e.target.value)})}
                      className="bg-transparent w-full text-center text-lg font-black focus:outline-none" 
                    />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted">Recámaras</p>
                </div>
                <div className="space-y-3 text-center">
                  <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-3 group hover:border-[#FF7F50]/20 transition-all">
                    <Bath className="w-6 h-6 text-[#FF7F50]" />
                    <input 
                      type="number" 
                      value={formData.banos}
                      onChange={e => setFormData({...formData, banos: Number(e.target.value)})}
                      className="bg-transparent w-full text-center text-lg font-black focus:outline-none" 
                    />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted">Baños</p>
                </div>
              </div>
            </section>

            <div className="h-px bg-gray-100 w-full" />

            {/* Section 3: Características */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FF7F50]/10 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#FF7F50]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-dark">3. Características</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group",
                      formData.amenidades.includes(amenity.id) 
                        ? "bg-[#FF7F50] border-[#FF7F50] text-white shadow-lg shadow-[#FF7F50]/20" 
                        : "bg-gray-50 border-transparent text-muted hover:bg-gray-100"
                    )}
                  >
                    <amenity.icon className={cn("w-6 h-6", formData.amenidades.includes(amenity.id) ? "text-white" : "text-[#FF7F50]")} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{amenity.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="h-px bg-gray-100 w-full" />

            {/* Section 4: Fotos */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FF7F50]/10 rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-[#FF7F50]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-dark">4. Fotos</h2>
              </div>

              <div className="border-4 border-dashed border-gray-100 rounded-[32px] p-12 flex flex-col items-center justify-center gap-4 bg-gray-50/50 group hover:bg-gray-50 transition-all cursor-pointer">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-10 h-10 text-[#FF7F50]" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-dark">Subir Fotos</p>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Selecciona varias a la vez</p>
                </div>
              </div>
            </section>

            <div className="h-px bg-gray-100 w-full" />

            {/* Section 5: Contacto */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FF7F50]/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-[#FF7F50]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-dark">5. Contacto</h2>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">WhatsApp (10 dígitos)</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-sm font-black text-muted">+52</span>
                    <div className="w-px h-4 bg-gray-200" />
                  </div>
                  <input 
                    required
                    type="tel" 
                    placeholder="7441234567"
                    pattern="[0-9]{10}"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 pl-20 text-sm font-bold text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all tracking-widest"
                  />
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-[#FF7F50] text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-[#FF7F50]/30 active:scale-95 transition-all flex items-center justify-center gap-4 mt-12"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Publicar mi Anuncio
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-dark/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-md p-12 text-center space-y-8 rounded-[40px] shadow-2xl"
            >
              <div className="w-24 h-24 bg-emerald-500 text-white flex items-center justify-center mx-auto rounded-3xl shadow-2xl shadow-emerald-500/40">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-dark tracking-tighter uppercase">¡Recibido!</h3>
                <p className="text-xs font-bold text-muted uppercase tracking-widest leading-relaxed">
                  ¡Tu anuncio está en revisión! En breve aparecerá en el directorio de rentas de Acapulco.
                </p>
              </div>
              <button 
                onClick={() => navigate('/clasificados')}
                className="w-full py-5 bg-dark text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] active:scale-95 transition-all"
              >
                Volver al Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
