'use client';
import { useState } from 'react';
import { useAddReview } from '@/hooks/useQuery';
import { Star, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next'

interface ReviewFormProps {
  doctorId: number;
  appointmentId: number;
  onClose: () => void;
}

export default function ReviewForm({ doctorId, appointmentId, onClose }: ReviewFormProps) {
  const { t } = useTranslation('ReviewForm'); // افترضنا أنكِ تملكين ملف ترجمة باسم ReviewForm
  const [rating, setRating] = useState(0);
  const [commentAr, setCommentAr] = useState('');
  const [commentEn, setCommentEn] = useState('');
  
  const { mutate: submitReview, isPending } = useAddReview();

  const handleSubmit = () => {
    if (rating === 0) {
        alert(t('error_rating'));
        return;
    }

    const payload = {
      doctor_id: doctorId,
      appointment_id: appointmentId,
      rating: rating,
      comment: { ar: commentAr, en: commentEn }
    };

    submitReview(payload, {
      onSuccess: () => {
        alert(t('success_message'));
        onClose();
      },
      onError: (error: any) => {
        if (error?.response?.status === 422) {
            alert(t('error_already_rated'));
        } else {
            alert(t('error_general'));
        }
      }
    });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl border w-full max-w-md mx-auto relative">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
      >
        <X size={20} />
      </button>
      
      <h2 className="text-xl font-bold mb-6 text-[#1B3A3A]">{t('title')}</h2>
      
      <div className="flex gap-1 mb-6 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={40}
            className={`cursor-pointer transition ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>

      <div className="space-y-4">
        <textarea 
          className="w-full p-3 border rounded-xl" 
          placeholder={t('placeholder_ar')} 
          rows={3} 
          value={commentAr} 
          onChange={(e) => setCommentAr(e.target.value)} 
        />
        <textarea 
          className="w-full p-3 border rounded-xl" 
          placeholder={t('placeholder_en')} 
          rows={3} 
          value={commentEn} 
          onChange={(e) => setCommentEn(e.target.value)} 
        />
      </div>

      <div className="mt-6">
        <button 
          onClick={handleSubmit} 
          disabled={isPending}
          className={`w-full py-3 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 
            ${isPending ? 'bg-gray-400' : 'bg-[#1B3A3A] hover:bg-[#152e2e]'}`}
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {t('submitting')}
            </>
          ) : (
            t('submit_button')
          )}
        </button>
      </div>
    </div>
  );
}