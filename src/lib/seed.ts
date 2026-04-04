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

    const businesses = [
      { id: "hotel-1", nombre: "Hotel Emporio Acapulco", zona: "Dorada", tipo: "hotel", estrellas: 4 },
      { id: "hotel-2", nombre: "Hotel Calinda", zona: "Dorada", tipo: "hotel", estrellas: 3 },
      { id: "hotel-3", nombre: "Hotel Princess Mundo Imperial", zona: "Diamante", tipo: "hotel", estrellas: 5 },
      { id: "rest-1", nombre: "La Cabaña de Caleta", zona: "Tradicional", tipo: "restaurante", afluencia: "baja", promocion: "2x1 en Margaritas" },
      { id: "rest-2", nombre: "Sr. Frogs", zona: "Dorada", tipo: "restaurante", afluencia: "media", promocion: "Shot de bienvenida gratis" },
      { id: "yate-1", nombre: "Yates Bonanza", zona: "Tradicional", tipo: "yate", promocion: "20% OFF en tour al atardecer" },
      { id: "tienda-1", nombre: "Bikini Town", zona: "Dorada", tipo: "tienda", promocion: "30% en moda playera" },
      { id: "art-1", nombre: "Mercado de Santa Lucía", zona: "Tradicional", tipo: "artesania", promocion: "Souvenirs desde $50" },
      { id: "renta-1", nombre: "Motos Acapulco Express", zona: "Dorada", tipo: "renta", promocion: "Renta por día $400" },
      { id: "salud-1", nombre: "Farmacia 24 Horas", zona: "Diamante", tipo: "salud", promocion: "Servicio a domicilio gratis" },
    ];

    const inventories = [
      { id_establecimiento: "hotel-1", habitaciones_totales: 20, disponibles_ahora: 12 },
      { id_establecimiento: "hotel-2", habitaciones_totales: 15, disponibles_ahora: 3 },
      { id_establecimiento: "hotel-3", habitaciones_totales: 10, disponibles_ahora: 0 },
    ];

    for (const biz of businesses) {
      await setDoc(doc(db, 'establecimientos', biz.id), biz);
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
