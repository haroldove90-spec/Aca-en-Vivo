import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotifications } from './NotificationContext';
import { HOTEL_IMAGES } from '../constants/images';

interface Favorite {
  id: string;
  item_id: string;
  user_id: string;
  name: string;
  category: string;
  image: string;
  price: string;
  rating: number;
}

interface FavoritesContextType {
  favorites: Favorite[];
  isFavorite: (itemId: string) => boolean;
  toggleFavorite: (item: any) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const { sendLocalNotification } = useNotifications();

  const fetchFavorites = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (data) setFavorites(data as Favorite[]);
    } else {
      setFavorites([]);
    }
  };

  useEffect(() => {
    fetchFavorites();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchFavorites();
      } else {
        setFavorites([]);
      }
    });

    // Realtime subscription
    const channel = supabase.channel('favorites_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, () => {
        fetchFavorites();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      channel.unsubscribe();
    };
  }, []);

  const isFavorite = (itemId: string) => {
    return favorites.some(f => f.item_id === itemId);
  };

  const toggleFavorite = async (item: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      sendLocalNotification('Error', 'Debes iniciar sesión para guardar favoritos.');
      return;
    }
    
    const existing = favorites.find(f => f.item_id === item.id);

    // Optimistic UI update
    if (existing) {
      setFavorites(prev => prev.filter(f => f.item_id !== item.id));
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existing.id);

        if (error) {
          console.error('Error removing favorite from Supabase:', error);
          await fetchFavorites(); // Revert on error
          throw error;
        }
        sendLocalNotification('Eliminado', `${item.name} eliminado de favoritos.`);
      } catch (error) {
        console.error('Error removing favorite:', error);
      }
    } else {
      const newFav: Favorite = {
        id: Math.random().toString(), // Temp ID
        item_id: item.id,
        user_id: session.user.id,
        name: item.name,
        category: item.category || 'General',
        image: item.image || HOTEL_IMAGES.EXTERIOR,
        price: item.price || '$0',
        rating: item.rating || 5.0
      };
      setFavorites(prev => [...prev, newFav]);
      
      try {
        const { error } = await supabase
          .from('favorites')
          .insert({
            item_id: item.id,
            user_id: session.user.id,
            name: item.nombre || item.name,
            category: item.tipo || item.category || 'General',
            image: item.imagen || item.image || HOTEL_IMAGES.EXTERIOR,
            price: item.precio || item.price || '$0',
            rating: item.rating || 5.0
          });

        if (error) {
          console.error('Error adding favorite to Supabase:', error);
          await fetchFavorites(); // Revert on error
          throw error;
        }
        sendLocalNotification('Guardado', `${item.name} guardado en favoritos.`);
      } catch (error) {
        console.error('Error adding favorite:', error);
      }
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};
