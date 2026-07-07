'use client';

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useGetServices, useUpdateService } from "@/hooks/useQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, Upload, ImageIcon, Globe } from "lucide-react";

export default function EditServicePage() {

  
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  
  // 1. جلب البيانات
  const { data: services, isLoading } = useGetServices();
  const updateService = useUpdateService();
  
  // 2. البحث عن الخدمة (تم تحويل الـ ID لـ Number لضمان المطابقة)
  const service = (services as any[])?.find((s: any) => Number(s.id) === Number(id));

  const [form, setForm] = useState({
    nameAr: '',
    nameEn: '',
    price: '',
    duration: '',
    isActive: true
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // تحديث القيم عند جلب الخدمة
  useEffect(() => {
    if (service) {
      let parsedName = service.name;
      if (typeof parsedName === 'string' && parsedName.startsWith('{')) {
        try { parsedName = JSON.parse(parsedName); } catch (e) { parsedName = { ar: '', en: '' }; }
      }

      setForm({
        nameAr: parsedName?.ar || '',
        nameEn: parsedName?.en || '',
        price: service.price?.toString() || '',
        duration: service.duration_minutes?.toString() || '',
        isActive: service.is_active === 1 || service.is_active === true
      });
      setPreview(service.image_url);
    }
  }, [service]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // ملاحظة: قد تحتاج لإضافة _method: 'PUT' إذا كان الـ API لا يدعم FormData مع PUT مباشرة
    updateService.mutate({ id: Number(id), data: formData }, {
      onSuccess: () => navigate({ to: '/dashboard/admin/services' })
    });
  };

  // حالة التحميل
  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-[#2D6A4F]" /></div>;

  // حالة عدم وجود الخدمة
  if (!service) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h2 className="text-xl font-bold">عذراً، الخدمة غير موجودة!</h2>
      <Button onClick={() => navigate({ to: '/dashboard/admin/services' })}>العودة للقائمة</Button>
    </div>
  );

  return (
    <div className={`w-full pt-24 px-4 md:px-8 pb-12 max-w-2xl mx-auto ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/dashboard/admin/services' })}>
          <ArrowLeft className="ml-2" /> {lang === 'ar' ? 'عودة للقائمة' : 'Back to list'}
        </Button>
        <Button variant="outline" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
          <Globe className="ml-2 w-4 h-4" /> {lang === 'ar' ? 'English' : 'العربية'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div 
              className="w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="Service Preview" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50"><ImageIcon className="text-slate-400" /></div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
            <div className="text-center sm:text-start">
              <CardTitle className="text-2xl">{lang === 'ar' ? 'تعديل الخدمة' : 'Edit Service'}</CardTitle>
              <p className="text-sm text-slate-500">{lang === 'ar' ? 'اضغط على الصورة لتغييرها' : 'Click image to change'}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-bold">{lang === 'ar' ? 'الاسم (عربي)' : 'Name (AR)'}</label><Input value={form.nameAr} onChange={(e) => setForm({...form, nameAr: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-bold">{lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)'}</label><Input value={form.nameEn} onChange={(e) => setForm({...form, nameEn: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-bold">{lang === 'ar' ? 'السعر' : 'Price'}</label><Input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-bold">{lang === 'ar' ? 'المدة (دقيقة)' : 'Duration (min)'}</label><Input type="number" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} /></div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <label className="text-sm font-bold">{lang === 'ar' ? 'حالة الخدمة (متاحة)' : 'Service Status (Active)'}</label>
              <Switch checked={form.isActive} onCheckedChange={(c) => setForm({...form, isActive: c})} />
            </div>
            <Button type="submit" className="w-full bg-[#2D6A4F] py-6 text-lg hover:bg-[#1f4e38]" disabled={updateService.isPending}>
              {updateService.isPending ? <Loader2 className="animate-spin" /> : (lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}