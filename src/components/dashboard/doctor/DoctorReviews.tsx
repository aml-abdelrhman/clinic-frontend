'use client';

import { useTranslation } from 'react-i18next';
import { useGetDoctorReviews } from '@/hooks/useQuery';
import { Star, User, MessageSquare, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { Card } from "@/components/ui/card";

export default function DoctorReviews() {
  const { t, i18n } = useTranslation();
  const { data: reviews, isLoading, error } = useGetDoctorReviews();

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-[#2D6A4F]" size={40} />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-red-500">
      <AlertCircle size={48} className="mb-4" />
      <h2 className="text-xl font-bold">{t('error_loading_reviews')}</h2>
    </div>
  );

  return (
    <div className="pt-24 px-4 md:px-6 max-w-4xl mx-auto" dir={i18n.dir()}>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B3A3A] mb-2">{t('patient_reviews')}</h1>
        <p className="text-gray-500 text-sm md:text-base">{t('here_you_can_see_all_feedback')}</p>
      </div>

      <div className="grid gap-6">
        {!reviews || reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            {t('no_reviews_yet')}
          </div>
        ) : (
          reviews.map((review: any) => (
            <Card key={review.id} className="group relative p-4 md:p-6 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
              {/* شريط جانبي ملون */}
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#2D6A4F]" />

              {/* رأس البطاقة - Responsive */}
              <div className="flex flex-wrap justify-between items-start pl-4 gap-4">
                
                {/* معلومات المريض */}
                <div className="flex items-center gap-3 md:gap-4 flex-grow">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#E8F1ED] flex items-center justify-center text-[#2D6A4F] font-bold text-base md:text-lg shrink-0">
                    {review.patient?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1B3A3A] text-sm md:text-lg">{review.patient?.name || t('anonymous')}</h3>
                    <div className="flex items-center text-gray-400 text-xs md:text-sm gap-1">
                      <Calendar size={12} />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* التقييم - تم إضافة shrink-0 لمنعه من الانضغاط */}
                <div className="flex items-center gap-1 bg-[#FFF9E6] px-3 py-1 rounded-full border border-[#FFE58F] shrink-0">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="font-bold text-amber-700 text-sm md:text-base">{review.rating}</span>
                </div>
              </div>

              {/* قسم التعليق */}
              <div className="mt-4 md:mt-6 pl-4 border-l-2 border-gray-100 ml-4">
                <div className="flex gap-2 text-[#2D6A4F] mb-2 font-semibold text-sm">
                  <MessageSquare size={16} />
                  <span>{t('patient_feedback')}</span>
                </div>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed bg-gray-50 p-3 md:p-4 rounded-xl italic">
                  "{i18n.language === 'ar' 
                    ? review.comment?.ar 
                    : review.comment?.en || review.comment?.ar || t('no_comment')}"
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}