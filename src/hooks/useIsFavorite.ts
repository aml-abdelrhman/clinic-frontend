'use client'
import { useMemo } from 'react'; // استخدام useMemo أفضل من useEffect هنا
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useGetFavorites } from '@/hooks/useQuery';
import { useAuthStore, selectUser } from '@/stores/useAuthStore';

export const useIsFavorite = (doctorId: number | null | undefined) => {
  const { favoriteIds } = useFavoriteStore();
  const user = useAuthStore(selectUser);
  const { data: apiFavorites } = useGetFavorites();

  // نستخدم useMemo بدلاً من useEffect ليكون الرد فورياً بدون تأخير Render واحد
  return useMemo(() => {
    if (!doctorId) return false;

    if (user?.id) {
      // إذا كان مسجلاً، نتأكد أن البيانات وصلت أولاً، ثم نبحث فيها
      return apiFavorites?.some((f: any) => f.doctor_id === doctorId) ?? false;
    } 
    
    // إذا كان زائراً، نعتمد على المخزن المحلي
    return favoriteIds.includes(doctorId);
  }, [doctorId, apiFavorites, user?.id, favoriteIds]);
};