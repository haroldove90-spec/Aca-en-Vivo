import { useState, useEffect } from 'react';
import { MOCK_DATA, BaseEntity } from '../constants/mockData';
import { supabase } from '../lib/supabase';

export function useAcaData() {
  const [data, setData] = useState<BaseEntity[]>(MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: dbData, error } = await supabase
          .from('entities')
          .select('*');

        if (error) throw error;

        if (dbData && dbData.length > 0) {
          // Map DB fields to our BaseEntity interface
          const mappedData: BaseEntity[] = dbData.map(item => ({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion,
            precio: Number(item.precio),
            zona: item.zona,
            imagen: item.imagen,
            status: item.status,
            tipo: item.tipo,
            whatsapp: item.whatsapp,
            categoria: item.categoria,
            capacidad: item.capacidad,
            estrellas: item.rating || item.estrellas
          }));
          setData(mappedData);
        } else {
          setData(MOCK_DATA);
        }
      } catch (err) {
        console.error("Error fetching from Supabase:", err);
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateEntity = (id: string, updates: Partial<BaseEntity>) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteEntity = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
  };

  const addEntity = (entity: BaseEntity) => {
    setData(prev => [...prev, entity]);
  };

  const getEntitiesByType = (type: 'hotel' | 'negocio' | 'clasificado') => {
    return data.filter(item => item.tipo === type);
  };

  return {
    data,
    loading,
    updateEntity,
    deleteEntity,
    addEntity,
    getEntitiesByType
  };
}
