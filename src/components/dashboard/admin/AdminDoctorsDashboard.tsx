'use client'
import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import {
  useGetDoctors,
  useAddDoctor,
  useUpdateDoctor,
  useDeleteDoctor,
  useGetSpecialties,
  useGetDoctorAvailabilityAdmin,
  useAdminDeleteAvailability,
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
  CalendarClock,
} from 'lucide-react'
import type { Doctor } from '@/hooks/useQuery'
import { Link } from '@tanstack/react-router'
export default function AdminDoctorsDashboard() {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'
  const formRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const [filterSpecialty, setFilterSpecialty] = useState<string>('all')

  const parseSafe = (data: any) => {
    try {
      if (typeof data === 'string') return JSON.parse(data)
      return data || {}
    } catch {
      return {}
    }
  }

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    specialty_id: '',
    bio_ar: '',
    bio_en: '',
    years_experience: '',
    price_from: '',
    languages: '',
    rating: '5',
  })

  const [image, setImage] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data: doctors } = useGetDoctors()
  const { data: specialties } = useGetSpecialties()

  const { mutate: addDoctor, isPending: isAdding } = useAddDoctor()
  const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctor()
  const { mutate: deleteDoctor } = useDeleteDoctor()

  const [expandedDoctorId, setExpandedDoctorId] = useState<number | null>(null)

  // نحتاج لجلب المواعيد لكل طبيب (أو جلبها عند الطلب)
  // يفضل عمل Hook يقوم بجلب مواعيد طبيب معين
  const { data: schedule } = useGetDoctorAvailabilityAdmin(
    expandedDoctorId as any,
  )
  const { mutate: deleteAvailability } = useAdminDeleteAvailability()

  const toggleExpand = (id: number) => {
    setExpandedDoctorId(expandedDoctorId === id ? null : id)
  }
  const refreshData = () =>
    queryClient.invalidateQueries({ queryKey: ['doctors'] })

  const startEdit = (doc: Doctor) => {
    const name = parseSafe(doc.name)
    const bio = parseSafe(doc.bio)
    setEditingId(doc.id)
    setFormData({
      name_ar: name.ar || '',
      name_en: name.en || '',
      specialty_id: doc.specialty_id?.toString() || '',
      bio_ar: bio.ar || '',
      bio_en: bio.en || '',
      years_experience: doc.years_experience?.toString() || '',
      price_from: doc.price_from?.toString() || '',
      languages: Array.isArray(doc.languages) ? doc.languages.join(',') : '',
      rating: doc.rating?.toString() || '5',
    })
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSave = () => {
    if (!formData.specialty_id || !formData.price_from) {
      alert(t('admin.fields_required'))
      return
    }

    const data = new FormData()
    data.append(
      'name',
      JSON.stringify({ ar: formData.name_ar, en: formData.name_en }),
    )
    data.append(
      'bio',
      JSON.stringify({ ar: formData.bio_ar, en: formData.bio_en }),
    )
    data.append('specialty_id', formData.specialty_id.toString())
    data.append('price_from', formData.price_from.toString())
    data.append('years_experience', formData.years_experience || '0')
    data.append('rating', formData.rating || '5')

    const langs = formData.languages
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l !== '')
    data.append('languages', JSON.stringify(langs))
    if (image) data.append('image', image)

    // --- كود التشخيص ---
    const config = {
      onSuccess: () => {
        refreshData()
        setEditingId(null)
        setImage(null)
        alert('تمت العملية بنجاح')
      },
      onError: (error: any) => {
        console.group('🚨 تقرير خطأ الباكيند (Backend Diagnostic)')
        console.log(
          '🔗 الرابط المستهدف:',
          editingId ? `/admin/doctors/${editingId}` : '/admin/doctors',
        )
        console.log('📝 تفاصيل الطلب (FormData):')
        for (let [key, value] of (data as any).entries()) {
          console.log(key, value)
        }

        if (error.response) {
          console.error('❌ كود الخطأ:', error.response.status)
          console.error(
            '📋 رسالة الخطأ:',
            error.response.data.message || error.response.data,
          )
          // هذا يظهر مكان الخطأ في ملفات لارافيل إذا كان APP_DEBUG=true
          if (error.response.data.exception) {
            console.error('📂 الملف:', error.response.data.file)
            console.error('🔢 السطر:', error.response.data.line)
          }
        } else {
          console.error('⚠️ خطأ في الاتصال:', error.message)
        }
        console.groupEnd()
        alert('حدث خطأ! افتحي الكونسول (F12) لمشاهدة التفاصيل.')
      },
    }

    editingId
      ? updateDoctor({ id: editingId, formData: data }, config)
      : addDoctor(data, config)
  }
  const confirmDelete = (id: number) => {
    if (window.confirm(t('admin.confirm_delete'))) {
      deleteDoctor(id, { onSuccess: refreshData })
    }
  }

  const filteredDoctors = doctors?.filter((doc) =>
    filterSpecialty === 'all'
      ? true
      : doc.specialty_id?.toString() === filterSpecialty,
  )

  const getImageUrl = (image?: string | null) => {
    if (!image) return '/default-doctor.png'
    if (image.startsWith('http://') || image.startsWith('https://'))
      return image
    // هذا المسار للصور القديمة المخزنة محلياً في لارافيل
    return `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')}/storage/${image}`
  }

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <div className="pt-24 px-2 sm:px-6 pb-8 w-full max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 mb-6">
          {/* العنوان */}
          <h1 className="text-2xl sm:text-4xl font-black text-[#0E2A2E] flex items-center gap-3">
            <Stethoscope className="text-[#2D6A4F]" size={32} />
            {t('admin.manage_doctors')}
          </h1>
        </div>{' '}
        <div ref={formRef}>
          <Card className="border-t-4 border-t-[#2D6A4F] rounded-2xl shadow-lg w-full">
            <CardHeader>
              <CardTitle>
                {editingId ? t('admin.edit_doctor') : t('admin.add_doctor')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder={t('admin.name_ar')}
                  value={formData.name_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, name_ar: e.target.value })
                  }
                />
                <Input
                  placeholder={t('admin.name_en')}
                  value={formData.name_en}
                  onChange={(e) =>
                    setFormData({ ...formData, name_en: e.target.value })
                  }
                />
              </div>

              <select
                className="w-full p-2.5 border rounded-lg bg-white"
                value={formData.specialty_id}
                onChange={(e) =>
                  setFormData({ ...formData, specialty_id: e.target.value })
                }
              >
                <option value="">{t('admin.select_specialty')}</option>
                {specialties?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {parseSafe(s.name)[currentLang]}
                  </option>
                ))}
              </select>
              {/* Bio Section with Proper Spacing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* حقل اللغة العربية */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#2D6A4F] mb-1">
                    {t('admin.bio_ar_label')}
                  </label>
                  <Textarea
                    className="border-2 border-slate-300 focus:border-[#2D6A4F] focus:ring-[#2D6A4F] rounded-lg min-h-[120px] w-full"
                    placeholder={t('admin.bio_ar')}
                    value={formData.bio_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, bio_ar: e.target.value })
                    }
                  />
                </div>

                {/* حقل اللغة الإنجليزية */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#2D6A4F] mb-1">
                    {t('admin.bio_en_label')}
                  </label>
                  <Textarea
                    className="border-2 border-slate-300 focus:border-[#2D6A4F] focus:ring-[#2D6A4F] rounded-lg min-h-[120px] w-full"
                    placeholder={t('admin.bio_en')}
                    value={formData.bio_en}
                    onChange={(e) =>
                      setFormData({ ...formData, bio_en: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder={t('admin.experience')}
                  value={formData.years_experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      years_experience: e.target.value,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder={t('admin.price')}
                  value={formData.price_from}
                  onChange={(e) =>
                    setFormData({ ...formData, price_from: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('admin.upload_image')}
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById('doctor-image-input')?.click()
                  }
                >
                  {image ? t('admin.file_selected') : t('admin.choose_file')}
                </Button>
                <input
                  id="doctor-image-input"
                  type="file"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </div>

              <Button
                onClick={handleSave}
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
        <div className="bg-white rounded-2xl shadow-sm p-4 w-full flex items-center gap-3">
          <label className="text-sm font-bold text-[#2D6A4F] whitespace-nowrap">
            {t('filter_by_specialty') || 'فلترة حسب التخصص'}
          </label>
          <select
            className="p-2.5 border rounded-lg bg-white min-w-[200px]"
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
          >
            <option value="all">{t('all_specialties') || 'كل التخصصات'}</option>
            {specialties?.map((s) => (
              <option key={s.id} value={s.id.toString()}>
                {parseSafe(s.name)[currentLang]}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden w-full">
          <table className="w-full text-right hidden md:table">
            <thead className="bg-slate-100 text-[#2D6A4F]">
              <tr>
                <th className="px-4 py-3">{t('admin.image')}</th>
                <th className="px-4 py-3">{t('admin.doctor')}</th>
                <th className="px-4 py-3">{t('admin.specialty')}</th>{' '}
                <th className="px-4 py-3">{t('admin.bio')}</th>
                <th className="px-4 py-3 text-center">{t('admin.actions')}</th>
                <th className="px-4 py-3 text-center">إدارة المواعيد</th>{' '}
              </tr>
            </thead>
            <tbody>
              {filteredDoctors?.map((doc) => (
                <tr key={doc.id} className="border-t">
                  <td className="px-4 py-2">
                    <img
                      src={getImageUrl(doc.image)}
                      alt={parseSafe(doc.name)[currentLang]}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-4 py-2 font-bold">
                    {parseSafe(doc.name)[currentLang]}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {parseSafe(doc.specialty?.name)[currentLang] ||
                      t('admin.not_specified')}
                  </td>
                  <td className="px-4 py-2 max-w-[300px] truncate">
                    {parseSafe(doc.bio)[currentLang]}
                  </td>
                  <td className="px-4 py-2 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(doc)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => confirmDelete(doc.id)}
                    >
                      <Trash2 size={16} className="text-rose-500" />
                    </Button>
                  </td>

                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* زر الانتقال للمواعيد */}
                      <Link
                        to="/dashboard/admin/work-schedule/$doctorId"
                        params={{ doctorId: String(doc.id) }}
                        className="flex items-center gap-1 text-white bg-[#2D6A4F] hover:bg-[#235840] px-3 py-1.5 rounded-md text-sm transition-colors"
                      >
                        <CalendarClock size={16} />
                        {t('admin.schedule')}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedLayout>
  )
}
