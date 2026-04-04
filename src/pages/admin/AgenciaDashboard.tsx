import React from 'react';
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
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';

const StatCard = ({ title, value, icon: Icon, colorClass, subText }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-[#142850]">{value}</h3>
      {subText && <p className="text-[10px] text-gray-500 font-medium">{subText}</p>}
    </div>
    <div className={cn("p-3 rounded-xl", colorClass)}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

const AlertItem = ({ name, status, available }: any) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
    <div className="flex items-center gap-3">
      <div className={cn("w-2.5 h-2.5 rounded-full", available > 0 ? "bg-emerald-500" : "bg-orange-500 animate-pulse")} />
      <div>
        <p className="text-sm font-bold text-[#142850]">{name}</p>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{status}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={cn("text-xs font-black", available === 0 ? "text-orange-600" : "text-emerald-600")}>
        {available} Hab.
      </p>
    </div>
  </div>
);

export default function AgenciaDashboard() {
  const subscriptions = [
    { id: 1, name: "Restaurante La Cabaña", type: "Restaurante", plan: "Pico", status: "Pagado", icon: Utensils },
    { id: 2, name: "Yates Bonanza", type: "Servicio", plan: "Base", status: "Pendiente", icon: Ship },
    { id: 3, name: "Hotel Princess", type: "Hotel", plan: "Pico", status: "Pagado", icon: Building2 },
    { id: 4, name: "Pierre Marques", type: "Hotel", plan: "Pico", status: "Pendiente", icon: Building2 },
    { id: 5, name: "Tacos Los Tarascos", type: "Restaurante", plan: "Base", status: "Pagado", icon: Utensils },
  ];

  const agents = [
    { name: "Agente Juan", hotels: 15, businesses: 45, status: "En campo" },
    { name: "Agente Maria", hotels: 20, businesses: 32, status: "Oficina" },
    { name: "Agente Carlos", hotels: 8, businesses: 12, status: "En campo" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#142850] font-sans pb-20">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#142850] rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-[#00A8CC]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase">Admin <span className="text-[#00A8CC]">Agencia</span></h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Socio Comercial Acapulco</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar aliado..." 
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00A8CC]/20 w-64"
            />
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F2E1C1] border-2 border-white shadow-sm flex items-center justify-center font-black text-[#142850] text-xs">
            AG
          </div>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Comisiones Acumuladas" 
            value="$18,400 MXN" 
            subText="Marzo 2026"
            icon={DollarSign} 
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <StatCard 
            title="Suscripciones por Cobrar" 
            value="12 Negocios" 
            subText="Vencimiento: 5 días"
            icon={Clock} 
            colorClass="bg-orange-50 text-orange-600"
          />
          <StatCard 
            title="Total Aliados Activos" 
            value="465" 
            subText="115 Hoteles / 350 Negocios"
            icon={Users} 
            colorClass="bg-[#00A8CC]/10 text-[#00A8CC]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Subscriptions & Agents */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subscriptions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Control de Suscripciones
                </h3>
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Filter className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Establecimiento</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subscriptions.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <s.icon className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#142850]">{s.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase">{s.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-gray-600">Temporada {s.plan}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest",
                            s.status === 'Pagado' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                          )}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {s.status === 'Pendiente' && (
                            <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Validar Pago">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-2 text-[#00A8CC] hover:bg-[#00A8CC]/5 rounded-lg transition-colors" title="Enviar WhatsApp">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Agents Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                <UserCheck className="w-5 h-5 text-[#00A8CC]" />
                Agentes en Campo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {agents.map((a, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-black text-[#142850]">{a.name}</p>
                      <span className={cn(
                        "text-[8px] font-black px-1.5 py-0.5 rounded uppercase",
                        a.status === 'En campo' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {a.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-white rounded-xl border border-gray-100">
                        <p className="text-lg font-black text-[#00A8CC]">{a.hotels}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase">Hoteles</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-xl border border-gray-100">
                        <p className="text-lg font-black text-[#142850]">{a.businesses}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase">Negocios</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Alerts & Critical Inventory */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Inventario Crítico
                </h3>
                <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded uppercase">3 Alertas</span>
              </div>
              
              <p className="text-xs text-gray-400 leading-relaxed">
                Hoteles reportando 0 disponibilidad. Validar si es real o error de actualización.
              </p>

              <div className="space-y-3">
                <AlertItem name="Hotel Emporio" status="Zona Dorada" available={0} />
                <AlertItem name="Hotel Calinda" status="Zona Dorada" available={0} />
                <AlertItem name="Playa Suite" status="Zona Dorada" available={0} />
                <div className="pt-2">
                  <AlertItem name="Hotel Princess" status="Zona Diamante" available={5} />
                </div>
              </div>

              <button className="w-full py-4 bg-[#142850] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                Llamar a todos los críticos
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#142850] to-[#0b132b] rounded-2xl p-6 text-white space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#00A8CC]">Acciones Rápidas</h4>
              <div className="grid grid-cols-1 gap-2">
                <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between">
                  Nuevo Aliado Comercial
                  <Plus className="w-3 h-3" />
                </button>
                <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between">
                  Generar Corte de Caja
                  <DollarSign className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  );
}
