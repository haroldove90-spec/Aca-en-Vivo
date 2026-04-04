import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Hook para escuchar la disponibilidad de un hotel en tiempo real.
 * Reemplaza la lógica de Supabase Realtime solicitada usando el motor de Firestore
 * ya configurado en el proyecto para garantizar actualizaciones de < 1s.
 */
export function useRealtimeAvailability(hotelId: string) {
  const [disponibles, setDisponibles] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!hotelId) return;

    const docRef = doc(db, 'inventario_hotel', hotelId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setDisponibles(snapshot.data().disponibles_ahora);
        } else {
          setDisponibles(0);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error en suscripción real-time:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [hotelId]);

  return { disponibles, loading, error };
}
