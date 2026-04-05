import React from 'react';
import { 
  TrendingUp, 
  Hotel, 
  Briefcase, 
  Users, 
  Activity as ActivityIcon, 
  Database, 
  Cpu, 
  Globe, 
  Download,
  ArrowUpRight,
  Clock,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const KPICard = ({ title, value, subValue, icon: Icon, trend }: any) => (
  <div className="bg-white border border-gray-100 p-6 rounded-none shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-primary/10 rounded-none">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-none text-[10px] font-black uppercase">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-muted text-[10px] font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-dark mt-1 tracking-tighter">{value}</h3>
      {subValue && <p className="text-[10px] text-muted mt-1 font-bold uppercase">{subValue}</p>}
    </div>
  </div>
);

const StatusIndicator = ({ label, status, detail }: any) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-none border border-gray-100">
    <div className="flex items-center gap-3">
      <div className={cn("w-2 h-2 rounded-none", 
        status === 'online' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-rose-500"
      )} />
      <span className="text-[10px] font-black text-dark uppercase tracking-tight">{label}</span>
    </div>
    <span className="text-[9px] font-black text-muted uppercase tracking-tighter">{detail}</span>
  </div>
);

type Tab = 'master' | 'logs' | 'config';

export default function DevDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = (queryParams.get('tab') as Tab) || 'master';

  const recentMovements = [
    { id: 1, hotel: "Hotel El Cano", action: "Actualizó a 0 habitaciones (Lleno)", time: "Hace 2 min", type: "alert" },
    { id: 2, hotel: "Restaurante La Cabaña", action: "Pago de suscripción exitoso", time: "Hace 15 min", type: "payment" },
    { id: 3, hotel: "Hotel Emporio", action: "Actualizó a 12 habitaciones", time: "Hace 45 min", type: "update" },
    { id: 4, hotel: "Hotel Calinda", action: "Nuevo registro de establecimiento", time: "Hace 2 horas", type: "new" },
    { id: 5, hotel: "Turista (CDMX)", action: "Nuevo usuario registrado", time: "Hace 3 horas", type: "user" },
    { id: 6, hotel: "Hotel Princess", action: "Actualizó a 5 habitaciones (Últimas)", time: "Hace 4 horas", type: "alert" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-dark tracking-tighter uppercase leading-none">Admin <span className="text-primary">Dev</span></h1>
            <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-none uppercase">Master</span>
          </div>
          <p className="text-muted text-sm font-medium">Panel de Supervisión Técnica y Financiera • Acapulco-CDMX</p>
        </div>
        
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-none font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20">
          <Download className="w-4 h-4" />
          Exportar Reporte Mensual
        </button>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'master' && (
          <motion.div
            key="master"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard 
                title="Ingresos Totales Mes" 
                value="$57,250 MXN" 
                trend="+12%" 
                icon={TrendingUp} 
                subValue="Meta: $60k (95%)"
              />
              <KPICard 
                title="Hoteles Activos" 
                value="115" 
                icon={Hotel} 
                subValue="85% con inventario hoy"
              />
              <KPICard 
                title="Negocios Patrocinadores" 
                value="350" 
                trend="+5" 
                icon={Briefcase} 
                subValue="Suscripciones Premium"
              />
              <KPICard 
                title="Usuarios Registrados" 
                value="1,240" 
                trend="+150" 
                icon={Users} 
                subValue="Activos esta semana"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Revenue Chart Simulation */}
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-none p-8 shadow-xl">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-dark">
                    <ActivityIcon className="w-5 h-5 text-primary" />
                    Comparativa de Temporada
                  </h3>
                  <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-200 rounded-none" />
                      <span className="text-muted">Base</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-none" />
                      <span className="text-primary">Pico</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-around h-64 gap-4">
                  {[
                    { label: 'Ene', base: 40, pico: 85 },
                    { label: 'Feb', base: 35, pico: 70 },
                    { label: 'Mar', base: 50, pico: 95 },
                    { label: 'Abr', base: 45, pico: 80 },
                    { label: 'May', base: 30, pico: 60 },
                    { label: 'Jun', base: 40, pico: 75 },
                  ].map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        <div 
                          className="w-3 bg-gray-200 rounded-none transition-all duration-1000" 
                          style={{ height: `${d.base}%` }} 
                        />
                        <div 
                          className="w-3 bg-primary rounded-none shadow-[0_0_15px_rgba(0,168,204,0.3)] transition-all duration-1000" 
                          style={{ height: `${d.pico}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-black text-muted uppercase">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Monitor */}
              <div className="bg-white border border-gray-100 rounded-none p-8 shadow-xl space-y-8">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-dark">
                  <Cpu className="w-5 h-5 text-primary" />
                  Monitor de Salud
                </h3>
                
                <div className="space-y-4">
                  <StatusIndicator label="Base de Datos" status="online" detail="Supabase / Online" />
                  <StatusIndicator label="AI Studio API" status="online" detail="Gemini 3 / Operativa" />
                  <StatusIndicator label="Vercel Edge" status="online" detail="Latencia 20ms" />
                  <StatusIndicator label="Storage" status="online" detail="92% Disponible" />
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">Uptime Global</span>
                    <span className="text-xs font-black text-emerald-600">99.98%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-none overflow-hidden">
                    <div className="w-[99.98%] h-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Recent Movements Table */}
            <div className="bg-white border border-gray-100 rounded-none overflow-hidden shadow-xl">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-dark">
                  <Clock className="w-5 h-5 text-primary" />
                  Últimos Movimientos
                </h3>
                <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Ver todo el log</button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Establecimiento / Usuario</th>
                      <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Acción</th>
                      <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Estado</th>
                      <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest text-right">Tiempo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5">
                          <span className="text-sm font-black text-dark uppercase tracking-tight">{m.hotel}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs text-muted font-bold uppercase">{m.action}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "text-[9px] font-black px-3 py-1 rounded-none uppercase tracking-widest",
                            m.type === 'alert' ? "bg-rose-100 text-rose-600" :
                            m.type === 'payment' ? "bg-emerald-100 text-emerald-600" :
                            m.type === 'new' ? "bg-primary/10 text-primary" :
                            "bg-gray-100 text-muted"
                          )}>
                            {m.type}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="text-[10px] font-black text-muted uppercase">{m.time}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-10 rounded-none shadow-xl border border-gray-100 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-primary/5 text-primary rounded-none flex items-center justify-center mx-auto">
              <SettingsIcon className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-dark uppercase tracking-tight">Configuración Maestra</h3>
              <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Ajustes globales del motor de Acapulco</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-muted">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Región: US-West (Vercel Edge)</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">DB: Supabase PostgreSQL</span>
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest">AcaEnVivo v1.0.4-stable • Harold Dev</p>
      </footer>
    </div>
  );
}
