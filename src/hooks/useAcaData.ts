import { useState, useEffect } from 'react';
import { MOCK_DATA, BaseEntity } from '../constants/mockData';

export function useAcaData() {
  const [data, setData] = useState<BaseEntity[]>(() => {
    const saved = localStorage.getItem('aca_envivo_data');
    return saved ? JSON.parse(saved) : MOCK_DATA;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('aca_envivo_data', JSON.stringify(data));
    setLoading(false);
  }, [data]);

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
