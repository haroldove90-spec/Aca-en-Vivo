import React, { useState, useMemo } from 'react';
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
  { id: '1', name: 'Hotel Emporio', cat: 'hotel', plan: 'Premium', lastUpdate: 'Hace 5 min', status: 'Pagado', phone: '7441234567' },
  { id: '2', name: 'Yates Bonanza', cat: 'yate', plan: 'Premium', lastUpdate: 'Hace 12 min', status: 'Pagado', phone: '7449876543' },
  { id: '3', name: 'La Cabaña', cat: 'restaurante', plan: 'Básico', lastUpdate: 'Hace 1 h', status: 'Pendiente', phone: '7445556677' },
  { id: '4', name: 'Hotel Calinda', cat: 'hotel', plan: 'Básico', lastUpdate: 'Hace 2 h', status: 'Pagado', phone: '7441112233' },
  { id: '5', name: 'Motos Express', cat: 'renta', plan: 'Básico', lastUpdate: 'Hace 4 h', status: 'Vencido', phone: '7444445555' },
];

const ACTIVITY_LOG = [
  { id: 1, text: "Hotel Emporio cambió a 'Lleno'", time: "14:20", type: "status" },
  { id: 2, text: "Yates Bonanza activó Oferta Flash", time: "14:15", type: "promo" },
  { id: 3, text: "Nuevo negocio 'Artesanías Mary' registrado", time: "13:50", type: "new" },
  { id: 4, text: "Sr. Frogs actualizó a 'Casi Lleno'", time: "13:30", type: "status" },
];

// --- Components ---

const SummaryCard = ({ title, value, trend, icon: Icon, isCurrency = false }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#142850]" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-2xl font-black text-[#142850] mt-1">
        {isCurrency ? `$${value.toLocaleString()}` : value}
        {isCurrency && <span className="text-xs font-bold text-gray-400 ml-1">MXN</span>}
      </h3>
    </div>
  </div>
);

const ZoneHeatmap = () => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
        <MapIcon className="w-5 h-5 text-[#00A8CC]" />
        Mapa de Calor de Ocupación
      </h3>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase">Baja</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase">Alta</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {ZONES.map((zone) => (
        <div key={zone.id} className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zona</p>
              <h4 className="text-sm font-black text-[#142850]">{zone.name}</h4>
            </div>
            <span className={cn("text-lg font-black", zone.color)}>{zone.occupancy}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${zone.occupancy}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("h-full rounded-full", zone.occupancy > 80 ? "bg-rose-500" : zone.occupancy > 50 ? "bg-blue-500" : "bg-emerald-500")}
            />
          </div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
            {zone.occupancy > 80 ? '⚠️ Saturación Detectada' : zone.occupancy > 50 ? '⚡ Flujo Constante' : '✅ Espacio Disponible'}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default function AgenciaDashboard() {
  const [filter, setFilter] = useState('all');

  const filteredAffiliates = useMemo(() => {
    if (filter === 'all') return AFFILIATES;
    return AFFILIATES.filter(a => a.cat === filter);
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#142850] font-sans pb-20">
      {/* Sidebar / Header */}
      <nav className="bg-[#142850] text-white px-8 py-6 flex justify-between items-center sticky top-0 z-50 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00A8CC] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00A8CC]/20">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">AcaEnVivo <span className="text-[#00A8CC]">BI</span></h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-1">Centro de Mando Administrativo</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-8 mr-8">
            <button className="text-[10px] font-black uppercase tracking-widest text-[#00A8CC]">Dashboard</button>
            <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Afiliados</button>
            <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Finanzas</button>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sistema Online</span>
          </div>
        </div>
      </nav>

      <main className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard title="Comisiones Mes" value={42800} isCurrency trend="+15%" icon={DollarSign} />
          <SummaryCard title="Pagos Pendientes" value={12} trend="-2" icon={Clock} />
          <SummaryCard title="Nuevos Afiliados" value={8} trend="+4" icon={UserCheck} />
          <SummaryCard title="Proyección Semana Santa" value={185000} isCurrency trend="+22%" icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analytics Column */}
          <div className="lg:col-span-2 space-y-8">
            <ZoneHeatmap />

            {/* Affiliate Master Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#00A8CC]" />
                    Gestor de Afiliados
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Control maestro de socios comerciales</p>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  {['all', 'hotel', 'restaurante', 'yate', 'renta'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                        filter === cat 
                          ? "bg-[#142850] text-white border-[#142850]" 
                          : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
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
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Establecimiento</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Última Act.</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado Pago</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
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
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                                {a.cat === 'hotel' ? <Building2 className="w-5 h-5 text-blue-500" /> : 
                                 a.cat === 'yate' ? <Ship className="w-5 h-5 text-cyan-500" /> : 
                                 <Utensils className="w-5 h-5 text-orange-500" />}
                              </div>
                              <div>
                                <p className="text-sm font-black text-[#142850] uppercase tracking-tight">{a.name}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase">{a.cat}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                              a.plan === 'Premium' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                            )}>
                              {a.plan}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-[10px] font-bold text-gray-500">{a.lastUpdate}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                a.status === 'Pagado' ? "bg-emerald-500" : a.status === 'Pendiente' ? "bg-amber-500" : "bg-rose-500"
                              )} />
                              <span className="text-[10px] font-black text-[#142850] uppercase tracking-widest">{a.status}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors" title="WhatsApp">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" title="Suspender">
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                                <MoreVertical className="w-4 h-4" />
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
          </div>

          {/* Sidebar Analytics Column */}
          <div className="space-y-8">
            {/* Search Analytics */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00A8CC]" />
                  Tendencias Hoy
                </h3>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="space-y-5">
                {TOP_CATEGORIES.map((cat, i) => (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-300">0{i+1}</span>
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50", cat.color)}>
                          <cat.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-[#142850] uppercase tracking-tight">{cat.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-[#142850]">{cat.clics}</p>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase">{cat.trend}</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.clics / 500) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={cn("h-full rounded-full", cat.color.replace('text', 'bg'))}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 bg-gray-50 text-[#142850] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
                Ver Reporte Completo
              </button>
            </div>

            {/* Live Activity Log */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-500" />
                Actividad en Vivo
              </h3>
              
              <div className="space-y-6 relative">
                <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-100" />
                {ACTIVITY_LOG.map((log) => (
                  <div key={log.id} className="flex gap-4 relative">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-sm",
                      log.type === 'status' ? "bg-blue-500" : log.type === 'promo' ? "bg-amber-500" : "bg-emerald-500"
                    )}>
                      {log.type === 'status' ? <Clock className="w-3 h-3 text-white" /> : 
                       log.type === 'promo' ? <Zap className="w-3 h-3 text-white" /> : 
                       <PlusIcon className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#142850] leading-tight">{log.text}</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase mt-1 tracking-widest">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-[#142850] rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl shadow-[#142850]/20">
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#00A8CC]">Acciones de Agencia</h4>
                <p className="text-[10px] text-white/40 font-bold uppercase">Gestión rápida de inventario</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-left transition-all border border-white/5 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest">Validar Cobranza Masiva</span>
                    <DollarSign className="w-4 h-4 text-[#00A8CC] group-hover:scale-110 transition-transform" />
                  </div>
                </button>
                <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-left transition-all border border-white/5 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest">Exportar Leads Hoy</span>
                    <ArrowUpRight className="w-4 h-4 text-[#00A8CC] group-hover:scale-110 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  );
}
