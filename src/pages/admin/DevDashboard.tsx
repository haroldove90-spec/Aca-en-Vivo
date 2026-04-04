import React from 'react';
import { 
  TrendingUp, 
  Hotel, 
  Briefcase, 
  Users, 
  Activity, 
  Database, 
  Cpu, 
  Globe, 
  Download,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

const KPICard = ({ title, value, subValue, icon: Icon, trend }: any) => (
  <div className="bg-[#1c2541] border border-white/5 p-6 rounded-2xl shadow-2xl space-y-4">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-[#00A8CC]/10 rounded-xl">
        <Icon className="w-6 h-6 text-[#00A8CC]" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-lg text-[10px] font-bold">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-white mt-1">{value}</h3>
      {subValue && <p className="text-[10px] text-gray-500 mt-1 font-medium">{subValue}</p>}
    </div>
  </div>
);

const StatusIndicator = ({ label, status, detail }: any) => (
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
    <div className="flex items-center gap-3">
      <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", 
        status === 'online' ? "bg-green-500 shadow-green-500/50 animate-pulse" : "bg-red-500"
      )} />
      <span className="text-xs font-bold text-gray-300">{label}</span>
    </div>
    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">{detail}</span>
  </div>
);

export default function DevDashboard() {
  const recentMovements = [
    { id: 1, hotel: "Hotel El Cano", action: "Actualizó a 0 habitaciones (Lleno)", time: "Hace 2 min", type: "alert" },
    { id: 2, hotel: "Restaurante La Cabaña", action: "Pago de suscripción exitoso", time: "Hace 15 min", type: "payment" },
    { id: 3, hotel: "Hotel Emporio", action: "Actualizó a 12 habitaciones", time: "Hace 45 min", type: "update" },
    { id: 4, hotel: "Hotel Calinda", action: "Nuevo registro de establecimiento", time: "Hace 2 horas", type: "new" },
    { id: 5, hotel: "Turista (CDMX)", action: "Nuevo usuario registrado", time: "Hace 3 horas", type: "user" },
    { id: 6, hotel: "Hotel Princess", action: "Actualizó a 5 habitaciones (Últimas)", time: "Hace 4 horas", type: "alert" },
  ];

  return (
    <div className="min-h-screen bg-[#0b132b] text-white p-6 md:p-10 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Admin <span className="text-[#00A8CC]">Dev</span></h1>
            <span className="bg-[#00A8CC] text-[#0b132b] text-[10px] font-black px-2 py-0.5 rounded uppercase">Master</span>
          </div>
          <p className="text-gray-400 text-sm font-medium">Panel de Supervisión Técnica y Financiera • Acapulco-CDMX</p>
        </div>
        
        <button className="flex items-center gap-2 bg-[#00A8CC] hover:bg-[#00A8CC]/80 text-[#0b132b] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-[#00A8CC]/20">
          <Download className="w-4 h-4" />
          Exportar Reporte Mensual
        </button>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
        <div className="lg:col-span-2 bg-[#1c2541] border border-white/5 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00A8CC]" />
              Comparativa de Temporada
            </h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-sm" />
                <span className="text-gray-400">Base</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#00A8CC] rounded-sm" />
                <span className="text-[#00A8CC]">Pico</span>
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
                    className="w-3 bg-gray-600 rounded-t-sm transition-all duration-1000" 
                    style={{ height: `${d.base}%` }} 
                  />
                  <div 
                    className="w-3 bg-[#00A8CC] rounded-t-sm shadow-[0_0_15px_rgba(0,168,204,0.3)] transition-all duration-1000" 
                    style={{ height: `${d.pico}%` }} 
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Monitor */}
        <div className="bg-[#1c2541] border border-white/5 rounded-2xl p-8 shadow-2xl space-y-8">
          <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#00A8CC]" />
            Monitor de Salud
          </h3>
          
          <div className="space-y-4">
            <StatusIndicator label="Base de Datos" status="online" detail="Supabase / Online" />
            <StatusIndicator label="AI Studio API" status="online" detail="Gemini 3 / Operativa" />
            <StatusIndicator label="Vercel Edge" status="online" detail="Latencia 20ms" />
            <StatusIndicator label="Storage" status="online" detail="92% Disponible" />
          </div>

          <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Uptime Global</span>
              <span className="text-xs font-black text-green-400">99.98%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="w-[99.98%] h-full bg-green-500" />
            </div>
          </div>
        </div>

        {/* Recent Movements Table */}
        <div className="lg:col-span-3 bg-[#1c2541] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00A8CC]" />
              Últimos Movimientos
            </h3>
            <button className="text-[10px] font-black text-[#00A8CC] uppercase tracking-widest hover:underline">Ver todo el log</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Establecimiento / Usuario</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Tiempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white">{m.hotel}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-400">{m.action}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest",
                        m.type === 'alert' ? "bg-red-500/10 text-red-500" :
                        m.type === 'payment' ? "bg-green-500/10 text-green-500" :
                        m.type === 'new' ? "bg-[#00A8CC]/10 text-[#00A8CC]" :
                        "bg-gray-500/10 text-gray-400"
                      )}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] font-medium text-gray-500">{m.time}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500">
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
