import { useState, useEffect } from 'react';
import { Plus, Minus, XCircle, Loader2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useRealtimeAvailability } from '../hooks/useRealtimeAvailability';

interface HotelUpdatePanelProps {
  hotelId: string;
  onUpdate: (delta: number) => Promise<void>;
  onCloseInventory: () => Promise<void>;
}

export function HotelUpdatePanel({
  hotelId,
  onUpdate,
  onCloseInventory,
}: HotelUpdatePanelProps) {
  const { disponibles, loading } = useRealtimeAvailability(hotelId);
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('--:--');

  useEffect(() => {
    if (disponibles !== null) {
      setLastUpdate(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [disponibles]);

  const handleUpdate = async (delta: number) => {
    if (updating) return;
    setUpdating(true);
    try {
      await onUpdate(delta);
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = async () => {
    if (updating || !window.confirm("¿Seguro que quieres cerrar el inventario por completo?")) return;
    setUpdating(true);
    try {
      await onCloseInventory();
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-12 h-12 text-[#00A8CC] animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl border-8 border-[#142850] overflow-hidden">
      {/* Top Section: Status */}
      <div className="bg-[#142850] p-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-[#00A8CC]/20 px-3 py-1 rounded-full">
          <Clock className="w-4 h-4 text-[#00A8CC]" />
          <span className="text-[10px] font-black text-[#00A8CC] uppercase tracking-widest">
            Última actualización: {lastUpdate}
          </span>
        </div>
        <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest">
          Control de Disponibilidad
        </h2>
      </div>

      {/* Main Counter Section */}
      <div className="p-10 flex flex-col items-center justify-center space-y-12 bg-gradient-to-b from-white to-gray-50">
        <div className="relative">
          {/* Decorative Ring */}
          <div className="absolute inset-0 -m-8 border-4 border-dashed border-gray-100 rounded-full animate-[spin_20s_linear_infinite]" />
          
          <div className="w-48 h-48 rounded-full bg-white shadow-[0_20px_50px_rgba(20,40,80,0.1)] flex flex-col items-center justify-center border-2 border-gray-50 relative z-10">
            <span className="text-8xl font-black text-[#142850] leading-none select-none">
              {disponibles ?? 0}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
              Habitaciones
            </span>
          </div>
        </div>

        {/* Massive Control Buttons */}
        <div className="grid grid-cols-2 gap-8 w-full px-4">
          <button
            onClick={() => handleUpdate(-1)}
            disabled={updating || (disponibles ?? 0) <= 0}
            className={cn(
              "h-32 rounded-3xl flex items-center justify-center transition-all active:scale-90 shadow-lg border-b-8 border-red-700",
              "bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:grayscale"
            )}
          >
            <Minus className="w-16 h-16 stroke-[3]" />
          </button>

          <button
            onClick={() => handleUpdate(1)}
            disabled={updating}
            className={cn(
              "h-32 rounded-3xl flex items-center justify-center transition-all active:scale-90 shadow-lg border-b-8 border-green-700",
              "bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:grayscale"
            )}
          >
            <Plus className="w-16 h-16 stroke-[3]" />
          </button>
        </div>

        {/* Emergency Button */}
        <button
          onClick={handleClose}
          disabled={updating || (disponibles ?? 0) === 0}
          className={cn(
            "w-full py-6 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all active:scale-95",
            "bg-[#142850] text-white hover:bg-black shadow-xl disabled:opacity-30"
          )}
        >
          <XCircle className="w-6 h-6 text-red-500" />
          <span>Cerrar Inventario (Lleno)</span>
        </button>
      </div>

      {/* Footer Branding */}
      <div className="bg-gray-100 p-4 text-center">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
          AcaEnVivo • Hotel Engine
        </span>
      </div>
    </div>
  );
}
