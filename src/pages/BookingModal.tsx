'use client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCreateAppointment } from '@/hooks/useQuery'
import { X, Languages, Check, AlertCircle } from 'lucide-react'

type BookingStatus = 'idle' | 'success' | 'booked_error' | 'error'

export const BookingModal = ({
  isOpen,
  onClose,
  doctorId,
  services,
  getLocalized,
}: any) => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'
  const { mutate: bookAppointment, isPending } = useCreateAppointment()

  // حالة الحجز المحلية: بديل أضمن للـ toast عشان تبان للمستخدم جوه المودال نفسه
  const [status, setStatus] = useState<BookingStatus>('idle')

  const toggleLanguage = () => {
    const newLang = currentLang === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(newLang)
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    setStatus('idle')

    bookAppointment(
      {
        doctor_id: doctorId,
        service_id: e.target.service_id.value,
        appointment_date: e.target.date.value,
        start_time: e.target.time.value,
      },
      {
        onSuccess: () => {
          setStatus('success')
          toast.success(t('appointment_booked_successfully'))

          // اقفلي المودال بعد ما المستخدم يشوف علامة الصح لثانية ونص
          setTimeout(() => {
            onClose()
            setStatus('idle')
          }, 1500)
        },
        onError: (error: any) => {
          console.log('ERROR CAUGHT:', error)
          const httpStatus = error?.response?.status

          // فقط في حالة الميعاد غير متاح، نظهر التوست ونغير الحالة
          if (httpStatus === 409 || httpStatus === 422) {
            setStatus('booked_error')
            toast.error(t('appointment_not_available'))
          }

          // رجعي الزرار لحالته الطبيعية بعد كام ثانية عشان المستخدم يقدر يجرب تاني
          setTimeout(() => setStatus('idle'), 2500)
        },
      },
    )
  }

  if (!isOpen) return null

  // نص ولون الزرار على حسب الحالة
  const getButtonConfig = () => {
    if (isPending) {
      return {
        text: `${t('loading')}...`,
        className: 'bg-[#2D6A4F]',
        icon: null,
        disabled: true,
      }
    }
    if (status === 'success') {
      return {
        text: t('appointment_booked_successfully'),
        className: 'bg-green-600',
        icon: <Check size={20} />,
        disabled: true,
      }
    }
    if (status === 'booked_error') {
      return {
        text: t('appointment_not_available'),
        className: 'bg-red-500',
        icon: <AlertCircle size={20} />,
        disabled: false,
      }
    }
    if (status === 'error') {
      return {
        text: t('something_went_wrong'),
        className: 'bg-red-500',
        icon: <AlertCircle size={20} />,
        disabled: false,
      }
    }
    return {
      text: t('confirm'),
      className: 'bg-[#2D6A4F] hover:bg-[#1B3A3A]',
      icon: null,
      disabled: false,
    }
  }

  const buttonConfig = getButtonConfig()

  return (
    // تأكدي عدم وجود overflow-hidden في هذا الـ div
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200"
        dir={i18n.dir()}
      >
        {/* زر إغلاق */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* زر تغيير اللغة */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="absolute top-4 left-4 flex items-center gap-1 text-xs font-bold text-[#2D6A4F] hover:bg-green-50 px-2 py-1 rounded-lg transition-all"
        >
          <Languages size={16} />
          {currentLang === 'ar' ? 'English' : 'العربية'}
        </button>

        <h2 className="text-2xl font-black text-[#1B3A3A] mb-8 text-center mt-4">
          {t('book_now')}
        </h2>

        {/* رسالة توضيحية إضافية تظهر تحت العنوان لو فيه خطأ */}
        {status === 'booked_error' && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl p-3 text-center flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            {t('appointment_not_available')}
          </div>
        )}
        {status === 'error' && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl p-3 text-center flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            {t('something_went_wrong')}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* التاريخ */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-600">
              {t('date')}
            </label>
            <input
              name="date"
              type="text"
              placeholder="YYYY-MM-DD"
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => (e.target.type = 'text')}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] outline-none text-left font-mono"
              required
            />
          </div>

          {/* الوقت */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-600">
              {t('time')}
            </label>
            <input
              name="time"
              type="text"
              placeholder="--:--"
              onFocus={(e) => (e.target.type = 'time')}
              onBlur={(e) => (e.target.type = 'text')}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] outline-none text-left font-mono"
              required
            />
          </div>

          {/* اختيار الخدمة مع حل مشكلة القائمة */}
          <div className="flex flex-col gap-1 relative">
            <label className="text-sm font-bold text-gray-600">
              {t('service')}
            </label>
            <select
              name="service_id"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] outline-none bg-white appearance-none"
              required
            >
              {services.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {getLocalized(s.name, currentLang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={buttonConfig.disabled}
          className={`mt-8 text-white w-full py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2 ${buttonConfig.className}`}
        >
          {buttonConfig.icon}
          {buttonConfig.text}
        </button>
      </form>
    </div>
  )
}
