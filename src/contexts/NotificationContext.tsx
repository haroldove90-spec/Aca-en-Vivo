import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle2, Building2, UserCheck, Zap, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';

interface NotificationEvent {
  id: string;
  title: string;
  body: string;
  type: 'registration' | 'payment' | 'alert' | 'message';
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: NotificationEvent[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  sendLocalNotification: (title: string, body: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [newRegPopup, setNewRegPopup] = useState<NotificationEvent | null>(null);
  const [audio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')); // Ping sound

  const unreadCount = notifications.filter(n => !n.read).length;

  const sendLocalNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    audio.play().catch(e => console.log('Audio play blocked:', e));
  }, [audio]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  useEffect(() => {
    // Request permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Listen for new establishments (Simulating Supabase Realtime with Firestore)
    const qEst = query(
      collection(db, 'establecimientos'), 
      where('createdAt', '>', Timestamp.now()), // Only new ones from now
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribeEst = onSnapshot(qEst, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const newEvent: NotificationEvent = {
            id: change.doc.id,
            title: '¡NUEVO ALIADO REGISTRADO!',
            body: `${data.nombre} se ha unido a la plataforma.`,
            type: 'registration',
            timestamp: new Date(),
            read: false,
            data: { id: change.doc.id, ...data }
          };

          setNotifications(prev => [newEvent, ...prev].slice(0, 10));
          setNewRegPopup(newEvent);
          sendLocalNotification(newEvent.title, newEvent.body);
          playNotificationSound();

          // Auto-hide popup after 8 seconds
          setTimeout(() => setNewRegPopup(null), 8000);
        }
      });
    });

    // Mock initial notifications for demo
    const mockNotifications: NotificationEvent[] = [
      {
        id: 'mock-1',
        title: 'Nuevo Mensaje',
        body: 'Hotel Emporio: ¿Cómo puedo actualizar mi plan?',
        type: 'message',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false
      },
      {
        id: 'mock-2',
        title: 'Nuevo Clasificado',
        body: 'Depa con vista al mar en Zona Diamante registrado.',
        type: 'registration',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        read: true
      },
      {
        id: 'mock-3',
        title: 'Pago Recibido',
        body: 'Yates Bonanza ha renovado su suscripción Premium.',
        type: 'payment',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        read: true
      }
    ];
    setNotifications(mockNotifications);

    return () => unsubscribeEst();
  }, [sendLocalNotification, playNotificationSound]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, sendLocalNotification }}>
      {children}
      
      {/* Giant Animated Popup for Admins */}
      <AnimatePresence>
        {newRegPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100 }}
            className="fixed inset-x-0 bottom-10 z-[200] flex justify-center px-6"
          >
            <div className="bg-dark text-white p-8 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/10 max-w-2xl w-full flex items-center gap-8 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
              
              <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/40 shrink-0 rotate-3">
                <Building2 className="w-12 h-12 text-white" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">Nuevo Registro</span>
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">¡Justo ahora!</span>
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">¡NUEVO ALIADO REGISTRADO!</h2>
                <p className="text-lg font-bold text-white/60">{newRegPopup.data?.nombre || 'Nuevo Negocio'}</p>
                <div className="flex gap-4 pt-4">
                  <button className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-primary/90 transition-all">
                    Ver Perfil
                  </button>
                  <button 
                    onClick={() => setNewRegPopup(null)}
                    className="px-8 py-4 bg-white/5 text-white/60 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Ignorar
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setNewRegPopup(null)}
                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
