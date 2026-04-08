import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hotel, 
  MapPin, 
  Navigation, 
  Bed, 
  DollarSign, 
  Wifi, 
  Waves, 
  ParkingCircle, 
  Palmtree, 
  Dog, 
  Utensils, 
  Camera, 
  Phone, 
  MessageCircle, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  Loader2,
  Upload
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

type Step = 1 | 2 | 3;

interface HotelData {
  nombre: string;
  zona: string;
  direccion: string;
  googleMaps: string;
  habitaciones: string;
  precio: string;
  amenidades: string[];
  imagen: string | null;
  telefono: string;
  whatsapp: string;
  descripcion: string;
}

const ZONAS = ['Diamante', 'Dorada', 'Tradicional', 'Pie de la Cuesta'];

const AMENITIES = [
  { id: 'Alberca', icon: Waves },
  { id: 'WiFi', icon: Wifi },
  { id: 'Estacionamiento', icon: ParkingCircle },
  { id: 'Playa', icon: Palmtree },
  { id: 'Pet Friendly', icon: Dog },
  { id: 'Restaurante', icon: Utensils },
];

export default function HotelRegistro() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<HotelData>({
    nombre: '',
    zona: '',
    direccion: '',
    googleMaps: '',
    habitaciones: '',
    precio: '',
    amenidades: [],
    imagen: null,
    telefono: '',
    whatsapp: '',
    descripcion: '',
  });

  const updateFormData = (field: keyof HotelData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      amenidades: prev.amenidades.includes(id)
        ? prev.amenidades.filter(a => a !== id)
        : [...prev.amenidades, id]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData('imagen', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.nombre && formData.zona && formData.direccion && formData.googleMaps;
    }
    if (step === 2) {
      return formData.habitaciones && formData.precio;
    }
    if (step === 3) {
      return formData.telefono && formData.whatsapp && formData.descripcion;
    }
    return false;
  };

  const handleNext = () => {
    if (step < 3) setStep((prev) => (prev + 1) as Step);
    else handleFinalize();
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as Step);
  };

  const handleFinalize = async () => {
    setLoading(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00A8CC]">
              Paso {step} de 3
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
              {step === 1 ? 'Identidad' : step === 2 ? 'Capacidad' : 'Finalizar'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#00A8CC]"
              initial={{ width: '33.33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: "circOut" }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 pt-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-dark tracking-tighter uppercase leading-none">Identidad y Ubicación</h1>
                <p className="text-xs font-bold text-muted uppercase tracking-widest">Cuéntanos sobre tu hotel y dónde encontrarlo</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                    <Hotel className="w-3 h-3" /> Nombre del Hotel
                  </label>
                  <input 
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => updateFormData('nombre', e.target.value)}
                    placeholder="Ej: Hotel Acapulco Plaza"
                    className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#00A8CC]/30 transition-all uppercase tracking-tight"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Zona
                  </label>
                  <select 
                    value={formData.zona}
                    onChange={(e) => updateFormData('zona', e.target.value)}
                    className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#00A8CC]/30 transition-all uppercase tracking-tight appearance-none"
                  >
                    <option value="">Selecciona una zona</option>
                    {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                    <Navigation className="w-3 h-3" /> Dirección Exacta
                  </label>
                  <textarea 
                    value={formData.direccion}
                    onChange={(e) => updateFormData('direccion', e.target.value)}
                    placeholder="Calle, número, colonia..."
                    className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#00A8CC]/30 transition-all h-32 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Link de Google Maps
                  </label>
                  <input 
                    type="url"
                    value={formData.googleMaps}
                    onChange={(e) => updateFormData('googleMaps', e.target.value)}
                    placeholder="https://goo.gl/maps/..."
                    className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#00A8CC]/30 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-dark tracking-tighter uppercase leading-none">Capacidad y Amenidades</h1>
                <p className="text-xs font-bold text-muted uppercase tracking-widest">¿Qué ofreces a tus huéspedes?</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                      <Bed className="w-3 h-3" /> Habitaciones
                    </label>
                    <input 
                      type="number"
                      value={formData.habitaciones}
                      onChange={(e) => updateFormData('habitaciones', e.target.value)}
                      placeholder="0"
                      className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#00A8CC]/30 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                      <DollarSign className="w-3 h-3" /> Precio "Desde"
                    </label>
                    <input 
                      type="number"
                      value={formData.precio}
                      onChange={(e) => updateFormData('precio', e.target.value)}
                      placeholder="MXN"
                      className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#00A8CC]/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Amenidades</label>
                  <div className="grid grid-cols-2 gap-3">
                    {AMENITIES.map((amenity) => (
                      <button
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={cn(
                          "flex items-center gap-3 p-5 rounded-none border-2 transition-all text-left",
                          formData.amenidades.includes(amenity.id) 
                            ? "bg-[#00A8CC]/5 border-[#00A8CC]/20 text-[#00A8CC]" 
                            : "bg-white border-gray-100 text-muted hover:border-gray-200"
                        )}
                      >
                        <amenity.icon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{amenity.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-dark tracking-tighter uppercase leading-none">Multimedia y Contacto</h1>
                <p className="text-xs font-bold text-muted uppercase tracking-widest">Últimos detalles para tu perfil</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Imagen de Portada</label>
                  <div 
                    onClick={() => document.getElementById('hotel-image')?.click()}
                    className={cn(
                      "h-48 border-4 border-dashed border-gray-100 rounded-none flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 transition-all relative overflow-hidden",
                      formData.imagen && "border-none"
                    )}
                  >
                    {formData.imagen ? (
                      <img src={formData.imagen} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-[#00A8CC]/10 rounded-none flex items-center justify-center">
                          <Upload className="w-7 h-7 text-[#00A8CC]" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Haz clic para subir foto</p>
                      </>
                    )}
                    <input 
                      id="hotel-image"
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Recepción
                    </label>
                    <input 
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => updateFormData('telefono', e.target.value)}
                      placeholder="744..."
                      className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#00A8CC]/30 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </label>
                    <input 
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => updateFormData('whatsapp', e.target.value)}
                      placeholder="744..."
                      className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#00A8CC]/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                    Descripción Corta
                  </label>
                  <textarea 
                    value={formData.descripcion}
                    onChange={(e) => updateFormData('descripcion', e.target.value)}
                    maxLength={150}
                    placeholder="Describe lo mejor de tu hotel..."
                    className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#00A8CC]/30 transition-all h-32 resize-none"
                  />
                  <p className="text-right text-[10px] font-black text-muted uppercase tracking-widest">{formData.descripcion.length}/150</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 z-40">
        <div className="max-w-xl mx-auto flex gap-4">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-5 bg-gray-100 text-muted rounded-none font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Anterior
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            className={cn(
              "flex-[2] py-5 bg-[#00A8CC] text-white rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#00A8CC]/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale",
              step === 1 && "flex-1"
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === 3 ? 'Finalizar Registro' : 'Siguiente'}
                {step < 3 && <ChevronRight className="w-5 h-5" />}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-md p-10 text-center space-y-8 relative z-10 shadow-2xl"
            >
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-none flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-dark tracking-tighter uppercase leading-none">¡Registro Exitoso!</h2>
                <p className="text-xs font-bold text-muted uppercase tracking-widest">Tu hotel ya está listo para recibir huéspedes</p>
              </div>
              <button
                onClick={() => navigate('/hotel')}
                className="w-full py-6 bg-[#00A8CC] text-white rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#00A8CC]/20 active:scale-95 transition-all"
              >
                Ir a mi Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
