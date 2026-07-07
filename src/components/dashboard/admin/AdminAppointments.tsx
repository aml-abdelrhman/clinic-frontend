'use client';
import { useTranslation } from 'react-i18next';
import { useGetAdminAppointments, useDeleteAdminAppointment } from '@/hooks/useQuery';
import { toast } from 'sonner';
import { Trash2, Loader2, Calendar, Clock, User, Stethoscope, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminAppointments() {
  // i18n تحتوي على اللغة الحالية (مثلاً 'ar' أو 'en')
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language; 

  const { data: appointments, isLoading } = useGetAdminAppointments();
  const { mutate: deleteAppointment, isPending } = useDeleteAdminAppointment();

  // دالة ذكية للتعامل مع نصوص الترجمة
  const parseName = (field: any) => {
    if (!field) return "---";
    // إذا كان الحقل مخزناً كـ JSON (مثل {ar: "...", en: "..."})
    if (typeof field === 'object' && field !== null) {
      return field[currentLang] || field.ar || field.en || "---";
    }
    // إذا كان نصاً عادياً (مخزن كـ string مباشرة)
    return field;
  };

  const formatDate = (dateString: string) => dateString?.split('T')[0] || "";
  const formatTime = (timeString: string) => timeString?.substring(0, 5) || "";

  const handleDelete = (id: number) => {
    if (window.confirm(t("confirm_delete"))) {
      deleteAppointment(id, {
        onSuccess: () => toast.success(t("delete_success")),
        onError: () => toast.error(t("delete_error"))
      });
    }
  };

  return (
    <div className="pt-24 px-4 sm:px-6 pb-12 max-w-6xl mx-auto w-full" dir={t("dir")}>
      <div className="flex items-center gap-3 mb-8 border-b pb-6">
        <ShieldCheck className="text-[#1B3A3A]" size={32} />
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B3A3A]">
          {t("appointments")}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="animate-spin text-[#2D6A4F]" size={40} />
          </div>
        ) : appointments?.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500 bg-white rounded-xl border">
            {t("no_appointments")}
          </div>
        ) : (
          appointments?.map((app: any) => (
            <Card key={app.id} className="group hover:border-[#2D6A4F]/50 transition-all shadow-sm">
              <CardContent className="p-5 flex justify-between items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shrink-0">
                    <User size={24} />
                  </div>
                  <div className="space-y-1.5 w-full">
                    <h3 className="font-bold text-lg text-slate-900">
                      {t("patient")}: {parseName(app.patient?.name)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("doctor")}: <span className="font-semibold text-slate-800">{parseName(app.doctor?.name)}</span>
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={14} className="text-[#2D6A4F]"/> {formatDate(app.appointment_date)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} className="text-[#2D6A4F]"/> {formatTime(app.start_time)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-blue-600 col-span-full">
                        <Stethoscope size={14}/> {parseName(app.service?.name)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                  onClick={() => handleDelete(app.id)}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}