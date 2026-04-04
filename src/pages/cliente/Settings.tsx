import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { 
  User, 
  Camera, 
  Upload, 
  Bell, 
  Shield, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  Smartphone,
  Image as ImageIcon,
  Save,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useNotifications } from '../../contexts/NotificationContext';

export default function ClienteSettings() {
  const { sendLocalNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: 'Harold Dev',
    username: 'harold_aca',
    email: 'haroldove90@gmail.com',
    notifications: {
      push: true,
      email: true,
      sms: false
    }
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Camera Functions ---
  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("No se pudo acceder a la cámara");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    sendLocalNotification('Perfil Actualizado', 'Tus cambios se han guardado correctamente.');
  };

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendLocalNotification('¡Notificaciones Activas!', 'Ahora recibirás alertas en tiempo real.');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        <header className="space-y-2">
          <h1 className="text-4xl font-black text-dark tracking-tighter uppercase leading-none">Configuración</h1>
          <p className="text-muted text-sm font-bold uppercase tracking-widest">Personaliza tu experiencia en Acapulco</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 p-2 bg-gray-100 rounded-[2rem] w-fit">
          {[
            { id: 'profile', label: 'Perfil', icon: User },
            { id: 'notifications', label: 'Notificaciones', icon: Bell },
            { id: 'security', label: 'Seguridad', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id 
                  ? "bg-white text-primary shadow-lg" 
                  : "text-muted hover:text-dark"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-2xl shadow-black/5 border border-gray-100 space-y-10"
            >
              {/* Avatar Section */}
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/20 border-4 border-white bg-gray-50 flex items-center justify-center">
                    {capturedImage ? (
                      <img src={capturedImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-gray-200" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex flex-col gap-2">
                    <button 
                      onClick={startCamera}
                      className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-xl border-2 border-white hover:scale-110 transition-transform"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-10 h-10 bg-navy text-white rounded-xl flex items-center justify-center shadow-xl border-2 border-white hover:scale-110 transition-transform"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                  />
                </div>
                
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <h3 className="text-xl font-black text-dark uppercase tracking-tight">Foto de Perfil</h3>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest leading-relaxed max-w-sm">
                    Sube una foto o tómala directamente con tu cámara. Formatos permitidos: JPG, PNG. Máx 5MB.
                  </p>
                </div>
              </div>

              {/* Form Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-gray-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Nombre de Usuario</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black">@</span>
                    <input 
                      type="text" 
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      className="w-full pl-10 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={profileData.email}
                    disabled
                    className="w-full px-6 py-4 bg-gray-100 border border-gray-200 rounded-2xl font-bold text-muted cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-2xl shadow-black/5 border border-gray-100 space-y-10"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-dark uppercase tracking-tight">Centro de Notificaciones</h3>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Controla cómo te mantenemos informado</p>
                </div>
                <button 
                  onClick={requestNotificationPermission}
                  className="px-6 py-3 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                >
                  Probar Permisos
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'push', label: 'Notificaciones Push', desc: 'Alertas en tiempo real en tu navegador', icon: Bell },
                  { id: 'email', label: 'Correo Electrónico', desc: 'Resúmenes semanales y confirmaciones', icon: ImageIcon },
                  { id: 'sms', label: 'Mensajes SMS', desc: 'Alertas críticas de seguridad', icon: Smartphone },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-dark uppercase tracking-tight">{item.label}</p>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{item.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setProfileData({
                        ...profileData, 
                        notifications: { ...profileData.notifications, [item.id]: !profileData.notifications[item.id as keyof typeof profileData.notifications] }
                      })}
                      className={cn(
                        "w-14 h-8 rounded-full p-1 transition-all duration-300",
                        profileData.notifications[item.id as keyof typeof profileData.notifications] ? "bg-primary" : "bg-gray-300"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300",
                        profileData.notifications[item.id as keyof typeof profileData.notifications] ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera Modal */}
        <AnimatePresence>
          {showCamera && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-dark/90 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <div className="bg-white rounded-[3rem] overflow-hidden max-w-2xl w-full shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative">
                <div className="aspect-video bg-black relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                <div className="p-8 flex justify-center gap-6">
                  <button 
                    onClick={stopCamera}
                    className="w-16 h-16 bg-gray-100 text-muted rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
                  >
                    <X className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={takePhoto}
                    className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 transition-all"
                  >
                    <div className="w-16 h-16 border-4 border-white/30 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full" />
                    </div>
                  </button>
                </div>
                
                <button 
                  onClick={stopCamera}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
