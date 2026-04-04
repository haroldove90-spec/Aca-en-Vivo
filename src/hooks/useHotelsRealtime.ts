import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface HotelWithInventory {
  id: string;
  nombre: string;
  zona: 'Diamante' | 'Dorada' | 'Tradicional';
  estrellas?: number;
  disponibles: number;
  habitaciones_totales: number;
}

/**
 * Hook que sincroniza la lista completa de hoteles con su inventario en tiempo real.
 */
export function useHotelsRealtime() {
  const [hoteles, setHoteles] = useState<HotelWithInventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Escuchar establecimientos
    const qEst = query(collection(db, 'establecimientos'), orderBy('nombre'));
    
    // 2. Escuchar inventario
    const qInv = collection(db, 'inventario_hotel');

    let estData: any[] = [];
    let invData: Record<string, any> = {};

    const syncData = () => {
      const combined = estData.map(est => ({
        ...est,
        disponibles: invData[est.id]?.disponibles_ahora ?? 0,
        habitaciones_totales: invData[est.id]?.habitaciones_totales ?? 0,
      }));
      setHoteles(combined);
      setLoading(false);
    };

    const unsubEst = onSnapshot(qEst, (snapshot) => {
      estData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      syncData();
    });

    const unsubInv = onSnapshot(qInv, (snapshot) => {
      invData = {};
      snapshot.docs.forEach(doc => {
        invData[doc.id] = doc.data();
      });
      syncData();
    });

    return () => {
      unsubEst();
      unsubInv();
    };
  }, []);

  return { hoteles, loading };
}
