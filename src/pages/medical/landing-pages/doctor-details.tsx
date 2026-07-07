'use client'

import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  useGetDoctors,
  useGetServices,
  useGetAvailability,
  useCreateAppointment
} from '@/hooks/useQuery'

import {
  Star,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Briefcase,
  Stethoscope,
  Calendar,
} from 'lucide-react'

const parseData = (data: any) => {
  if (typeof data === 'string' && data.startsWith('{')) {
    try { return JSON.parse(data) } catch (e) { return { ar: data, en: data } }
  }
  return data
}

// دالة مساعدة آمنة: بتاخد أي حقل (string / json string / object {ar,en}) وترجع نص صالح للعرض فقط
const getLocalized = (data: any, lang: 'ar' | 'en'): string => {
  const parsed = parseData(data)
  if (parsed && typeof parsed === 'object') {
    return parsed[lang] ?? parsed.en ?? parsed.ar ?? ''
  }
  return parsed ?? ''
}

// const getImageUrl = (path: string | null) => {
//   if (!path) return '/default-service.png'
//   if (path.startsWith('http')) return path
//   return `${import.meta.env.VITE_API_URL || ''}/storage/${path.replace('storage/', '')}`
// }

const getImageUrl = (path: string | null) => {
  if (!path) return '/default-service.png';
  // إذا كان الرابط يبدأ بـ http فهو رابط سحابي (Cloudinary)
  if (path.startsWith('http')) return path;
  
  // إذا كان مساراً محلياً، نقوم ببنائه بشكل آمن
  return `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "")}/storage/${path.replace('storage/', '')}`;
};

const toSlug = (text: any) => {
  const name = parseData(text)
  if (name && typeof name === 'object') {
    return name?.en?.toLowerCase().replace(/\s+/g, '-').replace(/[.]/g, '')
  }
  return typeof name === 'string' ? name.toLowerCase().replace(/\s+/g, '-').replace(/[.]/g, '') : ''
}

export const DoctorDetails = () => {
  // 1. كل الـ Hooks توضع هنا في الأعلى (لا تضعيها أبداً بعد شروط if)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const { slug } = useParams({ strict: false }) as { slug: string }
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'

  const { data: doctors = [], isLoading: doctorLoading } = useGetDoctors()
  const doctor = (doctors as any[])?.find((d: any) => toSlug(d.name) === slug)

  const { data: services = [] } = useGetServices(doctor?.id)
  const { data: schedule, isLoading: scheduleLoading } = useGetAvailability('patient', doctor?.id)
  
  // الـ Hook الخاص بالحجز هنا في الأعلى
  const { mutate: bookAppointment } = useCreateAppointment()

  // 2. الشروط (if) توضع بعد تعريف جميع الـ Hooks
  if (doctorLoading) return <div className="text-center py-20">{t('loading')}...</div>
  if (!doctor) return <div className="text-center py-20">{t('doctor_not_found')}</div>

  // اسم الدكتور: من doctor.name مباشرة
  const doctorName = getLocalized(doctor.name, currentLang)

  // التخصص: doctor.specialty هو object كامل (id, name, slug, image, description...)
  // لازم نستخرج .name منه ونعمله parse مش نعمل parse على الـ object نفسه
  const specialtyName = getLocalized(doctor.specialty?.name, currentLang)

  // نفس المنطق للـ bio لو ممكن يكون object برضو
  const bio = getLocalized(doctor.bio, currentLang)

 const handleSubmit = (e: any) => {
  e.preventDefault();
  
  const dateValue = e.target.date.value;
  const timeValue = e.target.time.value; // تأكدي أن هذا الحقل هو input type="time"
  const serviceId = e.target.service_id.value;

  // تأكدي من إرسال الوقت كما هو (HH:MM) بدون أي إضافات
  bookAppointment(
    {
      doctor_id: doctor.id,
      service_id: serviceId,
      appointment_date: dateValue,
      start_time: timeValue, // أرسليه كما يأتي من المتصفح (مثلاً 14:30)
    }, 
    {
      onSuccess: () => {
        toast.success(t('appointment_booked_successfully'));
        setIsBookingOpen(false);
      },
onError: (error: any) => {
  // 1. محاولة الحصول على الرسالة من عدة أماكن محتملة في رد السيرفر
  const errorData = error.response?.data;
  const serverMessage = errorData?.message || errorData?.error || (typeof errorData === 'string' ? errorData : null);

  // 2. التحقق من الرسالة وعرضها
  if (serverMessage && (serverMessage === 'Appointment already booked' || serverMessage.includes('already booked'))) {
    toast.error(t('this_time_is_already_booked'));
  } else {
    // عرض الرسالة القادمة من السيرفر مباشرة إذا لم تكن هي رسالة الحجز
    toast.error(serverMessage || t('something_went_wrong'));
  }
  
  console.log("Full error details:", errorData);
},
    }
  );
};

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4" dir={i18n.dir()}>
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* معلومات الطبيب */}
        <div className="grid md:grid-cols-3">
          <div className="p-8 flex items-center justify-center">
            <img src={getImageUrl(doctor.image)} alt={doctorName} className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div className="md:col-span-2 p-8">
            <button onClick={() => navigate({ to: '..' })} className="text-[#2D6A4F] mb-6 font-bold flex items-center gap-2">
              {i18n.dir() === 'rtl' ? <ArrowRight /> : <ArrowLeft />} {t('back')}
            </button>
            <h1 className="text-4xl font-black text-[#0E2A2E] mb-2">{doctorName}</h1>
            <p className="text-[#2D6A4F] text-xl font-bold mb-4">{specialtyName}</p>
            <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1 rounded-lg w-fit mb-6">
              <Star size={18} fill="currentColor" /> {Number(doctor.rating || 5).toFixed(1)}
            </div>
            <p className="text-slate-600 leading-relaxed">{bio}</p>
          </div>
        </div>

        {/* قسم الخدمات */}

        <div className="p-8 border-t bg-slate-50/50">
          <h2 className="text-2xl font-black text-[#0E2A2E] mb-8 flex items-center gap-3">
            <div className="p-2 bg-[#2D6A4F]/10 rounded-lg text-[#2D6A4F]">
              <Stethoscope size={24} />
            </div>

            {t('our_services')}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {services?.map((service: any) => {
              const serviceName = getLocalized(service.name, currentLang)

              return (
                <div
                  key={service.id}
                  className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-5"
                >
                  <img
                    src={getImageUrl(service.image_url)}
                    className="w-20 h-20 rounded-2xl object-cover"
                    alt="Service"
                  />

                  <div className="flex-1">
                    <h4 className="font-black text-[#0E2A2E] text-lg">
                      {serviceName}
                    </h4>

                    <p className="text-sm text-slate-500">
                      {service.duration_minutes} {t('min')} | {service.price}{' '}
                      {t('currency')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* قسم المواعيد - المعدل ليعمل بشكل صحيح */}
        <div className="p-8 border-t">
          <h2 className="text-2xl font-black text-[#0E2A2E] mb-8 flex items-center gap-3">
            <div className="p-2 bg-[#2D6A4F]/10 rounded-lg text-[#2D6A4F]">
              <Calendar size={24} />
            </div>
            {t('working_hours')}
          </h2>

          {scheduleLoading ? (
            <p className="text-center text-slate-500">{t('loading')}...</p>
          ) : Array.isArray(schedule) && schedule.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {schedule.map((av: any, index: number) => (
                <div
                  key={av.id || index} // هنا التعديل: إضافة الـ key
                  className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100"
                >
                  <span className="font-bold text-slate-700 capitalize">
                    {/* عرض اسم اليوم */}
                    {typeof av.day_name === 'object' && av.day_name !== null
                      ? getLocalized(av.day_name, currentLang)
                      : av.day_name || t(`days.${av.day_of_week}`)}
                  </span>

                  <span className="text-[#2D6A4F] font-mono bg-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                    {av.start_time?.substring(0, 5)} -{' '}
                    {av.end_time?.substring(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center italic">
              {t('no_availabilities')}
            </p>
          )}
        </div>

        <div className="p-8 bg-slate-50 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border">
            <Briefcase size={20} className="text-[#2D6A4F] mb-2" />
            <p className="text-xs">{t('experience')}</p>
            <p className="font-bold">
              {doctor.years_experience} {t('years')}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border">
            <DollarSign size={20} className="text-[#2D6A4F] mb-2" />
            <p className="text-xs">{t('fees')}</p>
            <p className="font-bold">
              {doctor.price_from} {t('currency')}
            </p>
          </div>

          {/* زر فتح مودال الحجز */}
          <button
            onClick={() => setIsBookingOpen(true)}
            className="bg-[#2D6A4F] text-white font-black rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-[#2D6A4F]/90 transition-colors"
          >
            <Calendar size={20} />
            {t('book_now')}
          </button>
  {isBookingOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-black mb-4">{t('book_now')}</h2>
              
              <input name="date" type="date" className="w-full p-3 border rounded-xl mb-3" required />
              <input name="time" type="time" className="w-full p-3 border rounded-xl mb-3" required />
              
              <select name="service_id" className="w-full p-3 border rounded-xl mb-4" required>
                {services.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {getLocalized(s.name, 'en')}
                  </option>
                ))}
              </select>
              
              <button type="submit" className="bg-[#2D6A4F] text-white w-full py-3 rounded-xl font-bold">
                {t('confirm')}
              </button>
              
              <button 
                type="button" 
                onClick={() => setIsBookingOpen(false)} 
                className="w-full mt-2 text-gray-500 font-bold py-3"
              >
                {t('cancel')}
              </button>
            </form>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}