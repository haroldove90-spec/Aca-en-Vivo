import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Building2, 
  Hotel, 
  Store, 
  Palmtree, 
  Compass,
  Zap,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const DEMO_PROFILES = [
  {
    id: 'admin-dev',
    label: 'Admin Desarrollador',
    description: 'Control total del sistema',
    icon: Zap,
    path: '/admin-dev',
    color: 'bg-indigo-600',
    shadow: 'shadow-indigo-200',
    iconColor: 'text-indigo-600'
  },
  {
    id: 'admin-agencia',
    label: 'Admin Agencia',
    description: 'BI y Gestión Comercial',
    icon: ShieldCheck,
    path: '/admin-agencia',
    color: 'bg-navy',
    shadow: 'shadow-blue-200',
    iconColor: 'text-navy'
  },
  {
    id: 'hotel',
    label: 'Dashboard Hotel',
    description: 'Gestión de Reservas',
    icon: Hotel,
    path: '/hotel',
    color: 'bg-emerald-600',
    shadow: 'shadow-emerald-200',
    iconColor: 'text-emerald-600'
  },
  {
    id: 'negocio',
    label: 'Dashboard Negocio',
    description: 'Ventas y Publicidad',
    icon: Store,
    path: '/negocio',
    color: 'bg-orange-500',
    shadow: 'shadow-orange-200',
    iconColor: 'text-orange-500'
  },
  {
    id: 'clasificados',
    label: 'Clasificados',
    description: 'Rentas Particulares',
    icon: Palmtree,
    path: '/clasificados',
    color: 'bg-purple-600',
    shadow: 'shadow-purple-200',
    iconColor: 'text-purple-600'
  },
  {
    id: 'cliente',
    label: 'Vista Turista',
    description: 'Explorar Acapulco',
    icon: Compass,
    path: '/',
    color: 'bg-primary',
    shadow: 'shadow-cyan-200',
    iconColor: 'text-primary'
  }
];

export function DemoAccess() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-6 relative overflow-hidden bg-white">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-none blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-navy/5 rounded-none blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-none border border-primary/20">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Modo Demo Activo</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-dark tracking-tighter uppercase leading-none">
              Explorar como... <br />
              <span className="text-primary">Modo Demo</span>
            </h2>
            <p className="text-lg font-bold text-muted max-w-xl">
              Accede a cualquier panel administrativo o vista de usuario sin necesidad de credenciales para esta demostración técnica.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_PROFILES.map((profile, index) => (
            <motion.button
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(profile.path)}
              className={cn(
                "group relative p-8 rounded-none bg-white border border-gray-100 text-left transition-all",
                "hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20"
              )}
            >
              <div className="flex items-start justify-between mb-8">
                <div className={cn(
                  "w-16 h-16 rounded-none flex items-center justify-center transition-transform group-hover:rotate-6",
                  "bg-gray-50 group-hover:bg-white group-hover:shadow-xl",
                  profile.iconColor
                )}>
                  <profile.icon className="w-8 h-8" />
                </div>
                <div className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-dark uppercase tracking-tight">{profile.label}</h3>
                <p className="text-sm font-bold text-muted uppercase tracking-widest">{profile.description}</p>
              </div>

              {/* Decorative Gradient Border on Hover */}
              <div className="absolute inset-0 rounded-none border-2 border-transparent group-hover:border-primary/10 pointer-events-none transition-all" />
            </motion.button>
          ))}
        </div>

        {/* Bottom Floating Access (Mobile Optimized) */}
        <div className="mt-16 p-8 rounded-none bg-dark text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,168,204,0.1),transparent)]" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-none flex items-center justify-center shadow-2xl shadow-primary/40">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-black uppercase tracking-tighter">Acceso Rápido</h4>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Navega entre perfiles con un toque</p>
            </div>
          </div>
          <div className="relative z-10 flex flex-wrap justify-center gap-3">
            {DEMO_PROFILES.map((p) => (
              <button
                key={`mini-${p.id}`}
                onClick={() => navigate(p.path)}
                className="px-4 py-2 bg-white/5 hover:bg-primary rounded-none text-[10px] font-black uppercase tracking-widest transition-all"
              >
                {p.label.split(' ')[1] || p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
