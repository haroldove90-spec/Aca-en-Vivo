import React, { useState, useMemo, useEffect } from 'react';
import { 
  collection,
  onSnapshot,
  query
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  DollarSign, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  UserCheck,
  Building2,
  Ship,
  Utensils,
  Search,
  Filter,
  TrendingUp,
  Map as MapIcon,
  Zap,
  Activity,
  MoreVertical,
  XCircle,
  Smartphone,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

// --- Types & Mock Data ---
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

const AFFILIATES = [
  { 
    id: '1', 
    name: 'Hotel Emporio', 
    cat: 'hotel', 
    plan: 'Premium', 
    lastUpdate: 'Hace 5 min', 
    status: 'Pagado', 
    phone: '7441234567',
    rooms: [
      { id: 101, type: 'Estándar', status: 'Ocupada' },
      { id: 102, type: 'Estándar', status: 'Disponible' },
      { id: 103, type: 'Suite', status: 'Ocupada' },
      { id: 104, type: 'Suite', status: 'Disponible' },
      { id: 105, type: 'Penthouse', status: 'Ocupada' },
    ]
  },
  { 
    id: '2', 
    name: 'Yates Bonanza', 
    cat: 'yate', 
    plan: 'Premium', 
    lastUpdate: 'Hace 12 min', 
    status: 'Pagado', 
    phone: '7449876543' 
  },
  { 
    id: '3', 
    name: 'La Cabaña', 
    cat: 'restaurante', 
    plan: 'Básico', 
    lastUpdate: 'Hace 1 h', 
    status: 'Pendiente', 
    phone: '7445556677' 
  },
  { 
    id: '4', 
    name: 'Hotel Calinda', 
    cat: 'hotel', 
    plan: 'Básico', 
    lastUpdate: 'Hace 2 h', 
    status: 'Pagado', 
    phone: '7441112233',
    rooms: [
      { id: 201, type: 'Estándar', status: 'Disponible' },
      { id: 202, type: 'Estándar', status: 'Disponible' },
      { id: 203, type: 'Doble', status: 'Ocupada' },
    ]
  },
  { 
    id: '5', 
    name: 'Motos Express', 
    cat: 'renta', 
    plan: 'Básico', 
    lastUpdate: 'Hace 4 h', 
    status: 'Vencido', 
    phone: '7444445555' 
  },
];

const ACTIVITY_LOG = [
  { id: 1, text: "Hotel Emporio cambió a 'Lleno'", time: "14:20", type: "status" },
  { id: 2, text: "Yates Bonanza activó Oferta Flash", time: "14:15", type: "promo" },
  { id: 3, text: "Nuevo negocio 'Artesanías Mary' registrado", time: "13:50", type: "new" },
  { id: 4, text: "Sr. Frogs actualizó a 'Casi Lleno'", time: "13:30", type: "status" },
];

// --- Components ---

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
          <p className="text-[10px] font-black text-muted uppercase tracking-widest">
            {zone.occupancy > 80 ? '⚠️ Saturación' : zone.occupancy > 50 ? '⚡ Flujo Constante' : '✅ Disponible'}
          </p>
        </div>
      ))}
    </div>
  </div>
);

import { useNavigate, useLocation } from 'react-router-dom';

type Tab = 'dashboard' | 'afiliados' | 'zonas' | 'pagos';

export default function AgenciaDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = (queryParams.get('tab') as Tab) || 'dashboard';

  const setActiveTab = (tab: Tab) => {
    navigate(`/admin-agencia?tab=${tab}`);
  };

  const [filter, setFilter] = useState('all');
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [realInventory, setRealInventory] = useState<Record<string, any>>({});

  useEffect(() => {
    const q = query(collection(db, 'inventario_hotel'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inventory: Record<string, any> = {};
      snapshot.forEach((doc) => {
        inventory[doc.id] = doc.data();
      });
      setRealInventory(inventory);
    });
    return () => unsubscribe();
  }, []);

  const affiliatesWithInventory = useMemo(() => {
    return AFFILIATES.map(a => {
      if (a.cat === 'hotel' && realInventory[a.id === '1' ? 'hotel-2' : 'hotel-1']) {
        const inv = realInventory[a.id === '1' ? 'hotel-2' : 'hotel-1'];
        return {
          ...a,
          lastUpdate: inv.ultima_actualizacion?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || a.lastUpdate,
          inventory: inv
        };
      }
      return a;
    });
  }, [realInventory]);

  const filteredAffiliates = useMemo(() => {
    if (filter === 'all') return affiliatesWithInventory;
    return affiliatesWithInventory.filter(a => a.cat === filter);
  }, [filter, affiliatesWithInventory]);

  return (
    <div className="space-y-10">
      {/* Header Section */}
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

      {/* Main Content Sections */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* Top Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard title="Comisiones Mes" value={42800} isCurrency trend="+15%" icon={DollarSign} />
              <SummaryCard title="Pagos Pendientes" value={12} trend="-2" icon={Clock} />
              <SummaryCard title="Nuevos Afiliados" value={8} trend="+4" icon={UserCheck} />
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
                    <Calendar className="w-5 h-5 text-muted" />
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
                        <div className="h-2 bg-gray-50 rounded-none overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(cat.clics / 500) * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className={cn("h-full rounded-none", cat.color.replace('text', 'bg'))}
                          />
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
            {/* Affiliate Master Table */}
            <div className="bg-white rounded-none shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
              <div className="p-8 lg:p-10 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h3 className="text-sm font-black text-dark uppercase tracking-[0.2em] flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    Gestor de Afiliados
                  </h3>
                  <p className="text-[10px] font-bold text-muted uppercase mt-2">Control maestro de socios comerciales</p>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  {['all', 'hotel', 'restaurante', 'yate', 'renta'].map((cat) => (
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
                      <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Plan</th>
                      <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Última Act.</th>
                      <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Estado Pago</th>
                      <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-widest text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence mode="popLayout">
                      {filteredAffiliates.map((a) => (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={a.id} 
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-10 py-6">
                            <div 
                              className="flex items-center gap-4 cursor-pointer group/item"
                              onClick={() => a.cat === 'hotel' && setSelectedHotel(a)}
                            >
                              <div className="w-12 h-12 rounded-none bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm group-hover:rotate-3">
                                {a.cat === 'hotel' ? <Building2 className="w-6 h-6 text-blue-500" /> : 
                                 a.cat === 'yate' ? <Ship className="w-6 h-6 text-cyan-500" /> : 
                                 <Utensils className="w-6 h-6 text-orange-500" />}
                              </div>
                              <div>
                                <p className="text-sm font-black text-dark uppercase tracking-tight group-hover/item:text-primary transition-colors">{a.name}</p>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{a.cat}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className={cn(
                              "text-[9px] font-black px-3 py-1.5 rounded-none uppercase tracking-widest",
                              a.plan === 'Premium' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                            )}>
                              {a.plan}
                            </span>
                          </td>
                          <td className="px-10 py-6">
                            <span className="text-[10px] font-bold text-muted uppercase">{a.lastUpdate}</span>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-none",
                                a.status === 'Pagado' ? "bg-emerald-500" : a.status === 'Pendiente' ? "bg-amber-500" : "bg-rose-500"
                              )} />
                              <span className="text-[10px] font-black text-dark uppercase tracking-widest">{a.status}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-none transition-all" title="WhatsApp">
                                <MessageSquare className="w-5 h-5" />
                              </button>
                              <button className="w-10 h-10 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded-none transition-all" title="Suspender">
                                <XCircle className="w-5 h-5" />
                              </button>
                              <button className="w-10 h-10 flex items-center justify-center text-muted hover:bg-gray-100 rounded-none transition-all">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'zonas' && (
          <motion.div
            key="zonas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ZoneHeatmap />
          </motion.div>
        )}

        {activeTab === 'pagos' && (
          <motion.div
            key="pagos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-10 rounded-none shadow-xl border border-gray-100 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-none flex items-center justify-center mx-auto">
              <DollarSign className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-dark uppercase tracking-tight">Gestión de Pagos</h3>
              <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Próximamente: Pasarela de cobro integrada</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hotel Room Monitor Modal */}
      <AnimatePresence>
        {selectedHotel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-dark/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-none shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="bg-primary p-8 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{selectedHotel.name}</h3>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-2">Monitor de Habitaciones en Tiempo Real</p>
                </div>
                <button 
                  onClick={() => setSelectedHotel(null)}
                  className="w-10 h-10 bg-white/10 rounded-none flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-none">
                      <p className="text-[9px] font-black text-muted uppercase tracking-widest">Total</p>
                      <p className="text-xl font-black text-dark">{selectedHotel.inventory?.habitaciones_totales || selectedHotel.rooms?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-none">
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Disponibles</p>
                      <p className="text-xl font-black text-emerald-600">{selectedHotel.inventory?.disponibles_ahora ?? selectedHotel.rooms?.filter((r: any) => r.status === 'Disponible').length ?? 0}</p>
                    </div>
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-none">
                      <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Ocupadas</p>
                      <p className="text-xl font-black text-rose-600">
                        {(selectedHotel.inventory?.habitaciones_totales ?? 0) - (selectedHotel.inventory?.disponibles_ahora ?? 0) || selectedHotel.rooms?.filter((r: any) => r.status === 'Ocupada').length || 0}
                      </p>
                    </div>
                  </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-dark uppercase tracking-widest border-b border-gray-100 pb-2">Inventario Detallado</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                    {selectedHotel.rooms?.map((room: any) => (
                      <div key={room.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-none">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-none",
                            room.status === 'Disponible' ? "bg-emerald-500" : "bg-rose-500"
                          )} />
                          <div>
                            <p className="text-xs font-black text-dark uppercase tracking-tight">Hab. {room.id}</p>
                            <p className="text-[9px] font-bold text-muted uppercase">{room.type}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          room.status === 'Disponible' ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {room.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setSelectedHotel(null)}
                  className="px-8 py-3 bg-dark text-white rounded-none font-black text-[10px] uppercase tracking-widest shadow-xl"
                >
                  Cerrar Monitor
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  );
}
