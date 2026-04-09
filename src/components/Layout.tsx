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
  Database,
  ShoppingBag,
  Edit2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../contexts/NotificationContext';
import { useSearch } from '../contexts/SearchContext';
import { SupportChat } from './SupportChat';

import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
  onAuthClick?: () => void;
}

const getNavItems = (pathname: string) => {
  if (pathname.startsWith('/admin-agencia')) {
    return [
      { id: 'dashboard', label: 'Panel', icon: Grid, path: '/admin-agencia' },
      { id: 'afiliados', label: 'Afiliados', icon: Building2, path: '/admin-agencia?tab=afiliados' },
      { id: 'usuarios', label: 'Usuarios', icon: Users, path: '/admin-agencia?tab=usuarios' },
      { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/admin-agencia?tab=chat' },
      { id: 'zonas', label: 'Zonas', icon: MapPin, path: '/admin-agencia?tab=zonas' },
      { id: 'pagos', label: 'Pagos', icon: DollarSign, path: '/admin-agencia?tab=pagos' },
    ];
  }
  if (pathname.startsWith('/hotel')) {
    return [
      { id: 'inventario', label: 'Inventario', icon: RotateCcw, path: '/hotel?tab=inventario' },
      { id: 'perfil', label: 'Perfil', icon: FileText, path: '/hotel?tab=perfil' },
      { id: 'galeria', label: 'Galería', icon: ImageIcon, path: '/hotel?tab=galeria' },
      { id: 'promociones', label: 'Promos', icon: Zap, path: '/hotel?tab=promociones' },
    ];
  }
  if (pathname.startsWith('/negocio')) {
    return [
      { id: 'estado', label: 'Estado', icon: Clock, path: '/negocio?tab=estado' },
      { id: 'perfil', label: 'Perfil', icon: Smartphone, path: '/negocio?tab=perfil' },
      { id: 'ofertas', label: 'Ofertas', icon: Zap, path: '/negocio?tab=ofertas' },
      { id: 'multimedia', label: 'Media', icon: ImageIcon, path: '/negocio?tab=multimedia' },
      { id: 'impacto', label: 'Impacto', icon: TrendingUp, path: '/negocio?tab=impacto' },
    ];
  }
  if (pathname.startsWith('/clasificados')) {
    return [
      { id: 'dashboard', label: 'Panel', icon: Home, path: '/clasificados?tab=dashboard' },
      { id: 'propiedad', label: 'Propiedad', icon: Building2, path: '/clasificados?tab=propiedad' },
      { id: 'disponibilidad', label: 'Disponibilidad', icon: Calendar, path: '/clasificados?tab=disponibilidad' },
      { id: 'contacto', label: 'Contacto', icon: Phone, path: '/clasificados?tab=contacto' },
    ];
  }
  if (pathname.startsWith('/admin-dev')) {
    return [
      { id: 'master', label: 'Master', icon: Zap, path: '/admin-dev' },
      { id: 'logs', label: 'Logs', icon: Activity, path: '/admin-dev?tab=logs' },
      { id: 'config', label: 'Config', icon: Settings, path: '/admin-dev?tab=config' },
    ];
  }
  // Default (Cliente)
  return [
    { id: 'explorar', label: 'Inicio', icon: Home, path: '/' },
    { id: 'favoritos', label: 'Favoritos', icon: Heart, path: '/favoritos' },
    { id: 'reservas', label: 'Reservas', icon: Bookmark, path: '/reservas' },
    { id: 'perfil', label: 'Perfil', icon: User, path: '/perfil' },
    { id: 'clasificados', label: 'Rentas', icon: Building2, path: '/?cat=clasificados' },
    { id: 'hoteles', label: 'Hoteles', icon: Hotel, path: '/?cat=hotel' },
    { id: 'settings', label: 'Ajustes', icon: Settings, path: '/settings' },
  ];
};

export function Layout({ children, onAuthClick }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [profileRole, setProfileRole] = React.useState<string | null>(null);
  const [language, setLanguage] = React.useState<'ES' | 'EN'>('ES');
  const [currency, setCurrency] = React.useState<'MXN' | 'USD'>('MXN');
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { searchQuery, setSearchQuery } = useSearch();

  React.useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (data) setProfileRole(data.role);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfileRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() && location.pathname !== '/') {
      navigate('/');
    }
  };

  const navItems = getNavItems(location.pathname);
  const isAdmin = location.pathname.includes('admin') || location.pathname.includes('agencia');

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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

  const userRole = profileRole || user?.user_metadata?.role || (user?.email === 'haroldove90@gmail.com' || user?.email === 'haroldo90@hotmail.com' ? 'admin' : null);
  const canSwitchRoles = userRole === 'admin' || userRole === 'admin-dev' || userRole === 'agencia' || user?.email === 'haroldove90@gmail.com' || user?.email === 'haroldo90@hotmail.com';

  const roleLabels: Record<string, string> = {
    'admin': 'Administrador',
    'agencia': 'Agencia',
    'hotel': 'Hotelero',
    'negocio': 'Socio Comercial',
    'clasificados': 'Anunciante',
    'cliente': 'Cliente Premium',
    'admin-dev': 'Desarrollador'
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans selection:bg-primary/30">
      {/* Top Header (Desktop & Mobile) */}
      <header className="bg-navy sticky top-0 z-50 shadow-2xl overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 blur-[100px]" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          {/* Top Row: Logo & Actions */}
          <div className="flex items-center justify-between py-4 lg:py-6">
            <div 
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-none flex items-center justify-center border border-white/20 rotate-3 group-hover:rotate-0 transition-transform">
                <Palmtree className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">AcaEnVivo</h1>
            </div>
              <div className="flex items-center gap-4 lg:gap-8">
                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-6 pr-6 border-r border-white/10">
                  <button 
                    onClick={() => setCurrency(currency === 'MXN' ? 'USD' : 'MXN')}
                    className="text-white/80 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    {currency}
                  </button>
                  <button 
                    onClick={() => setLanguage(language === 'ES' ? 'EN' : 'ES')}
                    className="text-white/80 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    {language}
                  </button>
                </div>

                <div className="flex items-center gap-4 lg:gap-6">
                  {canSwitchRoles && (
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-none border border-white/10">
                      {[
                        { id: 'admin', label: 'Agencia', path: '/admin-agencia', icon: ShieldCheck },
                        { id: 'dev', label: 'Dev', path: '/admin-dev', icon: Database },
                        { id: 'cliente', label: 'Cliente', path: '/', icon: User },
                      ].map((role) => (
                        <button
                          key={role.id}
                          onClick={() => navigate(role.path)}
                          className={cn(
                            "flex items-center gap-2 px-2 lg:px-3 py-1.5 text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all",
                            (location.pathname === role.path || (role.id === 'cliente' && location.pathname === '/'))
                              ? "bg-primary text-white"
                              : "text-white/60 hover:text-white hover:bg-white/10"
                          )}
                        >
                          <role.icon className="w-3 h-3" />
                          <span className={cn(role.id === 'cliente' ? "hidden sm:inline" : "inline")}>{role.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="relative">

                  <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative text-white/60 hover:text-accent transition-all hover:scale-110"
                  >
                    <Bell className="w-6 h-6 lg:w-7 lg:h-7" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-none border-2 border-navy flex items-center justify-center text-[8px] font-black text-dark">
                        {unreadCount}
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-[90]" 
                          onClick={() => setIsNotifOpen(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-4 w-[calc(100vw-2rem)] lg:w-96 bg-white rounded-none shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100]"
                        >
                          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-black text-dark uppercase tracking-[0.2em]">Notificaciones</h3>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{unreadCount} Nuevas</span>
                              <button onClick={() => setIsNotifOpen(false)} className="text-muted hover:text-dark">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
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
                        <button 
                          onClick={() => {
                            navigate('/notificaciones');
                            setIsNotifOpen(false);
                          }}
                          className="w-full p-6 bg-gray-50 text-dark font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                        >
                          Ver Todo el Historial
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
                </div>

                {user ? (
                  <div 
                    onClick={() => navigate('/perfil')}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="hidden lg:block text-right">
                      <p className="text-xs font-black text-white tracking-tight leading-none group-hover:text-accent transition-colors">
                        {user.user_metadata?.full_name || 'Usuario'}
                      </p>
                      <p className="text-[9px] font-bold text-accent uppercase tracking-[0.2em] mt-1">
                        {roleLabels[userRole || 'cliente'] || 'Cliente'}
                      </p>
                    </div>
                    <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-none overflow-hidden border-2 border-white/20 shadow-lg group-hover:rotate-3 transition-transform">
                      <img 
                        src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                        alt="Usuario" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onAuthClick}
                    className="px-6 py-2 bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                  >
                    Entrar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Navigation Tabs */}
          <div className="flex items-center gap-2 lg:gap-4 pb-4 overflow-x-auto no-scrollbar">
            {navItems.filter(item => ['explorar', 'hoteles', 'clasificados', 'favoritos', 'reservas'].includes(item.id)).map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                  isActive(item.path)
                    ? "bg-white/10 border-white text-white shadow-lg"
                    : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto">
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

      {/* Mobile Bottom Nav (Optional, maybe keep for better UX) */}
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
