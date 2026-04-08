import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  DollarSign, 
  Clock, 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  UserCheck,
  Building2,
  Ship,
  Utensils,
  TrendingUp,
  Map as MapIcon,
  Zap,
  MoreVertical,
  XCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

const ZONES = [
  { id: 'diamante', name: 'Zona Diamante', occupancy: 65, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'dorada', name: 'Zona Dorada', occupancy: 85, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'tradicional', name: 'Zona Tradicional', occupancy: 40, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

const TOP_CATEGORIES = [
  { id: 'rest', label: 'Restaurantes', clics: 450, icon: Utensils, trend: '+12%', color: 'text-orange-500' },
  { id: 'yates', label: 'Yates', clics: 320, icon: Ship, trend: '+8%', color: 'text-cyan-500' },
  { id: 'hotels', label: 'Hoteles', clics: 210, icon: Building2, trend: '-3%', color: 'text-blue-500' },
  { id: 'motos', label: 'Motos', clics: 180, icon: Zap, trend: '+25%', color: 'text-yellow-500' },
];

const SummaryCard = ({ title, value, trend, icon: Icon, isCurrency = false }: any) => (
  <div className="bg-white p-8 rounded-none shadow-xl shadow-black/5 border border-gray-100 space-y-6 group hover:scale-105 transition-all">
    <div className="flex items-center justify-between">
      <div className="w-12 h-12 bg-gray-50 rounded-none flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend.startsWith('+') ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-3xl font-black text-dark mt-2 tracking-tighter">
        {isCurrency ? `$${value.toLocaleString()}` : value}
        {isCurrency && <span className="text-xs font-bold text-muted ml-2">MXN</span>}
      </h3>
    </div>
  </div>
);

const ZoneHeatmap = () => (
  <div className="bg-white p-10 rounded-none shadow-xl shadow-black/5 border border-gray-100 space-y-10">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-black text-dark uppercase tracking-[0.2em] flex items-center gap-3">
        <MapIcon className="w-6 h-6 text-primary" />
        Mapa de Calor de Ocupación
      </h3>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-none bg-emerald-500" />
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Baja</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-none bg-rose-500" />
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Alta</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {ZONES.map((zone) => (
        <div key={zone.id} className="space-y-5">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-muted uppercase tracking-widest">Zona</p>
              <h4 className="text-sm font-black text-dark uppercase tracking-tight">{zone.name}</h4>
            </div>
            <span className={cn("text-xl font-black", zone.color)}>{zone.occupancy}%</span>
          </div>
          <div className="h-3 bg-gray-50 rounded-none overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${zone.occupancy}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("h-full rounded-none", zone.occupancy > 80 ? "bg-rose-500" : zone.occupancy > 50 ? "bg-primary" : "bg-emerald-500")}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

type Tab = 'dashboard' | 'afiliados' | 'usuarios' | 'zonas' | 'pagos';

export default function AgenciaDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = (queryParams.get('tab') as Tab) || 'dashboard';

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
      return;
    }

    const [ests, inv, profs] = await Promise.all([
      supabase.from('establishments').select('*'),
      supabase.from('inventario_hotel').select('*'),
      supabase.from('profiles').select('*')
    ]);

    setEstablishments(ests.data || []);
    setInventory(inv.data || []);
    setProfiles(profs.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Subscriptions
    const estSub = supabase.channel('est_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'establishments' }, () => fetchData())
      .subscribe();

    const invSub = supabase.channel('inv_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventario_hotel' }, () => fetchData())
      .subscribe();

    const profSub = supabase.channel('prof_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .subscribe();

    return () => {
      estSub.unsubscribe();
      invSub.unsubscribe();
      profSub.unsubscribe();
    };
  }, [navigate]);

  const handleDeleteEstablishment = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este establecimiento?')) return;
    const { error } = await supabase.from('establishments').delete().eq('id', id);
    if (error) alert(error.message);
  };

  const handleDeleteProfile = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) alert(error.message);
  };

  const filteredAffiliates = useMemo(() => {
    let list = establishments;
    if (filter !== 'all') {
      list = list.filter(e => e.tipo === filter);
    }
    return list.map(e => {
      const inv = inventory.find(i => i.establishment_id === e.id);
      return { ...e, inventory: inv };
    });
  }, [filter, establishments, inventory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="w-12 h-12 text-[#00A8CC] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-dark tracking-tighter uppercase leading-none">Agencia <span className="text-primary">BI</span></h1>
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mt-2">Centro de Mando Administrativo</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-none border border-gray-100 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-none bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-dark uppercase tracking-widest">Sistema Online</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard title="Comisiones Mes" value={42800} isCurrency trend="+15%" icon={DollarSign} />
              <SummaryCard title="Pagos Pendientes" value={12} trend="-2" icon={Clock} />
              <SummaryCard title="Nuevos Afiliados" value={establishments.length} trend="+4" icon={UserCheck} />
              <SummaryCard title="Proyección Semana Santa" value={185000} isCurrency trend="+22%" icon={TrendingUp} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <ZoneHeatmap />
              </div>
              <div className="space-y-10">
                <div className="bg-white p-10 rounded-none shadow-xl shadow-black/5 border border-gray-100 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-dark uppercase tracking-[0.2em] flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      Tendencias Hoy
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {TOP_CATEGORIES.map((cat, i) => (
                      <div key={cat.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-gray-200">0{i+1}</span>
                            <div className={cn("w-10 h-10 rounded-none flex items-center justify-center bg-gray-50 shadow-sm", cat.color)}>
                              <cat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black text-dark uppercase tracking-tight">{cat.label}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-dark">{cat.clics}</p>
                            <p className="text-[10px] font-black text-emerald-500 uppercase">{cat.trend}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'afiliados' && (
          <motion.div
            key="afiliados"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white rounded-none shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
              <div className="p-8 lg:p-10 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h3 className="text-sm font-black text-dark uppercase tracking-[0.2em] flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    Gestor de Afiliados
                  </h3>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  {['all', 'hotel', 'negocio'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={cn(
                        "px-5 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all border",
                        filter === cat 
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                          : "bg-gray-50 text-muted border-gray-100 hover:bg-gray-100"
                      )}
                    >
                      {cat === 'all' ? 'Todos' : cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Establecimiento</th>
                      <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Tipo</th>
                      <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Zona</th>
                      <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAffiliates.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4 cursor-pointer" onClick={() => a.tipo === 'hotel' && setSelectedHotel(a)}>
                            <div className="w-12 h-12 rounded-none bg-gray-100 flex items-center justify-center">
                              {a.tipo === 'hotel' ? <Building2 className="w-6 h-6 text-blue-500" /> : <Ship className="w-6 h-6 text-cyan-500" />}
                            </div>
                            <div>
                              <p className="text-sm font-black text-dark uppercase tracking-tight">{a.nombre}</p>
                              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{a.owner_id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-[9px] font-black px-3 py-1.5 rounded-none uppercase tracking-widest bg-slate-100 text-slate-700">
                            {a.tipo}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-[10px] font-bold text-muted uppercase">{a.zona}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-none transition-all">
                              <MessageSquare className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEstablishment(a.id)}
                              className="w-10 h-10 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded-none transition-all"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'usuarios' && (
          <motion.div
            key="usuarios"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white rounded-none shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
              <div className="p-8 lg:p-10 border-b border-gray-100">
                <h3 className="text-sm font-black text-dark uppercase tracking-[0.2em] flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  Directorio de Usuarios
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Usuario</th>
                      <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Rol</th>
                      <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Contacto</th>
                      <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {profiles.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-none overflow-hidden border border-gray-100">
                              <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-dark uppercase tracking-tight">{p.full_name}</p>
                              <p className="text-[10px] text-muted font-bold">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={cn(
                            "text-[9px] font-black px-3 py-1.5 rounded-none uppercase tracking-widest",
                            p.role === 'admin' ? "bg-rose-100 text-rose-700" :
                            p.role === 'hotel' ? "bg-blue-100 text-blue-700" :
                            p.role === 'negocio' ? "bg-cyan-100 text-cyan-700" :
                            "bg-slate-100 text-slate-700"
                          )}>
                            {p.role}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-dark uppercase">{p.phone || 'Sin tel'}</p>
                            <p className="text-[10px] text-muted truncate max-w-[200px]">{p.address || 'Sin dir'}</p>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button 
                            onClick={() => handleDeleteProfile(p.id)}
                            className="w-10 h-10 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded-none transition-all"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedHotel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedHotel(null)}
            className="fixed inset-0 z-[200] bg-dark/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-none shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="bg-primary p-8 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{selectedHotel.nombre}</h3>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-2">Monitor de Inventario</p>
                </div>
                <button 
                  onClick={() => setSelectedHotel(null)}
                  className="w-10 h-10 bg-white/10 rounded-none flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-none">
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest">Total Habitaciones</p>
                    <p className="text-xl font-black text-dark">{selectedHotel.inventory?.habitaciones_totales || 0}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-none">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Disponibles</p>
                    <p className="text-xl font-black text-emerald-600">{selectedHotel.inventory?.disponibles_ahora || 0}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setSelectedHotel(null)}
                  className="px-8 py-3 bg-dark text-white rounded-none font-black text-[10px] uppercase tracking-widest shadow-xl"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
