import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Users, 
  MapPin, 
  Eye, 
  MousePointer2, 
  ExternalLink, 
  Save,
  Loader2,
  CheckCircle2,
  Ship
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function NegocioDashboard() {
  const [oferta, setOferta] = useState("2x1 en Paseo al Atardecer hoy!");
  const [activa, setActiva] = useState(true);
  const [afluencia, setAfluencia] = useState<'baja' | 'media' | 'alta'>('baja');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const negocioId = "negocio-1"; // Mock ID for Yates Bonanza

  // Mock metrics
  const metrics = {
    vistas: 450,
    clics: 82
  };

  const handleUpdateOferta = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F2E1C1] text-[#142850] font-sans pb-24">
      {/* Header Profile */}
      <header className="bg-white p-6 rounded-b-[3rem] shadow-lg border-b border-[#00A8CC]/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#00A8CC] rounded-2xl flex items-center justify-center shadow-inner">
            <Ship className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Yates Bonanza</h1>
            <p className="text-[10px] font-bold text-[#00A8CC] uppercase tracking-widest mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Tours • Paseos en Playa
            </p>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-md mx-auto">
        
        {/* Oferta Flash Section */}
        <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-white/50 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Oferta Flash
            </h2>
            <button 
              onClick={() => setActiva(!activa)}
              className={cn(
                "w-14 h-7 rounded-full transition-all relative p-1",
                activa ? "bg-[#00A8CC]" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full bg-white shadow-md transition-all",
                activa ? "translate-x-7" : "translate-x-0"
              )} />
            </button>
          </div>

          <div className="space-y-3">
            <textarea 
              value={oferta}
              onChange={(e) => setOferta(e.target.value)}
              placeholder="Escribe tu oferta aquí..."
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-[#00A8CC]/30 transition-all resize-none h-24"
            />
            <button 
              onClick={handleUpdateOferta}
              disabled={saving}
              className="w-full py-4 bg-[#00A8CC] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#00A8CC]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Actualizar Oferta
            </button>
          </div>
          
          <AnimatePresence>
            {showSuccess && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-center font-bold text-emerald-600 uppercase"
              >
                ¡Oferta publicada en el feed! ⚡
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* Afluencia Section */}
        <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-white/50 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00A8CC]" />
            Estado del Local
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => setAfluencia('baja')}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95",
                afluencia === 'baja' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-gray-50 border-transparent text-gray-400"
              )}
            >
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-black uppercase">Libre</span>
            </button>
            <button 
              onClick={() => setAfluencia('media')}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95",
                afluencia === 'media' ? "bg-amber-50 border-amber-500 text-amber-700" : "bg-gray-50 border-transparent text-gray-400"
              )}
            >
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-[8px] font-black uppercase">Casi Lleno</span>
            </button>
            <button 
              onClick={() => setAfluencia('alta')}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95",
                afluencia === 'alta' ? "bg-rose-50 border-rose-500 text-rose-700" : "bg-gray-50 border-transparent text-gray-400"
              )}
            >
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-[8px] font-black uppercase">Espera</span>
            </button>
          </div>
        </section>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-[2rem] border border-white/50">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-[#00A8CC]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vistas</span>
            </div>
            <p className="text-2xl font-black text-[#142850]">{metrics.vistas}</p>
            <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1">+12% hoy</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-[2rem] border border-white/50">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer2 className="w-4 h-4 text-[#00A8CC]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Clics</span>
            </div>
            <p className="text-2xl font-black text-[#142850]">{metrics.clics}</p>
            <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">En ubicación</p>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="space-y-3">
          <button className="w-full py-4 bg-white rounded-2xl border-2 border-[#00A8CC]/20 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors">
            <ExternalLink className="w-4 h-4 text-[#00A8CC]" />
            Ver Catálogo Digital
          </button>
          <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            Socio AcaEnVivo desde 2024
          </p>
        </div>

      </main>
    </div>
  );
}
