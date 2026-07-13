'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useCreateService, useGetDoctors } from '@/hooks/useQuery'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageIcon, Loader2, Globe } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function AddServicePage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const { register, handleSubmit, control, reset } = useForm()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const createService = useCreateService()
  const { data: doctors = [], isLoading: doctorsLoading } = useGetDoctors()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  const onSubmit = (data: any) => {
    const formData = new FormData()
    const nameData = { ar: data.name_ar, en: data.name_en }
    formData.append('name', JSON.stringify(nameData))
    formData.append('price', data.price)
    formData.append('duration_minutes', data.duration)
    formData.append('doctor_id', data.doctor_id)
    formData.append('is_active', '1')

    if (file) {
      formData.append('image', file)
    }

    createService.mutate(formData, {
      onSuccess: () => {
        toast.success(
          lang === 'ar'
            ? 'تمت إضافة الخدمة بنجاح'
            : 'Service added successfully',
        )
        reset()
        router.navigate({ to: '/dashboard/admin/services' })
      },
      onError: (err: any) => {
        console.error('خطأ الإضافة:', err)
        toast.error(
          lang === 'ar'
            ? 'فشل حفظ الخدمة، تأكد من صحة البيانات.'
            : 'Failed to save service, check data.',
        )
      },
    })
  }

  return (
    <div
      className={`pt-24 px-4 md:px-8 max-w-2xl mx-auto pb-12 w-full ${lang === 'ar' ? 'rtl' : 'ltr'}`}
    >
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        >
          <Globe className="ml-2 w-4 h-4" />{' '}
          {lang === 'ar' ? 'English' : 'العربية'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#0E2A2E]">
            {lang === 'ar'
              ? 'إضافة خدمة طبية جديدة'
              : 'Add New Medical Service'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                {lang === 'ar' ? 'صورة الخدمة' : 'Service Image'}
              </label>
              <div
                className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#2D6A4F] transition-all bg-slate-50"
                onClick={() => document.getElementById('imageInput')?.click()}
              >
                {preview ? (
                  <img
                    src={preview}
                    className="h-full w-full object-cover rounded-lg"
                    alt="Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span className="text-sm">
                      {lang === 'ar'
                        ? 'اضغط لاختيار صورة الخدمة'
                        : 'Click to select image'}
                    </span>
                  </div>
                )}
              </div>
              <input
                id="imageInput"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder={
                  lang === 'ar' ? 'اسم الخدمة (عربي)' : 'Service Name (AR)'
                }
                {...register('name_ar', { required: true })}
              />
              <Input
                placeholder={
                  lang === 'ar' ? 'اسم الخدمة (إنجليزي)' : 'Service Name (EN)'
                }
                {...register('name_en', { required: true })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder={lang === 'ar' ? 'السعر' : 'Price'}
                {...register('price', { required: true })}
              />
              <Input
                type="number"
                placeholder={
                  lang === 'ar' ? 'مدة الجلسة (بالدقائق)' : 'Duration (minutes)'
                }
                {...register('duration', { required: true })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                {lang === 'ar' ? 'اختر الطبيب' : 'Select Doctor'}
              </label>
              <Controller
                name="doctor_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          doctorsLoading
                            ? lang === 'ar'
                              ? 'جاري التحميل...'
                              : 'Loading...'
                            : lang === 'ar'
                              ? 'اختر الطبيب من القائمة'
                              : 'Select Doctor'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-xl">
                      {doctors.map((doc: any) => {
                        // حل مشكلة الـ Object هنا: التأكد أننا نعرض قيمة نصية فقط
                        const nameValue =
                          typeof doc.name === 'string' &&
                          doc.name.startsWith('{')
                            ? JSON.parse(doc.name)[lang] ||
                              JSON.parse(doc.name).ar
                            : doc.name?.ar || doc.name
                        return (
                          <SelectItem key={doc.id} value={doc.id.toString()}>
                            {nameValue}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-[#2D6A4F] hover:bg-[#1B4332] transition-all"
              disabled={createService.isPending}
            >
              {createService.isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />{' '}
                  {lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : lang === 'ar' ? (
                'حفظ الخدمة'
              ) : (
                'Save Service'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <footer className="text-center mt-12 py-6 border-t text-sm text-gray-500">
        Powered by{' '}
        <span className="font-bold text-[#2D6A4F]">Admin Mashit</span>
      </footer>
    </div>
  )
}
