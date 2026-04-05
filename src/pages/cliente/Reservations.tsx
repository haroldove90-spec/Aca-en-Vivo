import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, CheckCircle2, Loader2, X, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';

export default function ClienteReservations() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      const userId = user?.uid || 'demo-user';
      const q = query(
        collection(db, 'reservas'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const resData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReservations(resData);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching reservations:", err);
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-dark tracking-tighter uppercase leading-none">Mis <span className="text-primary">Reservas</span></h1>
        <p className="text-muted text-sm font-bold uppercase tracking-widest">Tus próximas experiencias en Acapulco</p>
      </header>

      <div className="space-y-6">
        {reservations.map((res) => (
          <motion.div 
            key={res.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-none p-4 shadow-xl shadow-black/5 border border-gray-100 flex flex-col md:flex-row gap-6 group"
          >
            <div className="w-full md:w-48 aspect-square rounded-none overflow-hidden shrink-0">
              <img 
                src={res.businessImage || 'https://picsum.photos/seed/res/400/300'} 
                alt={res.businessName} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-2">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-dark uppercase tracking-tight">{res.businessName}</h3>
                    <div className="flex items-center gap-1 text-muted mt-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">Zona Dorada, Acapulco</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-widest ${
                    res.status === 'confirmada' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {res.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Fecha</span>
                    </div>
                    <p className="text-xs font-bold text-dark">{new Date(res.date).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted">
                      <Clock className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Personas</span>
                    </div>
                    <p className="text-xs font-bold text-dark">2 Adultos</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Estado</span>
                    </div>
                    <p className="text-xs font-bold text-dark uppercase">{res.status}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted">
                      <span className="text-[9px] font-black uppercase tracking-widest">Total</span>
                    </div>
                    <p className="text-xs font-black text-primary">$2,500 MXN</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-6 border-t border-gray-50">
                <button 
                  onClick={() => setSelectedVoucher(res)}
                  className="flex-1 py-3 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Ver Voucher
                </button>
                <button className="flex-1 py-3 bg-gray-50 text-muted rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Voucher Modal */}
      <AnimatePresence>
        {selectedVoucher && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVoucher(null)}
              className="absolute inset-0 bg-dark/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-none overflow-hidden relative shadow-2xl"
            >
              <div className="bg-primary p-8 text-white text-center space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Voucher de Reserva</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">ID: {selectedVoucher.id.slice(0, 8)}</p>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-none overflow-hidden shrink-0">
                    <img src={selectedVoucher.businessImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-dark uppercase tracking-tight">{selectedVoucher.businessName}</h3>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Acapulco, México</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-dashed border-gray-200">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest">Fecha</p>
                    <p className="text-sm font-bold text-dark">{new Date(selectedVoucher.date).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest">Estado</p>
                    <p className="text-sm font-black text-emerald-500 uppercase">{selectedVoucher.status}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest">Titular</p>
                    <p className="text-sm font-bold text-dark">Harold O.</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest">Total</p>
                    <p className="text-sm font-black text-primary">$2,500 MXN</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-dark text-white rounded-none font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Descargar
                  </button>
                  <button className="flex-1 py-4 bg-gray-100 text-dark rounded-none font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" /> Compartir
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setSelectedVoucher(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {reservations.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 bg-white rounded-none flex items-center justify-center mx-auto shadow-sm">
            <Calendar className="w-10 h-10 text-gray-200" />
          </div>
          <p className="text-sm font-bold text-muted uppercase tracking-widest">No tienes reservas aún</p>
        </div>
      )}
    </div>
  );
}
