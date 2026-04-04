import { useState } from 'react';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { HotelUpdatePanel } from '../../components/HotelUpdatePanel';

export default function HotelDashboard() {
  const hotelId = "hotel-1"; // Mock ID

  const handleUpdate = async (delta: number) => {
    const docRef = doc(db, 'inventario_hotel', hotelId);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      const current = snapshot.data().disponibles_ahora;
      const total = snapshot.data().habitaciones_totales;
      const next = Math.max(0, Math.min(total, current + delta));
      
      // 1. Client-side Firestore Update (Real-time)
      await updateDoc(docRef, {
        disponibles_ahora: next,
        ultima_actualizacion: serverTimestamp(),
      });

      // 2. Server-side "Action" (Validation & Logging)
      await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_establecimiento: hotelId, delta }),
      });
    }
  };

  const handleClose = async () => {
    const docRef = doc(db, 'inventario_hotel', hotelId);
    
    // 1. Client-side Firestore Update (Real-time)
    await updateDoc(docRef, {
      disponibles_ahora: 0,
      ultima_actualizacion: serverTimestamp(),
    });

    // 2. Server-side "Action"
    await fetch('/api/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_establecimiento: hotelId, set_to_zero: true }),
    });
  };

  return (
    <div className="min-h-screen bg-[#F2E1C1]/30 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-black text-[#142850] uppercase tracking-tighter">
          AcaEnVivo <span className="text-[#00A8CC]">Pro</span>
        </h1>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
          Panel de Control Hotelero
        </p>
      </div>

      <HotelUpdatePanel 
        hotelId={hotelId}
        onUpdate={handleUpdate}
        onCloseInventory={handleClose}
      />
      
      <div className="mt-12 text-center max-w-xs">
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
          Los cambios se reflejan instantáneamente en el feed del cliente. 
          Asegúrese de mantener su inventario actualizado para evitar sobreventas.
        </p>
      </div>
    </div>
  );
}

