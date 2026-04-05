import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useNotifications } from './NotificationContext';

interface Favorite {
  id: string;
  itemId: string;
  userId: string;
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

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setFavorites([]);
      return;
    }

    const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Favorite));
      setFavorites(favs);
    });

    return () => unsubscribe();
  }, []);

  const isFavorite = (itemId: string) => {
    return favorites.some(f => f.itemId === itemId);
  };

  const toggleFavorite = async (item: any) => {
    const user = auth.currentUser;
    if (!user) {
      sendLocalNotification('Inicia Sesión', 'Debes iniciar sesión para guardar favoritos.');
      return;
    }

    const existing = favorites.find(f => f.itemId === item.id);

    if (existing) {
      try {
        await deleteDoc(doc(db, 'favorites', existing.id));
        sendLocalNotification('Eliminado', `${item.name} eliminado de favoritos.`);
      } catch (error) {
        console.error('Error removing favorite:', error);
      }
    } else {
      try {
        await addDoc(collection(db, 'favorites'), {
          itemId: item.id,
          userId: user.uid,
          name: item.name,
          category: item.category || 'General',
          image: item.image || 'https://picsum.photos/seed/aca/400/300',
          price: item.price || '$0',
          rating: item.rating || 5.0,
          createdAt: new Date()
        });
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
