import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Camera, 
  Upload, 
  Bell, 
  Shield, 
  Smartphone,
  Image as ImageIcon,
  Save,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useNotifications } from '../../contexts/NotificationContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { CameraModal } from '../../components/CameraModal';

export default function ClienteSettings() {
  const { sendLocalNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser || { uid: 'demo-user', email: 'haroldove90@gmail.com' };
      try {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            name: data.name || 'Harold Dev',
            username: data.username || 'harold_aca',
            email: user.email || 'haroldove90@gmail.com',
            notifications: data.notifications || { push: true, email: true, sms: false }
          });
          setCapturedImage(data.photoURL || null);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
    const user = auth.currentUser || { uid: 'demo-user' };
    try {
      const docRef = doc(db, 'profiles', user.uid);
      await setDoc(docRef, {
        ...profileData,
        photoURL: capturedImage,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      sendLocalNotification('Perfil Actualizado', 'Tus cambios se han guardado correctamente.');
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendLocalNotification('¡Notificaciones Activas!', 'Ahora recibirás alertas en tiempo real.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-12 pb-20 pt-8 px-6 lg:px-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-dark tracking-tight">Configuración de la cuenta</h1>
          <p className="text-muted font-medium">Gestiona tu información personal, seguridad y preferencias</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-1">
            {[
              { id: 'profile', label: 'Información personal', icon: User },
              { id: 'notifications', label: 'Notificaciones', icon: Bell },
              { id: 'security', label: 'Seguridad', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted hover:bg-gray-50 hover:text-dark"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="font-black text-dark uppercase tracking-widest text-sm">Información Personal</h2>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="flex items-center gap-8">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100">
                          <img src={capturedImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.email}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <button 
                          onClick={() => setShowCamera(true)}
                          className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold uppercase"
                        >
                          Cambiar
                        </button>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Nombre completo</label>
                            <input 
                              type="text" 
                              value={profileData.name}
                              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Nombre de usuario</label>
                            <input 
                              type="text" 
                              value={profileData.username}
                              onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-primary text-white rounded-sm font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="font-black text-dark uppercase tracking-widest text-sm">Preferencias de Notificación</h2>
                  </div>
                  <div className="p-8 space-y-6">
                    {[
                      { id: 'email', label: 'Notificaciones por email', desc: 'Recibe actualizaciones sobre tus reservas en tu correo' },
                      { id: 'push', label: 'Notificaciones push', desc: 'Alertas en tiempo real en tu navegador o móvil' },
                      { id: 'sms', label: 'Mensajes de texto', desc: 'Recordatorios importantes vía SMS' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-sm">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-dark">{item.label}</p>
                          <p className="text-xs text-muted">{item.desc}</p>
                        </div>
                        <button 
                          onClick={() => setProfileData({
                            ...profileData, 
                            notifications: { ...profileData.notifications, [item.id]: !profileData.notifications[item.id as keyof typeof profileData.notifications] }
                          })}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            profileData.notifications[item.id as keyof typeof profileData.notifications] ? "bg-primary" : "bg-gray-200"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            profileData.notifications[item.id as keyof typeof profileData.notifications] ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <CameraModal 
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(img) => setCapturedImage(img)}
      />
    </>
  );
}
