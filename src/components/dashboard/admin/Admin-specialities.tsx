'use client'

import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import {
  useGetSpecialties,
  useAddSpecialty,
  useDeleteSpecialty,
  useUpdateSpecialty,
} from '@/hooks/useQuery'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Trash2,
  Edit2,
  Loader2,
  Stethoscope,
  Image as ImageIcon,
} from 'lucide-react'
import type { Specialty } from '@/hooks/useQuery'
import { toast } from 'sonner'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const STORAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '')

// const getImageUrl = (image?: string | null) => {
//   if (!image) return "/default-specialty.png"; // صورة افتراضية لو مفيش صورة أصلاً
//   if (image.startsWith("http://") || image.startsWith("https://")) return image;
//   return `${STORAGE_BASE_URL}/storage/${image}`;
// };

const getImageUrl = (image?: string | null) => {
  console.log('Image value coming from API:', image) // أضيفي هذا السطر

  if (!image || image === 'null' || image === 'undefined')
    return '/default-specialty.png'

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  return `${STORAGE_BASE_URL}/storage/${image}`
}

export default function AdminSpecialtiesDashboard() {
  const { t } = useTranslation()
  const formRef = useRef<HTMLDivElement>(null)

  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [slug, setSlug] = useState('')
  const [descAr, setDescAr] = useState('')
  const [descEn, setDescEn] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data: specialties } = useGetSpecialties()
  const { mutate: addSpecialty, isPending: isAdding } = useAddSpecialty()
  const { mutate: deleteSpecialty } = useDeleteSpecialty()
  const { mutate: updateSpecialty, isPending: isUpdating } =
    useUpdateSpecialty()

  const handleSave = () => {
    // 1. التحقق من الحقول الأساسية
    if (!nameAr || !nameEn || !slug || !descAr || !descEn) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const formData = new FormData()
    formData.append('name[ar]', nameAr)
    formData.append('name[en]', nameEn)
    formData.append('slug', slug)
    formData.append('description[ar]', descAr)
    formData.append('description[en]', descEn)

    // إذا كنتِ تستخدمين التحديث، فكي تعليق السطر التالي
    // if (editingId) {
    //     formData.append("_method", "PUT");
    // }

    if (image instanceof File) {
      formData.append('image', image)
    }

    // --- طباعة تفاصيل الطلب للـ Debugging ---
    console.log('--- 🚀 جاري إرسال الطلب (Payload) ---')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    const options = {
      onSuccess: () => {
        console.log('✅ تمت العملية بنجاح')
        clearForm()
        setEditingId(null)
      },
      onError: (error: any) => {
        console.group('❌ فشل الطلب - تفاصيل الخطأ')
        if (error.response) {
          // الخطأ من السيرفر (مثل 422 أو 500)
          console.error('Status:', error.response.status)
          console.error('Data (سبب الخطأ من لارافيل):', error.response.data)
        } else if (error.request) {
          // الطلب لم يصل للسيرفر (Network Error)
          console.error(
            'لم يتم استلام رد من السيرفر (تأكدي من تشغيل php artisan serve)',
          )
        } else {
          console.error('خطأ عام:', error.message)
        }
        console.groupEnd()
      },
    }

    // 5. الإرسال
    if (editingId) {
      console.log('Sending UPDATE request for ID:', editingId)
      updateSpecialty(
        { id: editingId, formData },
        {
          onSuccess: () => {
            console.log('Update successful')
            setEditingId(null)
            clearForm()
          },
          onError: (err) => {
            console.error('Update failed:', err)
          },
        },
      )
    } else {
      console.log('Sending ADD request')
      addSpecialty(formData, {
        onSuccess: () => {
          console.log('Add successful')
          clearForm()
        },
        onError: (err) => {
          console.error('Add failed:', err)
        },
      })
    }
  }
  const clearForm = () => {
    setNameAr('')
    setNameEn('')
    setSlug('')
    setDescAr('')
    setDescEn('')
    setImage(null)
  }

  const startEdit = (s: Specialty) => {
    setEditingId(s.id)
    setNameAr(s.name.ar)
    setNameEn(s.name.en)

    setSlug(s.slug)
    setDescAr(s.description.ar)
    setDescEn(s.description.en)
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const confirmDelete = async (id: number) => {
    // 1. تنبيه التأكيد الأول
    const isConfirmed = window.confirm(t('confirm_delete'))
    if (!isConfirmed) return

    // 2. محاولة الحذف
    try {
      await new Promise((resolve, reject) => {
        deleteSpecialty(
          { id },
          {
            onSuccess: resolve,
            onError: reject,
          },
        )
      })
      // في حال نجح الحذف لا نحتاج لفعل شيء (الـ hook يقوم بـ toast)
    } catch (error: any) {
      // 3. إذا كان هناك أطباء مرتبطون (كود 409)
      if (error.response?.status === 409) {
        const forceDelete = window.confirm(
          'تنبيه: هذا التخصص مرتبط بأطباء! قم بحذف جميع الأطباء التابعين له أولا.',
        )

        if (forceDelete) {
          // تنفيذ الحذف الإجباري (تأكدي من تمرير الـ force للـ hook)
          deleteSpecialty(
            { id, force: true },
            {
              onSuccess: () => toast.success('تم حذف التخصص والأطباء بنجاح'),
              onError: () => toast.error('فشل الحذف الإجباري'),
            },
          )
        }
      } else {
        toast.error('حدث خطأ أثناء الحذف')
      }
    }
  }

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <div className="pt-24 px-4 sm:px-6 pb-8 w-full max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
        <h1 className="text-2xl sm:text-4xl font-black text-[#0E2A2E] flex items-center gap-3">
          <Stethoscope className="text-[#2D6A4F]" size={32} />{' '}
          {t('admin.manage_specialties')}
        </h1>

        <div ref={formRef}>
          <Card className="rounded-2xl border-t-4 border-t-[#2D6A4F] shadow-lg">
            <CardHeader>
              <CardTitle>
                {editingId ? t('admin.edit') : t('admin.add')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Section */}
              <div className="space-y-2">
                <label className="font-bold text-sm text-[#2D6A4F]">
                  {t('admin.name_label')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder={t('admin.name_ar')}
                  />
                  <Input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder={t('admin.name_en')}
                  />
                </div>
              </div>

              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={t('admin.slug')}
              />

              {/* Description Section with Clear Borders */}
              <div className="space-y-2">
                <label className="font-bold text-sm text-[#2D6A4F]">
                  {t('admin.desc_label')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Textarea
                    className="border-2 border-slate-300 focus:border-[#2D6A4F] focus:ring-[#2D6A4F] rounded-lg min-h-[120px]"
                    value={descAr}
                    onChange={(e) => setDescAr(e.target.value)}
                    placeholder={t('admin.desc_ar')}
                  />
                  <Textarea
                    className="border-2 border-slate-300 focus:border-[#2D6A4F] focus:ring-[#2D6A4F] rounded-lg min-h-[120px]"
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    placeholder={t('admin.desc_en')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm text-[#2D6A4F] flex items-center gap-2">
                  <ImageIcon size={16} />
                  {t('admin.image_label')}
                </label>

                {/* زر مخصص للترجمة */}
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById('file-upload')?.click()
                    }
                  >
                    {t('admin.choose_file')}
                  </Button>
                  <span className="text-sm text-gray-500">
                    {image
                      ? t('admin.file_selected')
                      : t('admin.no_file_chosen')}
                  </span>
                </div>

                {/* الـ input المخفي */}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={isAdding || isUpdating}
                className="w-full bg-[#2D6A4F] py-6 text-lg rounded-xl"
              >
                {isAdding || isUpdating ? (
                  <Loader2 className="animate-spin" />
                ) : editingId ? (
                  t('admin.update')
                ) : (
                  t('admin.save')
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-right hidden md:table">
            <thead className="bg-slate-100 text-[#2D6A4F]">
              <tr>
                <th className="px-6 py-4">{t('admin.image')}</th>
                <th className="px-6 py-4">{t('admin.specialty')}</th>
                <th className="px-6 py-4 text-center">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {specialties?.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <img
                      src={getImageUrl(s.image)}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {s.name.ar} / {s.name.en}
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(s)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-500"
                      onClick={() => confirmDelete(s.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="md:hidden p-4 space-y-3">
            {specialties?.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getImageUrl(s.image)}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <div className="font-bold">{s.name.ar}</div>
                    <div className="text-xs text-gray-500">{s.name.en}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(s)}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-500"
                    onClick={() => confirmDelete(s.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
