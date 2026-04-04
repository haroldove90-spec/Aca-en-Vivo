import { collection, doc, setDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';

export async function seedDatabase() {
  try {
    // Check if we already have data to avoid redundant seeding
    const q = query(collection(db, 'establecimientos'), limit(1));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      console.log("Database already has data, skipping seed.");
      return;
    }

    const hotels = [
      {
        id: "hotel-1",
        nombre: "Hotel Princess Mundo Imperial",
        zona: "Diamante",
        tipo: "hotel",
        estrellas: 5,
      },
      {
        id: "hotel-2",
        nombre: "Hotel Emporio Acapulco",
        zona: "Dorada",
        tipo: "hotel",
        estrellas: 4,
      },
      {
        id: "hotel-3",
        nombre: "Hotel Las Brisas",
        zona: "Tradicional",
        tipo: "hotel",
        estrellas: 5,
      },
    ];

    const inventories = [
      {
        id_establecimiento: "hotel-1",
        habitaciones_totales: 20,
        disponibles_ahora: 12,
      },
      {
        id_establecimiento: "hotel-2",
        habitaciones_totales: 15,
        disponibles_ahora: 3,
      },
      {
        id_establecimiento: "hotel-3",
        habitaciones_totales: 10,
        disponibles_ahora: 0,
      },
    ];

    for (const hotel of hotels) {
      await setDoc(doc(db, 'establecimientos', hotel.id), hotel);
    }

    for (const inv of inventories) {
      await setDoc(doc(db, 'inventario_hotel', inv.id_establecimiento), {
        ...inv,
        ultima_actualizacion: serverTimestamp(),
      });
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
