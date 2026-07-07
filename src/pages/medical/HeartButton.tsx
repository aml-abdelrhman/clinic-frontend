import { Heart } from 'lucide-react';
import { useIsFavorite } from '@/hooks/useIsFavorite';
import { useToggleFavorite } from '@/hooks/useQuery';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useAuthStore, selectUser } from '@/stores/useAuthStore'; // استيراد الـ store والـ selector

export const HeartButton = ({ doctorId }: { doctorId: number }) => {
  const isFavorite = useIsFavorite(doctorId);
  const { toggleFavorite } = useFavoriteStore();
  const { mutate: toggleFavApi } = useToggleFavorite();
  
  // استخدام الـ selector الذي قمتِ بتعريفه
  const user = useAuthStore(selectUser); 

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // الآن user هو الـ AuthUser | null الخاص بكِ
    if (user?.id) {
      toggleFavApi(doctorId);
    } else {
      toggleFavorite(doctorId);
    }
  };

  return (
    <button onClick={handleClick} className="p-2 bg-white/90 rounded-full hover:scale-110 transition">
      <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"} />
    </button>
  );
};