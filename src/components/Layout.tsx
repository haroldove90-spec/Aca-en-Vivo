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
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'hotel', label: 'Hotel', icon: Hotel, path: '/hotel' },
  { id: 'negocio', label: 'Negocio', icon: Store, path: '/negocio' },
  { id: 'agencia', label: 'Agencia', icon: ShieldCheck, path: '/admin-agencia' },
  { id: 'clasificados', label: 'Casas', icon: Palmtree, path: '/clasificados' },
];

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row font-sans selection:bg-primary/30">
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0 p-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 hover:rotate-0 transition-transform">
            <Palmtree className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-dark tracking-tighter leading-none uppercase">AcaEnVivo</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mt-1">Experience</p>
          </div>
        </motion.div>

        <nav className="flex-1 space-y-3">
          {NAV_ITEMS.map((item, index) => (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all font-black text-sm uppercase tracking-widest group",
                location.pathname === item.path 
                  ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" 
                  : "text-muted hover:bg-gray-50 hover:text-dark"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", location.pathname === item.path ? "text-white" : "text-primary")} />
              {item.label}
            </motion.button>
          ))}
        </nav>

        <div className="pt-8 border-t border-gray-100 space-y-3">
          <button className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-muted hover:bg-gray-50 hover:text-dark transition-all font-black text-sm uppercase tracking-widest group">
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            Settings
          </button>
          <button className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-rose-500 hover:bg-rose-50 transition-all font-black text-sm uppercase tracking-widest">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile/Tablet Top Nav */}
      <header className="lg:hidden bg-primary text-white px-6 pt-10 pb-12 rounded-b-[3rem] shadow-2xl sticky top-0 z-50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl rotate-3">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack" 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Welcome back</p>
              <h2 className="text-xl font-black tracking-tight">Jack Fitzgerald</h2>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 relative shadow-lg">
              <Bell className="w-6 h-6" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-primary" />
            </button>
          </div>
        </div>

        {/* Search Bar in Mobile Header */}
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Where to next?"
              className="w-full bg-white text-dark rounded-[1.5rem] py-4 pl-14 pr-4 text-sm font-black placeholder:text-muted focus:outline-none shadow-2xl"
            />
          </div>
          <button className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-white/30 shadow-2xl">
            <Grid className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Desktop Top Header (Hidden on mobile) */}
        <header className="hidden lg:flex items-center justify-between px-12 py-8 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
          <div className="flex-1 max-w-2xl relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search destinations, hotels, experiences..."
              className="w-full bg-bg rounded-[1.5rem] py-4 pl-14 pr-4 text-sm font-black placeholder:text-muted focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/20"
            />
          </div>
          <div className="flex items-center gap-8 ml-12">
            <button className="relative text-muted hover:text-primary transition-all hover:scale-110">
              <Bell className="w-7 h-7" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-4 pl-8 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-black text-dark tracking-tight leading-none">Jack Fitzgerald</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Premium Member</p>
              </div>
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-gray-50 shadow-lg hover:rotate-3 transition-transform cursor-pointer">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack" 
                  alt="User" 
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

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-8 left-8 right-8 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-4 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 z-50">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={cn(
              "p-4 rounded-[1.5rem] transition-all relative group",
              location.pathname === item.path 
                ? "bg-primary text-white shadow-xl shadow-primary/30 scale-110 -translate-y-2" 
                : "text-muted hover:text-primary"
            )}
          >
            <item.icon className="w-6 h-6" />
            {location.pathname === item.path && (
              <motion.div 
                layoutId="activeTab"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
