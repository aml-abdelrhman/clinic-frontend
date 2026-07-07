import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoriteStore {
  favoriteIds: number[];
  toggleFavorite: (id: number) => void;
  setFavorites: (ids: number[]) => void;
  clearFavorites: () => void; // تم إضافة هذا السطر
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set) => ({
      favoriteIds: [],
      
      // تعيين قائمة مفضلات جديدة
      setFavorites: (ids) => set({ favoriteIds: ids }),
      
      // تبديل حالة الإضافة أو الحذف
      toggleFavorite: (id) => set((state) => {
        const isExists = state.favoriteIds.includes(id);
        const newIds = isExists 
          ? state.favoriteIds.filter(i => i !== id) 
          : [...state.favoriteIds, id];
        return { favoriteIds: newIds };
      }),

      // مسح القائمة بالكامل (المطلوب للمزامنة)
      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    {
      name: 'favorite-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);