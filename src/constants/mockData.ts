export type EntityStatus = 'activo' | 'inactivo' | 'pendiente';
export type EntityType = 'hotel' | 'negocio' | 'clasificado';

export interface BaseEntity {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  zona: string;
  imagen: string;
  status: EntityStatus;
  tipo: EntityType;
  whatsapp: string;
  categoria?: string; // Para negocios
  capacidad?: number; // Para clasificados/hoteles
}

export const MOCK_DATA: BaseEntity[] = [
  // Hoteles
  {
    id: 'h1',
    nombre: 'Hotel Emporio Acapulco',
    descripcion: 'Ubicado en el corazón de la Zona Dorada, con acceso directo a la playa y albercas icónicas.',
    precio: 2800,
    zona: 'Dorada',
    imagen: 'https://images.unsplash.com/photo-1571011272242-c3b290b5b5b0?auto=format&fit=crop&q=80&w=800',
    status: 'activo',
    tipo: 'hotel',
    whatsapp: '7441234567',
    capacidad: 400
  },
  {
    id: 'h2',
    nombre: 'Princess Mundo Imperial',
    descripcion: 'Lujo y arquitectura piramidal en la exclusiva Zona Diamante. Campos de golf y spas de clase mundial.',
    precio: 4500,
    zona: 'Diamante',
    imagen: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
    status: 'activo',
    tipo: 'hotel',
    whatsapp: '7449876543',
    capacidad: 1000
  },
  // Negocios
  {
    id: 'n1',
    nombre: 'Yates Bonanza',
    descripcion: 'El recorrido más tradicional por la bahía de Acapulco con música en vivo y barra libre.',
    precio: 450,
    zona: 'Muelle',
    imagen: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=800',
    status: 'activo',
    tipo: 'negocio',
    categoria: 'Yate',
    whatsapp: '7441112233'
  },
  {
    id: 'n2',
    nombre: 'La Cabaña de Caleta',
    descripcion: 'Pescados y mariscos frescos frente a la isla de la Roqueta. El sabor original de Guerrero.',
    precio: 350,
    zona: 'Tradicional',
    imagen: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800',
    status: 'activo',
    tipo: 'negocio',
    categoria: 'Restaurante',
    whatsapp: '7444445566'
  },
  // Clasificados (Propietarios)
  {
    id: 'c1',
    nombre: 'Depa en Torre Velera',
    descripcion: 'Moderno departamento con vista espectacular, alberca infinity y acceso a playa privada.',
    precio: 3500,
    zona: 'Diamante',
    imagen: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    status: 'activo',
    tipo: 'clasificado',
    whatsapp: '7447778899',
    capacidad: 6
  },
  {
    id: 'c2',
    nombre: 'Casa en Las Brisas',
    descripcion: 'Villa exclusiva con la mejor vista de la bahía. Alberca privada y máxima privacidad.',
    precio: 12000,
    zona: 'Las Brisas',
    imagen: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800',
    status: 'pendiente',
    tipo: 'clasificado',
    whatsapp: '7440001122',
    capacidad: 12
  }
];
