'use client';

import { useTranslation } from 'react-i18next';
import { useGetAdminReviews, useDeleteReview } from '@/hooks/useQuery';
import { Trash2, Loader2, Star, User, Stethoscope, MessageSquareOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';

export default function AdminReviews() {
  const { t, i18n } = useTranslation();
  const { data: reviews, isLoading } = useGetAdminReviews();
  const { mutate: deleteMutation } = useDeleteReview();

  const getLocalized = (field: any) => {
    if (!field) return '-';
    if (typeof field === 'string') return field;
    return field[i18n.language] || field['ar'] || Object.values(field)[0];
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className={i < rating ? "fill-amber-500 text-amber-500" : "text-gray-300"} />
      ))}
    </div>
  );

  if (isLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin text-[#2D6A4F]" size={40} />
    </div>
  );

  return (
    <div className="pt-24 px-4 sm:px-6 pb-12 max-w-6xl mx-auto w-full" dir={i18n.dir()}>
      <h1 className="text-2xl font-black mb-8 text-[#1B3A3A] border-b pb-4">
        {t('all_reviews')}
      </h1>

      {/* التحقق من وجود تقييمات */}
      {reviews?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
          <MessageSquareOff size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">{t('no_reviews_found')}</p>
        </div>
      ) : (
        <>
          {/* شاشة الموبايل */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {reviews?.map((review: any) => (
              <Card key={review.id} className="p-4 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">{t('doctor')}</p>
                    <p className="font-semibold text-sm mb-2 text-slate-800">{getLocalized(review.doctor?.name)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">{t('patient')}</p>
                    <p className="font-semibold text-sm text-slate-800">{getLocalized(review.patient?.name)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {renderStars(review.rating)}
                    <span className="text-xs font-bold text-amber-600">{review.rating}/5</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-red-500 hover:bg-red-50 border-red-100"
                  onClick={() => deleteMutation(review.id, { onSuccess: () => toast.success(t("delete_success")) })}
                >
                  <Trash2 size={16} className="me-2" /> {t('delete')}
                </Button>
              </Card>
            ))}
          </div>

          {/* شاشة الكمبيوتر */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">{t('doctor')}</th>
                  <th className="px-6 py-4">{t('patient')}</th>
                  <th className="px-6 py-4">{t('rating')}</th>
                  <th className="px-6 py-4 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews?.map((review: any) => (
                  <tr key={review.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{getLocalized(review.doctor?.name)}</td>
                    <td className="px-6 py-4">{getLocalized(review.patient?.name)}</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            <span className="font-bold text-xs text-slate-500">{review.rating}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50"
                        onClick={() => deleteMutation(review.id, { onSuccess: () => toast.success(t("delete_success")) })}>
                        <Trash2 size={18} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}