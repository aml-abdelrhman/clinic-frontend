'use client';

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useGetServices, useUpdatedoctorService } from "@/hooks/useQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Upload, ImageIcon } from "lucide-react";

export default function EditServicePage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: services, isLoading } = useGetServices();
  const updateService = useUpdatedoctorService();
  
  const service = (services as any[])?.find((s: any) => s.id === Number(id));

  const [form, setForm] = useState({ nameAr: '', nameEn: '', price: '', duration: '', isActive: true });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      let parsedName = service.name;
      if (typeof parsedName === 'string' && parsedName.startsWith('{')) {
        try { parsedName = JSON.parse(parsedName); } catch (e) { console.error(e); }
      }

      setForm({
        nameAr: parsedName?.ar || '',
        nameEn: parsedName?.en || '',
        price: service.price?.toString() || '',
        duration: service.duration_minutes?.toString() || '',
        isActive: !!service.is_active
      });
      // تعيين الصورة القادمة من السيرفر كمعاينة أولية
      setPreview(service.image_url);
    }
  }, [service]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    formData.append('name[ar]', form.nameAr);
    formData.append('name[en]', form.nameEn);
    formData.append('price', form.price);
    formData.append('duration_minutes', form.duration);
    formData.append('is_active', form.isActive ? '1' : '0');
    
    if (file) formData.append('image', file);
    
    updateService.mutate({ id: Number(id), formData }, {
      onSuccess: () => navigate({ to: '/dashboard/doctor/my-services' }),
      onError: (err: any) => {
        console.error("خطأ:", err);
        alert(t('error_save'));
      }
    });
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-[#2D6A4F]" /></div>;

  return (
    <div className={`w-full pt-24 px-4 pb-12 max-w-2xl mx-auto ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/dashboard/doctor/my-services' })}>
          <ArrowLeft className="ml-2" /> {t('back')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="Service" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50"><ImageIcon className="text-slate-400" /></div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
            <div>
              <CardTitle>{t('edit_service')}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-bold">{t('name_ar')}</label><Input value={form.nameAr} onChange={(e) => setForm({...form, nameAr: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-bold">{t('name_en')}</label><Input value={form.nameEn} onChange={(e) => setForm({...form, nameEn: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-bold">{t('price')}</label><Input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-bold">{t('duration_min')}</label><Input type="number" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} /></div>
            </div>
            <Button type="submit" className="w-full bg-[#2D6A4F]" disabled={updateService.isPending}>
              {updateService.isPending ? <Loader2 className="animate-spin" /> : t('save_changes')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}