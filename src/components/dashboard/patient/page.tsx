'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetMyAppointments, useCancelAppointment } from '@/hooks/useQuery'
import { toast } from 'sonner'
import {
  Stethoscope,
  Plus,
  Star,
  Home,
  Calendar,
  Clock,
  ShieldAlert,
  X,
} from 'lucide-react'
import { BookingModal } from '@/pages/BookingModal'
import ReviewForm from '@/pages/medical/ReviewForm'
import { Link } from '@tanstack/react-router'

export default function PatientDashboard() {
  const { t, i18n } = useTranslation()
  const { data: appointments, isLoading } = useGetMyAppointments()
  const { mutate: cancelAppointment, isPending: isCancelling } =
    useCancelAppointment()

  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<any>(null)
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean
    doctorId: number
    appointmentId: number
  } | null>(null)

  const handleCancelClick = (app: any) => setAppointmentToCancel(app)

  // أضيفي هذا داخل الكومبوننت
  const [localAppointments, setLocalAppointments] = useState<any[]>([])

  // استخدمي useEffect لتحديث القائمة عند تغير بيانات الـ API
  useEffect(() => {
    if (appointments && Array.isArray(appointments)) {
      setLocalAppointments(appointments)
    }
  }, [appointments])

  const confirmCancel = () => {
    if (!appointmentToCancel) return
    cancelAppointment(appointmentToCancel.id, {
      onSuccess: () => {
        toast.success(t('appointment_cancelled_successfully'))
        setAppointmentToCancel(null)
      },
      onError: () => {
        toast.error(t('something_went_wrong'))
        setAppointmentToCancel(null)
      },
    })
  }

  return (
    <div
      className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-12 animate-in fade-in duration-300"
      dir={i18n.dir()}
    >
      <div className="max-w-5xl mx-auto mt-12 md:mt-8">
        {/* الهيدر العلوي المتجاوب */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link
              to="/"
              className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white transition-all shadow-sm shrink-0"
              title={t('back_to_home')}
            >
              <Home size={20} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#1B3A3A] tracking-tight">
                {t('my_appointments')}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {t('manage_your_bookings')}
              </p>
            </div>
          </div>

          <Link
            to="/services"
            className="flex items-center justify-center gap-2 w-full sm:w-auto border-2 border-[#2D6A4F] text-[#2D6A4F] px-6 py-3 rounded-2xl font-bold hover:bg-[#2D6A4F] hover:text-white transition-all text-sm active:scale-[0.98]"
          >
            <Plus size={18} /> {t('book_new_appointment')}
          </Link>
        </div>

        {/* الحاوية الرئيسية للمواعيد */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400 font-medium flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
              {t('loading')}...
            </div>
          ) : !localAppointments || localAppointments.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              {t('no_appointments')}
            </div>
          ) : (
            <>
              {/* 1. عرض الجدول - مخصص للشاشات الكبيرة والمتوسطة فقط (Desktop & Tablet) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-start table-auto">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-start font-bold">
                        {t('doctor')}
                      </th>
                      <th className="px-6 py-4 text-start font-bold">
                        {t('date')}
                      </th>
                      <th className="px-6 py-4 text-start font-bold">
                        {t('time')}
                      </th>
                      <th className="px-6 py-4 text-start font-bold">
                        {t('status')}
                      </th>
                      <th className="px-6 py-4 text-center font-bold">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {localAppointments.map((app: any) => {
                      const isCompleted = app.status === 'completed'
                      const doctorId = app.doctor_id || app.doctor?.id

                      return (
                        <tr
                          key={app.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-6 py-4 font-bold text-[#1B3A3A]">
                            <div className="flex items-center gap-3">
                              <div className="bg-[#E8F1ED] p-2 rounded-xl text-[#2D6A4F] shrink-0">
                                <Stethoscope size={16} />
                              </div>
                              <span className="truncate max-w-[200px]">
                                {app.doctor?.name?.[i18n.language] || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(app.appointment_date).toLocaleDateString(
                              i18n.language === 'ar' ? 'ar-EG' : 'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              },
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-mono font-medium">
                            {app.start_time}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 ${
                                app.status === 'completed' ||
                                app.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {t(app.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center items-center">
                              {isCompleted ? (
                                <button
                                  onClick={() =>
                                    setReviewModal({
                                      isOpen: true,
                                      doctorId,
                                      appointmentId: app.id,
                                    })
                                  }
                                  className="group flex flex-col items-center gap-0.5 bg-white hover:bg-[#FFD700] text-[#2D6A4F] hover:text-[#1B3A3A] px-4 py-2 rounded-2xl transition-all duration-300 border border-[#FFD700] shadow-sm active:scale-[0.98]"
                                >
                                  <div className="flex items-center gap-1.5 font-bold text-xs">
                                    <Star
                                      size={14}
                                      className="text-yellow-400 fill-yellow-400"
                                    />
                                    {t('rate')}
                                  </div>
                                  <span className="text-[9px] opacity-70 font-medium hidden lg:inline">
                                    {i18n.language === 'ar'
                                      ? 'تقييم الطبيب من هنا'
                                      : 'Rate the doctor here'}
                                  </span>
                                </button>
                              ) : (
                                app.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleCancelClick(app)}
                                    title={
                                      i18n.language === 'ar'
                                        ? 'إلغاء الموعد'
                                        : 'Cancel appointment'
                                    }
                                    className="text-gray-400 hover:text-red-500 transition p-2.5 hover:bg-red-50 rounded-xl active:scale-95"
                                  >
                                    <X size={18} />
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* 2. عرض البطاقات - مخصص للهواتف والشاشات الصغيرة فقط (Mobile List View) */}
              <div className="block md:hidden divide-y divide-gray-100">
                {localAppointments.map((app: any) => {
                  const isCompleted = app.status === 'completed'
                  const doctorId = app.doctor_id || app.doctor?.id

                  return (
                    <div
                      key={app.id}
                      className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* الطبيب والحالة */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#E8F1ED] p-2.5 rounded-xl text-[#2D6A4F] shrink-0">
                            <Stethoscope size={18} />
                          </div>
                          <span className="font-bold text-[#1B3A3A] text-base">
                            {app.doctor?.name?.[i18n.language] || 'N/A'}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 ${
                            app.status === 'completed' ||
                            app.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {t(app.status)}
                        </span>
                      </div>

                      {/* تفاصيل الموعد والوقت */}
                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                            <Calendar size={12} className="text-[#2D6A4F]" />{' '}
                            {t('date')}
                          </span>
                          <span className="text-xs font-bold text-gray-700 block">
                            {new Date(app.appointment_date).toLocaleDateString(
                              i18n.language === 'ar' ? 'ar-EG' : 'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                            <Clock size={12} className="text-[#2D6A4F]" />{' '}
                            {t('time')}
                          </span>
                          <span className="text-xs font-mono font-bold text-gray-700 block">
                            {app.start_time}
                          </span>
                        </div>
                      </div>

                      {/* أزرار التحكم في الموبايل */}
                      <div className="pt-1">
                        {isCompleted ? (
                          <button
                            onClick={() =>
                              setReviewModal({
                                isOpen: true,
                                doctorId,
                                appointmentId: app.id,
                              })
                            }
                            className="w-full flex items-center justify-center gap-2 bg-[#FFD700] hover:bg-[#e6c200] text-[#1B3A3A] py-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-[0.99]"
                          >
                            <Star size={16} className="fill-[#1B3A3A]" />
                            {t('rate')} -{' '}
                            {i18n.language === 'ar'
                              ? 'اضغط لتقييم الطبيب'
                              : 'Click to rate'}
                          </button>
                        ) : (
                          app.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancelClick(app)}
                              className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold text-xs border border-red-100 transition-all active:scale-[0.99]"
                            >
                              <X size={16} />
                              {i18n.language === 'ar'
                                ? 'إلغاء هذا الموعد'
                                : 'Cancel this appointment'}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* مودال التقييم المتجاوب */}
      {reviewModal?.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <ReviewForm
              doctorId={reviewModal.doctorId}
              appointmentId={reviewModal.appointmentId}
              onClose={() => setReviewModal(null)}
            />
          </div>
        </div>
      )}

      {/* مودال إلغاء الموعد المتجاوب */}
      {appointmentToCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-xl font-black text-[#1B3A3A] mb-2">
              {t('confirm_cancel_title')}
            </h2>
            <p className="text-sm text-gray-500">
              {i18n.language === 'ar'
                ? 'هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟ لا يمكن التراجع.'
                : 'Are you sure you want to cancel?'}
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAppointmentToCancel(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t('keep_appointment')}
              </button>
              <button
                onClick={confirmCancel}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors shadow-md shadow-red-100 active:scale-95 disabled:opacity-50"
              >
                {isCancelling ? `${t('loading')}...` : t('yes_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}