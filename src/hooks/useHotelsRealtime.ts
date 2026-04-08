import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface HotelWithInventory {
  id: string;
  nombre: string;
  zona: 'Diamante' | 'Dorada' | 'Tradicional';
  estrellas?: number;
  disponibles: number;
  habitaciones_totales: number;
}

/**
 * Hook que sincroniza la lista completa de hoteles con su inventario en tiempo real usando Supabase.
 */
export function useHotelsRealtime() {
  const [hoteles, setHoteles] = useState<HotelWithInventory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: establishments } = await supabase
      .from('establishments')
      .select('*')
      .eq('tipo', 'hotel')
      .order('nombre');

    const { data: inventory } = await supabase
      .from('inventario_hotel')
      .select('*');

    if (establishments) {
      const invMap: Record<string, any> = {};
      inventory?.forEach(inv => {
        invMap[inv.establishment_id] = inv;
      });

      const combined = establishments.map(est => ({
        id: est.id,
        nombre: est.nombre,
        zona: est.zona as any,
        estrellas: est.estrellas,
        disponibles: invMap[est.id]?.disponibles_ahora ?? 0,
        habitaciones_totales: invMap[est.id]?.habitaciones_totales ?? 0,
      }));
      setHoteles(combined);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const estChannel = supabase.channel('hotels_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'establishments' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventario_hotel' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      estChannel.unsubscribe();
    };
  }, []);

  return { hoteles, loading };
}
