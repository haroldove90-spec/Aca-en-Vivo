import React from 'react';
import { Bell, Clock, Building2, DollarSign, MessageSquare, Zap, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export default function NotificationHistory() {
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest hover:underline mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
          <h1 className="text-4xl font-black text-dark tracking-tighter uppercase leading-none">Historial de Notificaciones</h1>
          <p className="text-muted text-sm font-bold uppercase tracking-widest">Mantente al tanto de toda tu actividad</p>
        </div>
        <div className="w-16 h-16 bg-primary/10 rounded-none flex items-center justify-center">
          <Bell className="w-8 h-8 text-primary" />
        </div>
      </header>

      <div className="bg-white rounded-none shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-20 text-center space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-none flex items-center justify-center mx-auto">
              <Bell className="w-12 h-12 text-gray-200" />
            </div>
            <p className="text-sm font-black text-muted uppercase tracking-widest">No tienes notificaciones por ahora</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={cn(
                  "p-8 flex gap-6 hover:bg-gray-50 transition-all cursor-pointer group",
                  !n.read && "bg-primary/5"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-none flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform",
                  n.type === 'registration' ? "bg-blue-100 text-blue-600" :
                  n.type === 'payment' ? "bg-emerald-100 text-emerald-600" :
                  n.type === 'message' ? "bg-amber-100 text-amber-600" :
                  "bg-gray-100 text-gray-600"
                )}>
                  {n.type === 'registration' ? <Building2 className="w-6 h-6" /> :
                   n.type === 'payment' ? <DollarSign className="w-6 h-6" /> :
                   n.type === 'message' ? <MessageSquare className="w-6 h-6" /> :
                   <Zap className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-dark uppercase tracking-tight">{n.title}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase">
                      <Clock className="w-3 h-3" />
                      Hace 5 min
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted leading-relaxed">{n.body}</p>
                  {!n.read && (
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-2 h-2 bg-primary rounded-none" />
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">Nueva</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
