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
  Loader2,
  Trash2,
  Plus,
  Edit2
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

import { useAcaData } from '../../hooks/useAcaData';
import { BaseEntity, EntityStatus } from '../../constants/mockData';
import { SupportChat } from '../../components/SupportChat';

type Tab = 'dashboard' | 'afiliados' | 'usuarios' | 'zonas' | 'pagos' | 'chat';

export default function AgenciaDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, updateEntity, deleteEntity, addEntity } = useAcaData();
  
  const queryParams = new URLSearchParams(location.search);
  const activeTab = (queryParams.get('tab') as Tab) || 'dashboard';

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState<BaseEntity | null>(null);
  const [editingEntity, setEditingEntity] = useState<BaseEntity | null>(null);
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [isAddingEntity, setIsAddingEntity] = useState(false);
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [stats, setStats] = useState({
    comisiones: 0,
    pendientes: 0,
    afiliados: 0,
    usuarios: 0
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        { data: profs },
        { data: ents },
        { count: resCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('entities').select('*'),
        supabase.from('reservations').select('*', { count: 'exact', head: true })
      ]);

      if (profs) setProfiles(profs);
      
      setStats({
        comisiones: (resCount || 0) * 150, // Mock calculation
        pendientes: (ents?.filter(e => e.status === 'pendiente').length || 0),
        afiliados: ents?.length || 0,
        usuarios: profs?.length || 0
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteEntity = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        const { error } = await supabase.from('entities').delete().eq('id', id);
        if (error) throw error;
        deleteEntity(id);
      } catch (error) {
        console.error("Error deleting entity:", error);
      }
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        setProfiles(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting profile:", error);
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: EntityStatus) => {
    try {
      const { error } = await supabase.from('entities').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      updateEntity(id, { status: newStatus });
      setStats(prev => ({ ...prev, pendientes: prev.pendientes - 1 }));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editingProfile.full_name,
          phone: editingProfile.phone,
          address: editingProfile.address,
          role: editingProfile.role
        })
        .eq('id', editingProfile.id);
      
      if (error) throw error;
      
      setProfiles(prev => prev.map(p => p.id === editingProfile.id ? editingProfile : p));
      setEditingProfile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Error al actualizar el perfil');
    }
  };

  const handleUpdateEntityDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntity) return;
    try {
      const { error } = await supabase
        .from('entities')
        .update({
          nombre: editingEntity.nombre,
          descripcion: editingEntity.descripcion,
          zona: editingEntity.zona,
          capacidad: editingEntity.capacidad,
          whatsapp: editingEntity.whatsapp,
          status: editingEntity.status
        })
        .eq('id', editingEntity.id);
      
      if (error) throw error;
      
      updateEntity(editingEntity.id, editingEntity);
      setEditingEntity(null);
    } catch (error) {
      console.error("Error updating entity:", error);
      alert('Error al actualizar el registro');
    }
  };

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    try {
      const { data: newProf, error } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(), // In a real app, this would be handled by Auth
          full_name: editingProfile.full_name,
          email: editingProfile.email,
          phone: editingProfile.phone,
          address: editingProfile.address,
          role: editingProfile.role || 'cliente'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setProfiles(prev => [newProf, ...prev]);
      setEditingProfile(null);
      setIsAddingProfile(false);
    } catch (error) {
      console.error("Error adding profile:", error);
      alert('Error al registrar el usuario. Nota: En este prototipo la creación de usuarios reales requiere registro vía Auth.');
    }
  };

  const handleAddEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntity) return;
    try {
      const { data: newEnt, error } = await supabase
        .from('entities')
        .insert([{
          nombre: editingEntity.nombre,
          descripcion: editingEntity.descripcion,
          zona: editingEntity.zona,
          capacidad: editingEntity.capacidad,
          whatsapp: editingEntity.whatsapp,
          status: editingEntity.status || 'pendiente',
          tipo: editingEntity.tipo || 'negocio',
          imagen: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Map to BaseEntity
      const mapped: BaseEntity = {
        id: newEnt.id,
        nombre: newEnt.nombre,
        descripcion: newEnt.descripcion,
        zona: newEnt.zona,
        capacidad: newEnt.capacidad,
        whatsapp: newEnt.whatsapp,
        status: newEnt.status,
        tipo: newEnt.tipo,
        imagen: newEnt.imagen,
        precio: 0,
        categoria: '',
        estrellas: 0
      };

      addEntity(mapped);
      setEditingEntity(null);
      setIsAddingEntity(false);
    } catch (error) {
      console.error("Error adding entity:", error);
      alert('Error al registrar el establecimiento');
    }
  };

  const filteredAffiliates = useMemo(() => {
    let list = data;
    if (filter !== 'all') {
      list = list.filter(e => e.tipo === filter);
    }
    return list;
  }, [filter, data]);

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
              <SummaryCard title="Comisiones Est." value={stats.comisiones} isCurrency trend="+15%" icon={DollarSign} />
              <SummaryCard title="Pendientes" value={stats.pendientes} trend={stats.pendientes > 0 ? "+"+stats.pendientes : "0"} icon={Clock} />
              <SummaryCard title="Total Afiliados" value={stats.afiliados} trend="+4" icon={UserCheck} />
              <SummaryCard title="Usuarios" value={stats.usuarios} trend="+22%" icon={Users} />
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
                  <button
                    onClick={() => {
                      setEditingEntity({
                        id: '',
                        nombre: '',
                        descripcion: '',
                        zona: 'Zona Dorada',
                        tipo: 'negocio',
                        status: 'pendiente',
                        capacidad: 0,
                        whatsapp: '',
                        imagen: '',
                        precio: 0,
                        categoria: '',
                        estrellas: 0
                      });
                      setIsAddingEntity(true);
                    }}
                    className="px-5 py-2.5 bg-dark text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Registro
                  </button>
                  {['all', 'hotel', 'negocio', 'clasificado'].map((cat) => (
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
                          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelectedEntity(a)}>
                            <div className="w-12 h-12 rounded-none bg-gray-100 flex items-center justify-center">
                              {a.tipo === 'hotel' ? <Building2 className="w-6 h-6 text-blue-500" /> : 
                               a.tipo === 'negocio' ? <Ship className="w-6 h-6 text-cyan-500" /> :
                               <MapIcon className="w-6 h-6 text-orange-500" />}
                            </div>
                            <div>
                              <p className="text-sm font-black text-dark uppercase tracking-tight">{a.nombre}</p>
                              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{a.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={cn(
                            "text-[9px] font-black px-3 py-1.5 rounded-none uppercase tracking-widest",
                            a.status === 'activo' ? "bg-emerald-100 text-emerald-700" :
                            a.status === 'pendiente' ? "bg-amber-100 text-amber-700" :
                            "bg-rose-100 text-rose-700"
                          )}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-[10px] font-bold text-muted uppercase">{a.zona}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {a.status === 'pendiente' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(a.id, 'activo')}
                                  className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-none transition-all"
                                  title="Aprobar"
                                >
                                  <CheckCircle2 className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(a.id, 'inactivo')}
                                  className="w-10 h-10 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded-none transition-all"
                                  title="Rechazar"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => setEditingEntity(a)}
                              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-primary/5 hover:text-primary rounded-none transition-all"
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEntity(a.id)}
                              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-none transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
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

        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-[calc(100vh-250px)]"
          >
            <div className="bg-white rounded-none shadow-xl shadow-black/5 border border-gray-100 h-full overflow-hidden flex flex-col">
              <div className="p-8 lg:p-10 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-dark uppercase tracking-[0.2em] flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Centro de Soporte Multiusuario
                  </h3>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Gestiona todas las conversaciones de socios y clientes</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-dark uppercase">Agentes Activos: 1</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                <SupportChat isAdmin={true} inline={true} />
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
              <div className="p-8 lg:p-10 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-dark uppercase tracking-[0.2em] flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  Directorio de Usuarios
                </h3>
                <button
                  onClick={() => {
                    setEditingProfile({
                      id: '',
                      full_name: '',
                      email: '',
                      phone: '',
                      address: '',
                      role: 'cliente'
                    });
                    setIsAddingProfile(true);
                  }}
                  className="px-5 py-2.5 bg-dark text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Usuario
                </button>
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
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => setEditingProfile(p)}
                              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-primary/5 hover:text-primary rounded-none transition-all"
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProfile(p.id)}
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
      </AnimatePresence>

      <AnimatePresence>
        {(editingEntity || isAddingEntity) && (
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
              <div className="bg-dark p-8 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">
                    {isAddingEntity ? 'Nuevo Registro' : 'Editar Registro'}
                  </h3>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">
                    {isAddingEntity ? 'Completa los datos del establecimiento' : editingEntity?.nombre}
                  </p>
                </div>
                <button onClick={() => { setEditingEntity(null); setIsAddingEntity(false); }} className="text-white/60 hover:text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={isAddingEntity ? handleAddEntity : handleUpdateEntityDetails} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Nombre</label>
                    <input 
                      type="text" 
                      required
                      value={editingEntity?.nombre || ''}
                      onChange={e => setEditingEntity({...editingEntity!, nombre: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Tipo</label>
                    <select 
                      value={editingEntity?.tipo || 'negocio'}
                      onChange={e => setEditingEntity({...editingEntity!, tipo: e.target.value as any})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold focus:outline-none focus:border-primary"
                    >
                      <option value="hotel">Hotel</option>
                      <option value="negocio">Negocio</option>
                      <option value="clasificado">Clasificado</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Zona</label>
                    <select 
                      value={editingEntity?.zona || 'Zona Dorada'}
                      onChange={e => setEditingEntity({...editingEntity!, zona: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold focus:outline-none focus:border-primary"
                    >
                      {ZONES.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">WhatsApp</label>
                    <input 
                      type="text" 
                      value={editingEntity?.whatsapp || ''}
                      onChange={e => setEditingEntity({...editingEntity!, whatsapp: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Descripción</label>
                  <textarea 
                    required
                    value={editingEntity?.descripcion || ''}
                    onChange={e => setEditingEntity({...editingEntity!, descripcion: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold focus:outline-none focus:border-primary h-24 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Capacidad / Info</label>
                    <input 
                      type="number" 
                      value={editingEntity?.capacidad || 0}
                      onChange={e => setEditingEntity({...editingEntity!, capacidad: parseInt(e.target.value)})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Estado</label>
                    <select 
                      value={editingEntity?.status || 'pendiente'}
                      onChange={e => setEditingEntity({...editingEntity!, status: e.target.value as EntityStatus})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold focus:outline-none focus:border-primary"
                    >
                      <option value="activo">Activo</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => { setEditingEntity(null); setIsAddingEntity(false); }}
                    className="px-8 py-3 bg-gray-100 text-dark font-black text-[10px] uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                  >
                    {isAddingEntity ? 'Registrar Ahora' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {(editingProfile || isAddingProfile) && (
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
              <div className="bg-dark p-8 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">
                    {isAddingProfile ? 'Nuevo Usuario' : 'Editar Usuario'}
                  </h3>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">
                    {isAddingProfile ? 'Registra un nuevo miembro en la plataforma' : editingProfile?.email}
                  </p>
                </div>
                <button onClick={() => { setEditingProfile(null); setIsAddingProfile(false); }} className="text-white/60 hover:text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={isAddingProfile ? handleAddProfile : handleUpdateProfile} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Nombre Completo</label>
                    <input 
                      type="text" 
                      required
                      value={editingProfile?.full_name || ''}
                      onChange={e => setEditingProfile({...editingProfile!, full_name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Email</label>
                    <input 
                      type="email" 
                      required
                      disabled={!isAddingProfile}
                      value={editingProfile?.email || ''}
                      onChange={e => setEditingProfile({...editingProfile!, email: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold focus:outline-none focus:border-primary disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Teléfono</label>
                    <input 
                      type="text" 
                      value={editingProfile?.phone || ''}
                      onChange={e => setEditingProfile({...editingProfile!, phone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Rol</label>
                    <select 
                      value={editingProfile?.role || 'cliente'}
                      onChange={e => setEditingProfile({...editingProfile!, role: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold focus:outline-none focus:border-primary"
                    >
                      <option value="cliente">Cliente</option>
                      <option value="hotel">Hotel</option>
                      <option value="negocio">Negocio</option>
                      <option value="clasificados">Clasificados</option>
                      <option value="agencia">Agencia</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Dirección</label>
                  <input 
                    type="text" 
                    value={editingProfile?.address || ''}
                    onChange={e => setEditingProfile({...editingProfile!, address: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 text-sm font-bold focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => { setEditingProfile(null); setIsAddingProfile(false); }}
                    className="px-8 py-3 bg-gray-100 text-dark font-black text-[10px] uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                  >
                    {isAddingProfile ? 'Registrar Ahora' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {selectedEntity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEntity(null)}
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
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{selectedEntity.nombre}</h3>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-2">Detalles del Afiliado</p>
                </div>
                <button 
                  onClick={() => setSelectedEntity(null)}
                  className="w-10 h-10 bg-white/10 rounded-none flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="aspect-video w-full overflow-hidden">
                  <img src={selectedEntity.imagen} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-none">
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest">Capacidad / Info</p>
                    <p className="text-xl font-black text-dark">{selectedEntity.capacidad || 0}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-none">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Estado</p>
                    <p className="text-xl font-black text-emerald-600 uppercase">{selectedEntity.status}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest">Descripción</p>
                  <p className="text-sm font-bold text-dark">{selectedEntity.descripcion}</p>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
                {selectedEntity.status === 'pendiente' && (
                  <button 
                    onClick={() => { handleUpdateStatus(selectedEntity.id, 'activo'); setSelectedEntity(null); }}
                    className="px-8 py-3 bg-emerald-500 text-white rounded-none font-black text-[10px] uppercase tracking-widest shadow-xl"
                  >
                    Aprobar Ahora
                  </button>
                )}
                <button 
                  onClick={() => setSelectedEntity(null)}
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
