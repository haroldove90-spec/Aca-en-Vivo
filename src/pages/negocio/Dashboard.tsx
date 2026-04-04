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
  Ship,
  Store,
  Clock,
  MessageCircle,
  Camera,
  Trash2,
  Image as ImageIcon,
  TrendingUp,
  Navigation,
  X,
  Calendar,
  Utensils,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type Tab = 'estado' | 'perfil' | 'ofertas' | 'multimedia' | 'impacto';

export default function NegocioDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('estado');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Business State
  const [isOpen, setIsOpen] = useState(true);
  const [afluencia, setAfluencia] = useState<'baja' | 'media' | 'alta'>('baja');
  
  // Profile State
  const [businessName, setBusinessName] = useState("Yates Bonanza Acapulco");
  const [category, setCategory] = useState("Renta de Yates / Tours");
  const [address, setAddress] = useState("Muelle de la Marina, Acapulco");
  const [whatsapp, setWhatsapp] = useState("+52 744 123 4567");

  // Offers State
  const [offerText, setOfferText] = useState("Cubetazo 5x4 antes de las 6pm");
  const [offerValidity, setOfferValidity] = useState<'today' | 'permanent'>('today');

  // Media State
  const [coverImage, setCoverImage] = useState<string>("https://picsum.photos/seed/bonanza/600/400");
  const [menuImage, setMenuImage] = useState<string>("https://picsum.photos/seed/menu/600/800");

  // Mock Stats
  const stats = {
    vistas: 215,
    clicsOferta: 45,
    clicsMaps: 12
  };

  const negocioId = "negocio-1";

  useEffect(() => {
    const docRef = doc(db, 'establecimientos', negocioId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setBusinessName(data.nombre || "");
        setCategory(data.giro || "");
        setAddress(data.direccion || "");
        setOfferText(data.promocion || "");
        setAfluencia(data.afluencia || 'baja');
        setIsOpen(data.abierto !== false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [negocioId]);

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'establecimientos', negocioId), {
        nombre: businessName,
        giro: category,
        direccion: address,
        promocion: offerText,
        afluencia: afluencia,
        abierto: isOpen,
        ultima_edicion: serverTimestamp()
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error saving business changes:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (type: 'cover' | 'menu') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'cover') setCoverImage(reader.result as string);
        else setMenuImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F2E1C1]">
        <Loader2 className="w-12 h-12 text-[#142850] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#142850] font-sans pb-32">
      {/* Header */}
      <header className="bg-[#142850] text-white px-6 py-8 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F2E1C1]/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-[#F2E1C1] rounded-2xl flex items-center justify-center shadow-lg">
            <Ship className="w-10 h-10 text-[#142850]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">{businessName}</h1>
            <p className="text-[10px] font-bold text-[#F2E1C1] uppercase tracking-widest mt-1 flex items-center gap-1">
              <Store className="w-3 h-3" /> {category}
            </p>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="flex gap-2 p-4 overflow-x-auto no-scrollbar bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        {[
          { id: 'estado', label: 'Estado', icon: Clock },
          { id: 'perfil', label: 'Perfil', icon: Smartphone },
          { id: 'ofertas', label: 'Ofertas', icon: Zap },
          { id: 'multimedia', label: 'Media', icon: ImageIcon },
          { id: 'impacto', label: 'Impacto', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-[#142850] text-[#F2E1C1] shadow-lg scale-105" 
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
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
          {activeTab === 'estado' && (
            <motion.div
              key="estado"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Open/Closed Toggle */}
              <div className={cn(
                "p-6 rounded-[2.5rem] shadow-xl border transition-all duration-500",
                isOpen ? "bg-emerald-50 border-emerald-100" : "bg-slate-100 border-slate-200"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                      isOpen ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"
                    )}>
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado Actual</p>
                      <p className={cn("text-lg font-black uppercase", isOpen ? "text-emerald-700" : "text-slate-600")}>
                        {isOpen ? "Abierto / Disponible" : "Cerrado / No Disponible"}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                      "w-14 h-7 rounded-full transition-all relative p-1",
                      isOpen ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white shadow-md transition-all",
                      isOpen ? "translate-x-7" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>

              {/* Afluencia Selector */}
              <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Nivel de Afluencia
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'baja', label: 'Libre', color: 'emerald', icon: CheckCircle2 },
                    { id: 'media', label: 'Casi Lleno', color: 'amber', icon: Clock },
                    { id: 'alta', label: 'Espera', color: 'rose', icon: AlertCircle },
                  ].map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setAfluencia(level.id as any)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all active:scale-95",
                        afluencia === level.id 
                          ? `bg-${level.color}-50 border-${level.color}-500 text-${level.color}-700 shadow-lg` 
                          : "bg-slate-50 border-transparent text-slate-400"
                      )}
                    >
                      <level.icon className="w-6 h-6" />
                      <span className="text-[9px] font-black uppercase tracking-tighter">{level.label}</span>
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
              className="space-y-6"
            >
              <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Comercial</label>
                  <input 
                    type="text" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#142850]/30 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Giro / Categoría</label>
                  <input 
                    type="text" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#142850]/30 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dirección Corta</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:outline-none focus:border-[#142850]/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp de Reservas</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input 
                      type="tel" 
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:outline-none focus:border-[#142850]/30 transition-all"
                    />
                  </div>
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
              className="space-y-6"
            >
              <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Oferta del Día ⚡</label>
                  <textarea 
                    value={offerText}
                    onChange={(e) => setOfferText(e.target.value)}
                    placeholder="Ej: Cubetazo 5x4..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#142850]/30 transition-all h-32 resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vigencia</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'today', label: 'Solo Hoy', icon: Calendar },
                      { id: 'permanent', label: 'Permanente', icon: CheckCircle2 },
                    ].map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setOfferValidity(v.id as any)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                          offerValidity === v.id 
                            ? "bg-[#F2E1C1] border-[#142850]/20 text-[#142850]" 
                            : "bg-slate-50 border-transparent text-slate-400"
                        )}
                      >
                        <v.icon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase">{v.label}</span>
                      </button>
                    ))}
                  </div>
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
              className="space-y-6"
            >
              <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-8">
                {/* Cover Image */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Foto de Portada</label>
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-100 group">
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <input type="file" accept="image/*" onChange={handleImageUpload('cover')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Menu Image */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Foto de Menú / Precios</label>
                  <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 group max-w-[200px] mx-auto">
                    <img src={menuImage} alt="Menu" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <input type="file" accept="image/*" onChange={handleImageUpload('menu')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'impacto' && (
            <motion.div
              key="impacto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-[#142850] rounded-[2.5rem] p-8 text-white shadow-2xl space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-widest text-[#F2E1C1]">Impacto Hoy</h2>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#F2E1C1] rounded-xl flex items-center justify-center">
                        <Eye className="w-5 h-5 text-[#142850]" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-70">Vistas Hoy</span>
                    </div>
                    <span className="text-2xl font-black">{stats.vistas}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-[#142850]" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-70">Clics Oferta</span>
                    </div>
                    <span className="text-2xl font-black">{stats.clicsOferta}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#00A8CC] rounded-xl flex items-center justify-center">
                        <Navigation className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-70">Cómo Llegar</span>
                    </div>
                    <span className="text-2xl font-black">{stats.clicsMaps}</span>
                  </div>
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
          className="w-full py-5 bg-[#142850] text-[#F2E1C1] rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#142850]/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
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
            className="fixed bottom-32 left-1/2 bg-[#F2E1C1] text-[#142850] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-[#142850]/10"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Negocio actualizado con éxito</span>
            <button onClick={() => setShowToast(false)}>
              <X className="w-4 h-4 opacity-50" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
