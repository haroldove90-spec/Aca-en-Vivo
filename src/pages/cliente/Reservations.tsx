import React from 'react';
import { Calendar, MapPin, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const MOCK_RESERVATIONS = [
  { 
    id: 'res-1', 
    hotel: 'Hotel Emporio', 
    date: '15 Abr - 20 Abr', 
    status: 'confirmada', 
    price: '$12,500', 
    image: 'https://picsum.photos/seed/emp/400/300',
    guests: 2,
    room: 'Suite Vista al Mar'
  },
  { 
    id: 'res-2', 
    hotel: 'La Cabaña', 
    date: '16 Abr, 20:00', 
    status: 'pendiente', 
    price: '$850', 
    image: 'https://picsum.photos/seed/cab/400/300',
    guests: 4,
    room: 'Mesa Terraza'
  },
];

export default function ClienteReservations() {
  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-2">
          <h1 className="text-4xl font-black text-dark tracking-tighter uppercase leading-none">Mis <span className="text-primary">Reservas</span></h1>
          <p className="text-muted text-sm font-bold uppercase tracking-widest">Tus próximas experiencias en Acapulco</p>
        </header>

        <div className="space-y-6">
          {MOCK_RESERVATIONS.map((res) => (
            <motion.div 
              key={res.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-black/5 border border-gray-100 flex flex-col md:flex-row gap-6 group"
            >
              <div className="w-full md:w-48 aspect-square rounded-[2rem] overflow-hidden shrink-0">
                <img 
                  src={res.image} 
                  alt={res.hotel} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-2">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-dark uppercase tracking-tight">{res.hotel}</h3>
                      <div className="flex items-center gap-1 text-muted mt-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Zona Dorada, Acapulco</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
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
                      <p className="text-xs font-bold text-dark">{res.date}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted">
                        <Clock className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Personas</span>
                      </div>
                      <p className="text-xs font-bold text-dark">{res.guests} Adultos</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Detalle</span>
                      </div>
                      <p className="text-xs font-bold text-dark">{res.room}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted">
                        <span className="text-[9px] font-black uppercase tracking-widest">Total</span>
                      </div>
                      <p className="text-xs font-black text-primary">{res.price}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-6 border-t border-gray-50">
                  <button className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                    Ver Voucher
                  </button>
                  <button className="flex-1 py-3 bg-gray-50 text-muted rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {MOCK_RESERVATIONS.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Calendar className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-sm font-bold text-muted uppercase tracking-widest">No tienes reservas aún</p>
          </div>
        )}
      </div>
  );
}
