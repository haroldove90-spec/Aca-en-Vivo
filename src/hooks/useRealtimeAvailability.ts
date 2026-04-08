import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook para escuchar la disponibilidad de un hotel en tiempo real usando Supabase.
 */
export function useRealtimeAvailability(hotelId: string) {
  const [disponibles, setDisponibles] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!hotelId) return;

    const fetchAvailability = async () => {
      const { data, error: err } = await supabase
        .from('inventario_hotel')
        .select('disponibles_ahora')
        .eq('establishment_id', hotelId)
        .single();

      if (err) {
        console.error("Error fetching initial availability:", err);
        setError(err as any);
      } else if (data) {
        setDisponibles(data.disponibles_ahora);
      }
      setLoading(false);
    };

    fetchAvailability();

    const channel = supabase.channel(`availability_${hotelId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'inventario_hotel',
        filter: `establishment_id=eq.${hotelId}`
      }, (payload) => {
        if (payload.new) {
          setDisponibles((payload.new as any).disponibles_ahora);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [hotelId]);

  return { disponibles, loading, error };
}
