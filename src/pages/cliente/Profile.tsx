import React from 'react';
import { User, MapPin, Mail, Phone, Calendar, Edit3, Settings, LogOut, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

const MOCK_USER = {
  name: 'Harold Dev',
  username: '@harold_aca',
  email: 'haroldove90@gmail.com',
  phone: '+52 744 123 4567',
  location: 'Acapulco, Guerrero',
  joined: 'Abril 2024',
  avatar: 'https://picsum.photos/seed/harold/400/400',
  stats: [
    { label: 'Reservas', value: '12' },
    { label: 'Favoritos', value: '45' },
    { label: 'Reseñas', value: '8' },
  ]
};

export default function ClienteProfile() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error("Error signing out:", error);
      window.location.href = '/';
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Profile Header Card */}
        <section className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-2xl shadow-black/5 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/20 border-4 border-white">
                <img 
                  src={MOCK_USER.avatar} 
                  alt={MOCK_USER.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button 
                onClick={() => navigate('/settings')}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white hover:scale-110 transition-transform"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center lg:text-left space-y-4 flex-1">
              <div>
                <h1 className="text-4xl font-black text-dark tracking-tighter uppercase leading-none">{MOCK_USER.name}</h1>
                <p className="text-primary font-black text-sm uppercase tracking-widest mt-2">{MOCK_USER.username}</p>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-2 text-muted">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{MOCK_USER.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Miembro desde {MOCK_USER.joined}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 space-y-8">
            <h3 className="text-sm font-black text-dark uppercase tracking-widest flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Información de Contacto
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest">Email</p>
                  <p className="text-sm font-bold text-dark">{MOCK_USER.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest">Teléfono</p>
                  <p className="text-sm font-bold text-dark">{MOCK_USER.phone}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 space-y-8">
            <h3 className="text-sm font-black text-dark uppercase tracking-widest flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Acciones Rápidas
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => navigate('/settings')}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-primary/5 rounded-2xl border border-gray-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-dark uppercase tracking-widest">Seguridad y Privacidad</span>
                </div>
                <Edit3 className="w-4 h-4 text-muted" />
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center justify-between p-4 bg-rose-50 hover:bg-rose-100 rounded-2xl border border-rose-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-rose-500">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-rose-600 uppercase tracking-widest">Cerrar Sesión</span>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>
  );
}
