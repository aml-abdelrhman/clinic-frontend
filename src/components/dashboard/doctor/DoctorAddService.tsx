'use client';

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useAddDoctorService } from "@/hooks/useQuery";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Upload, X } from "lucide-react";

export default function AddDoctorServicePage() {
  const { t, i18n } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();
  const { mutate: addService, isPending } = useAddDoctorService();
  const { register, handleSubmit, setValue } = useForm();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      setValue("image", e.target.files);
    }
  };

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append("name", JSON.stringify({ ar: data.name_ar, en: data.name_en }));
    formData.append("price", data.price);
    formData.append("duration_minutes", data.duration);
    formData.append("is_active", "1");
    if (data.image && data.image[0]) formData.append("image", data.image[0]);

    addService(formData, { onSuccess: () => router.navigate({ to: '/dashboard/doctor/my-services' }) });
  };

  return (
    <div className={`pt-24 px-4 md:px-8 w-full ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <Card className="max-w-lg mx-auto shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>{t('add_new_service')}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}>
            <Globe className="w-4 h-4 mr-2" /> {i18n.language === 'ar' ? 'English' : 'العربية'}
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register("name_ar")} placeholder={t('name_ar_placeholder')} required />
            <Input {...register("name_en")} placeholder={t('name_en_placeholder')} required />
            <div className="grid grid-cols-2 gap-4">
              <Input {...register("price")} type="number" placeholder={t('price')} required />
              <Input {...register("duration")} type="number" placeholder={t('duration')} required />
            </div>
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center relative">
              {preview ? (
                <div className="relative inline-block"><img src={preview} alt="Preview" className="max-h-32 rounded-md" />
                  <button type="button" onClick={() => { setPreview(null); setValue("image", null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14} /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <input type="file" onChange={handleImageChange} className="hidden" />
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">{t('upload_instruction')}</span>
                </label>
              )}
            </div>
            <Button type="submit" className="w-full bg-[#2D6A4F]" disabled={isPending}>{isPending ? t('saving') : t('save_service')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}