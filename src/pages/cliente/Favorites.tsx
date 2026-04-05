import React from 'react';
import { Heart, MapPin, Star, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

const MOCK_FAVORITES = [
  { id: '1', name: 'Hotel Emporio Acapulco', category: 'Hotel', rating: 4.8, price: '$2,500', image: 'https://picsum.photos/seed/emp/400/300' },
  { id: '2', name: 'Princess Mundo Imperial', category: 'Hotel', rating: 4.9, price: '$3,800', image: 'https://picsum.photos/seed/pri/400/300' },
  { id: '3', name: 'Condo Diamante Lakes', category: 'Renta', rating: 4.9, price: '$5,000', image: 'https://picsum.photos/seed/dia/400/300' },
];

export default function ClienteFavorites() {
  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-2">
          <h1 className="text-4xl font-black text-dark tracking-tighter uppercase leading-none">Mis <span className="text-primary">Favoritos</span></h1>
          <p className="text-muted text-sm font-bold uppercase tracking-widest">Tus lugares guardados en Acapulco</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_FAVORITES.map((fav) => (
            <motion.div 
              key={fav.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 border border-gray-100 group"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={fav.image} 
                  alt={fav.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white hover:bg-rose-500 hover:text-white transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                    {fav.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-dark uppercase tracking-tight">{fav.name}</h3>
                    <div className="flex items-center gap-1 text-muted mt-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">Zona Dorada, Acapulco</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    <span className="text-[10px] font-black text-dark">{fav.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-sm font-black text-dark">{fav.price} <span className="text-[10px] text-muted font-bold uppercase">/ noche</span></span>
                  <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Reservar ahora</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {MOCK_FAVORITES.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Heart className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-sm font-bold text-muted uppercase tracking-widest">No tienes favoritos aún</p>
          </div>
        )}
      </div>
  );
}
