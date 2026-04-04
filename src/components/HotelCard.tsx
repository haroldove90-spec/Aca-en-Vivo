import { Hotel, MapPin, Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface HotelCardProps {
  key?: string | number;
  nombre: string;
  zona: 'Diamante' | 'Dorada' | 'Tradicional';
  estrellas?: number;
  disponibles: number;
  onReservaRapida?: () => void;
}

export function HotelCard({
  nombre,
  zona,
  estrellas,
  disponibles,
  onReservaRapida,
}: HotelCardProps) {
  const getAvailabilityStatus = () => {
    if (disponibles > 5) return { label: 'Disponible', color: 'bg-green-500', icon: '🟢' };
    if (disponibles > 0) return { label: '¡Últimas!', color: 'bg-yellow-500', icon: '🟡' };
    return { label: 'Lleno', color: 'bg-red-500', icon: '🔴' };
  };

  const status = getAvailabilityStatus();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all hover:shadow-xl w-full max-w-sm mx-auto">
      {/* Header Image Placeholder */}
      <div className="h-40 bg-[#142850] relative flex items-center justify-center">
        <Hotel className="text-[#00A8CC] w-16 h-16 opacity-50" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-4 h-4 fill-[#F2E1C1] text-[#F2E1C1]" />
          <span className="text-xs font-bold text-[#142850]">{estrellas || 4}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-[#142850] leading-tight truncate">
            {nombre}
          </h3>
          <div className="flex items-center text-gray-500 gap-1">
            <MapPin className="w-4 h-4 text-[#00A8CC]" />
            <span className="text-sm font-medium">{zona}</span>
          </div>
        </div>

        {/* Availability Traffic Light */}
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className={cn("w-3 h-3 rounded-full", status.color)} />
            <span className={cn("text-sm font-bold", 
              disponibles > 5 ? "text-green-700" : 
              disponibles > 0 ? "text-yellow-700" : "text-red-700"
            )}>
              {status.label}
            </span>
          </div>
          <span className="text-xs font-medium text-gray-400">
            {disponibles} hab.
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onReservaRapida}
          disabled={disponibles === 0}
          className={cn(
            "w-full py-3 rounded-lg font-bold text-white transition-all active:scale-95 shadow-md",
            disponibles > 0 
              ? "bg-[#00A8CC] hover:bg-[#142850] cursor-pointer" 
              : "bg-gray-300 cursor-not-allowed"
          )}
        >
          Reserva Rápida
        </button>
      </div>
    </div>
  );
}
