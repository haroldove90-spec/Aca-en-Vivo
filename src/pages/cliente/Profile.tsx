import React, { useEffect, useState } from 'react';
import { User, MapPin, Mail, Phone, Calendar, Edit3, Settings, LogOut, Shield, Loader2, Star, Palmtree, Hotel } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ClienteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: 'Harold Dev',
    username: '@harold_aca',
    email: 'haroldove90@gmail.com',
    phone: '+52 744 123 4567',
    location: 'Acapulco, Guerrero',
    joined: 'Abril 2024',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Harold',
    stats: [
      { label: 'Reservas', value: '12' },
      { label: 'Favoritos', value: '45' },
      { label: 'Reseñas', value: '8' },
    ]
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUserData(prev => ({
              ...prev,
              name: profile.full_name || session.user.user_metadata?.full_name || prev.name,
              username: profile.username ? `@${profile.username}` : prev.username,
              email: session.user.email || prev.email,
              avatar: profile.avatar_url || session.user.user_metadata?.avatar_url || prev.avatar,
              location: profile.address || prev.location,
              phone: profile.phone || prev.phone
            }));
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error("Error signing out:", error);
      window.location.href = '/';
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
    <div className="space-y-8 pb-20 pt-8 px-6 lg:px-0">
      {/* Profile Header */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <div className="relative group">
          <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
            <img 
              src={userData.avatar} 
              alt={userData.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <button 
            onClick={() => navigate('/settings')}
            className="absolute bottom-1 right-1 w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center shadow-lg border border-gray-100 hover:scale-110 transition-transform"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center lg:text-left space-y-4 flex-1">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-4xl font-black text-dark tracking-tight">{userData.name}</h1>
            <p className="text-muted font-medium">{userData.username} · Miembro desde {userData.joined}</p>
          </div>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              Nivel Genius 2
            </div>
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              Perfil Verificado
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col gap-3 w-full lg:w-auto">
          <button 
            onClick={() => navigate('/settings')}
            className="flex-1 lg:w-48 py-3 bg-white border border-primary text-primary rounded-sm font-bold text-sm hover:bg-primary/5 transition-all"
          >
            Gestionar cuenta
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 lg:w-48 py-3 bg-white border border-rose-200 text-rose-500 rounded-sm font-bold text-sm hover:bg-rose-50 transition-all"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {userData.stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm flex flex-col items-center text-center gap-1">
            <span className="text-2xl font-black text-dark">{stat.value}</span>
            <span className="text-xs font-bold text-muted uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-black text-dark uppercase tracking-widest text-sm">Información Personal</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Correo electrónico</p>
                <p className="text-sm font-bold text-dark">{userData.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-primary">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Teléfono</p>
                <p className="text-sm font-bold text-dark">{userData.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Ubicación</p>
                <p className="text-sm font-bold text-dark">{userData.location}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-black text-dark uppercase tracking-widest text-sm">Preferencias de Viaje</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-sm">
              <div className="flex items-center gap-3">
                <Palmtree className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-dark">Destino favorito</span>
              </div>
              <span className="text-xs font-bold text-primary">Acapulco Diamante</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-sm">
              <div className="flex items-center gap-3">
                <Hotel className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-dark">Tipo de alojamiento</span>
              </div>
              <span className="text-xs font-bold text-primary">Hoteles de Lujo</span>
            </div>
            <button className="w-full py-3 text-primary font-bold text-sm hover:underline">
              Editar preferencias de viaje
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
