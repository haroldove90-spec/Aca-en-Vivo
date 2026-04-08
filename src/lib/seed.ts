import { supabase } from './supabase';

export async function seedDatabase() {
  try {
    // Check if we already have data to avoid redundant seeding
    const { count, error: countError } = await supabase
      .from('establishments')
      .select('*', { count: 'exact', head: true });
    
    if (count && count > 0) {
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
      { establishment_id: "hotel-1", habitaciones_totales: 20, disponibles_ahora: 12 },
      { establishment_id: "hotel-2", habitaciones_totales: 15, disponibles_ahora: 3 },
      { establishment_id: "hotel-3", habitaciones_totales: 10, disponibles_ahora: 0 },
    ];

    const { error: bizError } = await supabase
      .from('establishments')
      .insert(businesses);

    if (bizError) throw bizError;

    const { error: invError } = await supabase
      .from('inventario_hotel')
      .insert(inventories);

    if (invError) throw invError;

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
