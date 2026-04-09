import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  MapPin, 
  MessageCircle, 
  Utensils, 
  Anchor, 
  GlassWater, 
  Palmtree, 
  Ticket,
  Clock, 
  DollarSign, 
  Upload, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  Loader2,
  Star,
  Heart
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../lib/supabase';
import { useAcaData } from '../../hooks/useAcaData';

type Step = 1 | 2;

interface BusinessData {
  nombre: string;
  categoria: string;
  zona: string;
  whatsapp: string;
  rangoPrecio: string;
  horario: string;
  imagen: string | null;
  imagenes_secundarias: string[];
  menu: string | null;
}

const CATEGORIES = [
  { id: 'Restaurante', icon: Utensils, label: 'Restaurante' },
  { id: 'Yate', icon: Anchor, label: 'Yate' },
  { id: 'Beach Club', icon: Palmtree, label: 'Beach Club' },
  { id: 'Bar', icon: GlassWater, label: 'Bar' },
  { id: 'Actividad', icon: Ticket, label: 'Actividad' },
];

const ZONAS = ['Diamante', 'Dorada', 'Tradicional', 'Pie de la Cuesta'];

export default function NegocioRegistro() {
  const navigate = useNavigate();
  const { addEntity } = useAcaData();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<BusinessData>({
    nombre: '',
    categoria: '',
    zona: '',
    whatsapp: '',
    rangoPrecio: '',
    horario: '',
    imagen: null,
    imagenes_secundarias: [],
    menu: null,
  });

  const updateFormData = (field: keyof BusinessData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: 'imagen' | 'menu' | 'imagenes_secundarias', e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (field === 'imagenes_secundarias') {
        const newImages = Array.from(files).map(file => URL.createObjectURL(file));
        setFormData(prev => ({
          ...prev,
          imagenes_secundarias: [...prev.imagenes_secundarias, ...newImages].slice(0, 6),
          imagen: prev.imagen || newImages[0]
        }));
      } else {
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          updateFormData(field, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeSecondaryImage = (index: number) => {
    setFormData(prev => {
      const newSec = prev.imagenes_secundarias.filter((_, i) => i !== index);
      return {
        ...prev,
        imagenes_secundarias: newSec,
        imagen: prev.imagen === prev.imagenes_secundarias[index] ? (newSec[0] || null) : prev.imagen
      };
    });
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.nombre && formData.categoria && formData.zona && formData.whatsapp;
    }
    if (step === 2) {
      return formData.rangoPrecio && formData.horario && formData.imagen;
    }
    return false;
  };

  const handleNext = () => {
    if (step < 2) setStep(2);
    else handleFinalize();
  };

  const handleBack = () => {
    if (step > 1) setStep(1);
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const { data: newEnt, error } = await supabase
        .from('entities')
        .insert([{
          nombre: formData.nombre,
          categoria: formData.categoria,
          zona: formData.zona,
          whatsapp: formData.whatsapp,
          tipo: 'negocio',
          status: 'activo',
          descripcion: `Horario: ${formData.horario}. Rango: ${formData.rangoPrecio}`,
          imagen: formData.imagen || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
          imagenes_secundarias: formData.imagenes_secundarias
        }])
        .select()
        .single();

      if (error) throw error;

      addEntity({
        id: newEnt.id,
        nombre: newEnt.nombre,
        categoria: newEnt.categoria,
        zona: newEnt.zona,
        whatsapp: newEnt.whatsapp,
        tipo: newEnt.tipo,
        status: newEnt.status,
        descripcion: newEnt.descripcion,
        imagen: newEnt.imagen,
        precio: 0,
        estrellas: 0
      });

      setShowSuccess(true);
    } catch (error) {
      console.error("Error registering business:", error);
      alert('Error al registrar el negocio');
    } finally {
      setLoading(false);
    }
  };

  const SelectedIcon = CATEGORIES.find(c => c.id === formData.categoria)?.icon || Store;

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-32">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FF7F50]/10 rounded-none flex items-center justify-center">
              <Store className="w-4 h-4 text-[#FF7F50]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dark">Registro de Socio</span>
          </div>
          <div className="flex gap-2">
            {[1, 2].map((s) => (
              <div 
                key={s} 
                className={cn(
                  "h-1.5 w-8 rounded-full transition-all duration-500",
                  step >= s ? "bg-[#FF7F50]" : "bg-gray-100"
                )} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10 grid lg:grid-cols-2 gap-12 items-start">
        {/* Form Section */}
        <div className="space-y-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h1 className="text-4xl font-black text-dark tracking-tighter uppercase leading-none">Perfil del Negocio</h1>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Lo básico para empezar a brillar</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                      Nombre Comercial
                    </label>
                    <input 
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => updateFormData('nombre', e.target.value)}
                      placeholder="Ej: La Perla Restaurante"
                      className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all uppercase tracking-tight"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Categoría</label>
                    <div className="grid grid-cols-3 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => updateFormData('categoria', cat.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-none border-2 transition-all",
                            formData.categoria === cat.id 
                              ? "bg-[#FF7F50]/5 border-[#FF7F50]/20 text-[#FF7F50]" 
                              : "bg-white border-gray-100 text-muted hover:border-gray-200"
                          )}
                        >
                          <cat.icon className="w-5 h-5" />
                          <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted">Zona</label>
                      <select 
                        value={formData.zona}
                        onChange={(e) => updateFormData('zona', e.target.value)}
                        className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all uppercase tracking-tight appearance-none"
                      >
                        <option value="">Zona...</option>
                        {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted">WhatsApp</label>
                      <input 
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => updateFormData('whatsapp', e.target.value)}
                        placeholder="744..."
                        className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h1 className="text-4xl font-black text-dark tracking-tighter uppercase leading-none">Detalles y Fotos</h1>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Dale vida a tu anuncio</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted">Rango de Precios</label>
                      <select 
                        value={formData.rangoPrecio}
                        onChange={(e) => updateFormData('rangoPrecio', e.target.value)}
                        className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all uppercase tracking-tight appearance-none"
                      >
                        <option value="">Selecciona...</option>
                        <option value="$">$ Económico</option>
                        <option value="$$">$$ Moderado</option>
                        <option value="$$$">$$$ Premium</option>
                        <option value="$$$$">$$$$ Lujo</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted">Horarios</label>
                      <input 
                        type="text"
                        value={formData.horario}
                        onChange={(e) => updateFormData('horario', e.target.value)}
                        placeholder="Ej: 9:00 AM - 11:00 PM"
                        className="w-full bg-white border-2 border-gray-100 rounded-none p-5 text-sm font-black text-dark focus:outline-none focus:border-[#FF7F50]/30 transition-all uppercase tracking-tight"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted">Galería de Fotos</label>
                      <div 
                        onClick={() => document.getElementById('biz-image')?.click()}
                        className="h-32 border-2 border-dashed border-gray-200 rounded-none flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all relative overflow-hidden"
                      >
                        <Upload className="w-5 h-5 text-muted" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted">Subir Fotos</span>
                        <input id="biz-image" type="file" multiple accept="image/*" onChange={(e) => handleFileUpload('imagenes_secundarias', e)} className="hidden" />
                      </div>
                      
                      {formData.imagenes_secundarias.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {formData.imagenes_secundarias.map((foto, index) => (
                            <div key={index} className="relative aspect-square rounded-none overflow-hidden group border border-gray-100">
                              <img src={foto} className="w-full h-full object-cover" alt={`Preview ${index}`} />
                              <button 
                                type="button"
                                onClick={() => removeSecondaryImage(index)}
                                className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted">Menú / Catálogo (Opcional)</label>
                      <div 
                        onClick={() => document.getElementById('menu-image')?.click()}
                        className={cn(
                          "h-32 border-2 border-dashed border-gray-200 rounded-none flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all relative overflow-hidden",
                          formData.menu && "border-solid border-[#FF7F50]/30"
                        )}
                      >
                        {formData.menu ? (
                          <img src={formData.menu} className="w-full h-full object-cover" alt="Menu Preview" referrerPolicy="no-referrer" />
                        ) : (
                          <>
                            <Utensils className="w-5 h-5 text-muted" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted">Subir Menú</span>
                          </>
                        )}
                        <input id="menu-image" type="file" accept="image/*" onChange={(e) => handleFileUpload('menu', e)} className="hidden" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview Section */}
        <div className="sticky top-24 space-y-6">
          <div className="space-y-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted ml-2">Vista Previa en App</h2>
            <div className="bg-white border border-gray-100 shadow-2xl shadow-black/5 rounded-none overflow-hidden group max-w-sm mx-auto">
              <div className="relative h-56 bg-gray-100">
                {formData.imagen ? (
                  <img src={formData.imagen} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <SelectedIcon className="w-12 h-12 text-gray-200" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-none flex items-center justify-center shadow-lg">
                    <Heart className="w-5 h-5 text-muted" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-[#FF7F50] text-white px-3 py-1.5 text-[8px] font-black uppercase tracking-widest shadow-lg">
                    {formData.categoria || 'Categoría'}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-dark tracking-tighter uppercase leading-none">
                      {formData.nombre || 'Nombre de tu Negocio'}
                    </h3>
                    <div className="flex items-center gap-2 text-muted">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{formData.zona || 'Ubicación'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1">
                    <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600">NUEVO</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted" />
                      <span className="text-[9px] font-bold text-muted uppercase">{formData.horario || 'Horario'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-[#FF7F50]" />
                      <span className="text-[9px] font-black text-[#FF7F50]">{formData.rangoPrecio || '$$'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 z-40">
        <div className="max-w-4xl mx-auto flex gap-4">
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
              "flex-[2] py-5 bg-[#FF7F50] text-white rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#FF7F50]/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale",
              step === 1 && "flex-1"
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === 2 ? 'Activar mi Negocio' : 'Siguiente Paso'}
                {step < 2 && <ChevronRight className="w-5 h-5" />}
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
              className="absolute inset-0 bg-dark/95 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-md p-12 text-center space-y-8 relative z-10 shadow-2xl border-t-8 border-[#FF7F50]"
            >
              <div className="w-24 h-24 bg-[#FF7F50]/10 text-[#FF7F50] rounded-none flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-dark tracking-tighter uppercase leading-none">¡Felicidades!</h2>
                <p className="text-xs font-bold text-muted uppercase tracking-widest leading-relaxed">
                  Tu negocio ya está en el mapa de Acapulco. <br/>
                  Prepárate para recibir nuevos clientes.
                </p>
              </div>
              <button
                onClick={() => navigate('/negocio')}
                className="w-full py-6 bg-[#FF7F50] text-white rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#FF7F50]/20 active:scale-95 transition-all"
              >
                Ir a mi Panel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
