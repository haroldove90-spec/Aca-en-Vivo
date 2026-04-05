import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Heart, 
  Bookmark, 
  User, 
  Grid, 
  Bell,
  Search,
  LogOut,
  Settings,
  Palmtree,
  Menu,
  X,
  Hotel,
  Store,
  ShieldCheck,
  Zap,
  DollarSign,
  Building2,
  MessageSquare,
  TrendingUp,
  Users,
  MapPin,
  RotateCcw,
  FileText,
  ImageIcon,
  Clock,
  Smartphone,
  Calendar,
  Phone,
  Activity,
  Database
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../contexts/NotificationContext';
import { useSearch } from '../contexts/SearchContext';
import { SupportChat } from './SupportChat';

import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
}

const getNavItems = (pathname: string) => {
  if (pathname.includes('/admin-agencia')) {
    return [
      { id: 'dashboard', label: 'Panel', icon: Grid, path: '/admin-agencia' },
      { id: 'afiliados', label: 'Afiliados', icon: Users, path: '/admin-agencia?tab=afiliados' },
      { id: 'zonas', label: 'Zonas', icon: MapPin, path: '/admin-agencia?tab=zonas' },
      { id: 'pagos', label: 'Pagos', icon: DollarSign, path: '/admin-agencia?tab=pagos' },
    ];
  }
  if (pathname.includes('/hotel')) {
    return [
      { id: 'inventario', label: 'Inventario', icon: RotateCcw, path: '/hotel?tab=inventario' },
      { id: 'perfil', label: 'Perfil', icon: FileText, path: '/hotel?tab=perfil' },
      { id: 'galeria', label: 'Galería', icon: ImageIcon, path: '/hotel?tab=galeria' },
      { id: 'promociones', label: 'Promos', icon: Zap, path: '/hotel?tab=promociones' },
    ];
  }
  if (pathname.includes('/negocio')) {
    return [
      { id: 'estado', label: 'Estado', icon: Clock, path: '/negocio?tab=estado' },
      { id: 'perfil', label: 'Perfil', icon: Smartphone, path: '/negocio?tab=perfil' },
      { id: 'ofertas', label: 'Ofertas', icon: Zap, path: '/negocio?tab=ofertas' },
      { id: 'multimedia', label: 'Media', icon: ImageIcon, path: '/negocio?tab=multimedia' },
      { id: 'impacto', label: 'Impacto', icon: TrendingUp, path: '/negocio?tab=impacto' },
    ];
  }
  if (pathname.includes('/clasificados')) {
    return [
      { id: 'dashboard', label: 'Panel', icon: Home, path: '/clasificados?tab=dashboard' },
      { id: 'propiedad', label: 'Propiedad', icon: Building2, path: '/clasificados?tab=propiedad' },
      { id: 'disponibilidad', label: 'Disponibilidad', icon: Calendar, path: '/clasificados?tab=disponibilidad' },
      { id: 'contacto', label: 'Contacto', icon: Phone, path: '/clasificados?tab=contacto' },
    ];
  }
  if (pathname.includes('/admin-dev')) {
    return [
      { id: 'master', label: 'Master', icon: Zap, path: '/admin-dev' },
      { id: 'logs', label: 'Logs', icon: Activity, path: '/admin-dev?tab=logs' },
      { id: 'config', label: 'Config', icon: Settings, path: '/admin-dev?tab=config' },
    ];
  }
  // Default (Cliente)
  return [
    { id: 'explorar', label: 'Inicio', icon: Home, path: '/' },
    { id: 'hoteles', label: 'Hoteles', icon: Hotel, path: '/?cat=hotel' },
    { id: 'clasificados', label: 'Rentas', icon: Building2, path: '/?cat=clasificados' },
    { id: 'favoritos', label: 'Favoritos', icon: Heart, path: '/favoritos' },
    { id: 'reservas', label: 'Reservas', icon: Bookmark, path: '/reservas' },
    { id: 'perfil', label: 'Perfil', icon: User, path: '/perfil' },
    { id: 'settings', label: 'Ajustes', icon: Settings, path: '/settings' },
  ];
};

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { searchQuery, setSearchQuery } = useSearch();

  const navItems = getNavItems(location.pathname);
  const isAdmin = location.pathname.includes('admin') || location.pathname.includes('agencia');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error("Error signing out:", error);
      window.location.href = '/';
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname + location.search === path;
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row font-sans selection:bg-primary/30">
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0 p-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 hover:rotate-0 transition-transform">
            <Palmtree className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-dark tracking-tighter leading-none uppercase">AcaEnVivo</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mt-1">Experiencia</p>
          </div>
        </motion.div>

        <nav className="flex-1 space-y-3">
          {navItems.map((item, index) => (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-none transition-all font-black text-sm uppercase tracking-widest group",
                isActive(item.path) 
                  ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" 
                  : "text-muted hover:bg-gray-50 hover:text-dark"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive(item.path) ? "text-white" : "text-primary")} />
              {item.label}
            </motion.button>
          ))}
        </nav>

        <div className="pt-8 border-t border-gray-100 space-y-3">
          <button className="w-full flex items-center gap-4 px-5 py-4 rounded-none text-muted hover:bg-gray-50 hover:text-dark transition-all font-black text-sm uppercase tracking-widest group">
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            Ajustes
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-none text-rose-500 hover:bg-rose-50 transition-all font-black text-sm uppercase tracking-widest"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile/Tablet Top Nav */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          {/* App Logo & Name */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-none flex items-center justify-center shadow-lg shadow-primary/20">
              <Palmtree className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-sm font-black text-dark tracking-tighter uppercase leading-none">AcaEnVivo</h1>
          </div>

          {/* Minimalist Search Bar */}
          <div className="flex-1 relative group max-w-[140px] sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 text-dark rounded-none py-2 pl-8 pr-3 text-[10px] font-bold placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 border border-transparent focus:border-primary/20 transition-all"
            />
          </div>

          <div className="flex gap-1.5 shrink-0">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="w-9 h-9 bg-gray-100 rounded-none flex items-center justify-center border border-gray-200 relative text-muted"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-none border border-white" />
              )}
            </button>
            <button 
              onClick={handleLogout}
              className="w-9 h-9 bg-gray-100 rounded-none flex items-center justify-center border border-gray-200 text-rose-500 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Desktop Top Header (Hidden on mobile) */}
        <header className="hidden lg:flex items-center justify-between px-12 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar destinos, hoteles, experiencias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 rounded-none py-2.5 pl-14 pr-4 text-sm font-bold placeholder:text-muted focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all border border-transparent focus:border-primary/10"
            />
          </div>
          <div className="flex items-center gap-8 ml-12">
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative text-muted hover:text-primary transition-all hover:scale-110"
              >
                <Bell className="w-7 h-7" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-none border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                    {unreadCount}
                  </div>
                )}
              </button>

              {/* Notification Panel */}
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed lg:absolute right-4 lg:right-0 top-20 lg:top-auto mt-0 lg:mt-6 w-[calc(100vw-2rem)] lg:w-96 bg-white rounded-none shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100]"
                  >
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-black text-dark uppercase tracking-[0.2em]">Notificaciones</h3>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{unreadCount} Nuevas</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center space-y-4">
                          <Bell className="w-10 h-10 text-gray-100 mx-auto" />
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest">Sin notificaciones</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={cn(
                              "w-full p-6 flex gap-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0",
                              !n.read && "bg-primary/5"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-none flex items-center justify-center shrink-0",
                              n.type === 'registration' ? "bg-blue-100 text-blue-600" :
                              n.type === 'payment' ? "bg-emerald-100 text-emerald-600" :
                              n.type === 'message' ? "bg-amber-100 text-amber-600" :
                              "bg-gray-100 text-gray-600"
                            )}>
                              {n.type === 'registration' ? <Building2 className="w-5 h-5" /> :
                               n.type === 'payment' ? <DollarSign className="w-5 h-5" /> :
                               n.type === 'message' ? <MessageSquare className="w-5 h-5" /> :
                               <Zap className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-dark uppercase tracking-tight truncate">{n.title}</p>
                              <p className="text-[11px] font-bold text-muted mt-1 line-clamp-2">{n.body}</p>
                              <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-2">Hace 5 min</p>
                            </div>
                            {!n.read && <div className="w-2 h-2 bg-primary rounded-none mt-2" />}
                          </button>
                        ))
                      )}
                    </div>
                    <button className="w-full p-6 bg-gray-50 text-dark font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                      Ver Todo el Historial
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={handleLogout}
              className="w-12 h-12 bg-bg rounded-none flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all shadow-sm border border-gray-100"
            >
              <LogOut className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 pl-8 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-black text-dark tracking-tight leading-none">Jack Fitzgerald</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Miembro Premium</p>
              </div>
              <div className="w-12 h-12 rounded-none overflow-hidden border-2 border-gray-50 shadow-lg hover:rotate-3 transition-transform cursor-pointer">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack" 
                  alt="Usuario" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <SupportChat isAdmin={isAdmin} />

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl flex justify-around items-center border-t border-gray-100 z-50 h-16">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-all relative group",
              isActive(item.path) 
                ? "text-primary" 
                : "text-muted hover:text-primary"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive(item.path) && "scale-110")} />
            <span className="text-[8px] font-black uppercase tracking-tighter mt-1">{item.label}</span>
            {isActive(item.path) && (
              <motion.div 
                layoutId="activeTab"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-none"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
