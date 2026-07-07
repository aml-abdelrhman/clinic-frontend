'use client'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGetDoctorAppointments,
  useUpdateAppointmentStatus,
  useCompleteAppointment,
} from '@/hooks/useQuery'
import {
  Calendar,
  Clock,
  User,
  Trash2,
  Loader2,
  X,
  CheckCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function DoctorAppointments() {
  const { t, i18n } = useTranslation()
  const { data: appointments, isLoading } = useGetDoctorAppointments()
  const { mutate: updateStatus } = useUpdateAppointmentStatus()
  const { mutate: completeAppointment } = useCompleteAppointment()

  const [localAppointments, setLocalAppointments] = useState<any[]>([])
  const [loadingId, setLoadingId] = useState<number | null>(null)

  useEffect(() => {
    if (appointments) setLocalAppointments(appointments)
  }, [appointments])

  const handleCancel = (id: number) => {
    if (!window.confirm(t('are_you_sure_to_cancel'))) return
    setLoadingId(id)
    updateStatus(
      { id, status: 'cancelled' },
      {
        onSuccess: () => {
          setLocalAppointments((prev) =>
            prev.map((app) =>
              app.id === id ? { ...app, status: 'cancelled' } : app,
            ),
          )
          setLoadingId(null)
        },
        onError: () => {
          alert(t('error_occurred'))
          setLoadingId(null)
        },
      },
    )
  }

  const handleComplete = (id: number) => {
    setLoadingId(id)
    completeAppointment(id, {
      onSuccess: () => {
        setLocalAppointments((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status: 'completed' } : app,
          ),
        )
        setLoadingId(null)
      },
      onError: () => {
        alert(t('error_occurred'))
        setLoadingId(null)
      },
    })
  }

  const handleRemoveFromUI = (id: number) => {
    setLocalAppointments((prev) => prev.filter((app) => app.id !== id))
  }

  // ألوان شارة الحالة — نفس منطق الشرط الأصلي بالظبط، بس دالة عشان نستخدمها في الجدول والكروت مع بعض
  const statusBadgeClass = (status: string) =>
    status === 'completed'
      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
      : status === 'cancelled'
        ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
        : 'bg-teal-50 text-teal-700 ring-1 ring-teal-200'

  return (
    <div
      className="pt-24 px-4 sm:px-6 max-w-6xl mx-auto pb-12"
      dir={i18n.dir()}
    >
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2D6A4F]">
          <Calendar size={22} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A2E]">
            {t('my_patients_appointments')}
          </h1>
          <p className="text-sm text-gray-500">
            {localAppointments.length} {t('appointments') || ''}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-3">
          <Loader2 size={26} className="animate-spin text-[#2D6A4F]" />
          {t('loading')}
        </div>
      ) : localAppointments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">
          {t('no_appointments_found')}
        </div>
      ) : (
        <>
          {/* ===== نسخة الديسكتوب: جدول حقيقي ===== */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F0FAF6] border-b border-emerald-100">
                  <th className="text-start px-6 py-4 font-bold text-[#0E2A2E] uppercase text-xs tracking-wide">
                    {t('patient')}
                  </th>
                  <th className="text-start px-4 py-4 font-bold text-[#0E2A2E] uppercase text-xs tracking-wide">
                    {t('date')}
                  </th>
                  <th className="text-start px-4 py-4 font-bold text-[#0E2A2E] uppercase text-xs tracking-wide">
                    {t('time')}
                  </th>
                  <th className="text-start px-4 py-4 font-bold text-[#0E2A2E] uppercase text-xs tracking-wide">
                    {t('status')}
                  </th>
                  <th className="text-center px-4 py-4 font-bold text-[#0E2A2E] uppercase text-xs tracking-wide">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {localAppointments.map((app: any) => (
                  <tr
                    key={app.id}
                    className={`transition-colors hover:bg-emerald-50/40 ${
                      app.status === 'cancelled'
                        ? 'bg-gray-50/60 opacity-70'
                        : 'bg-white'
                    }`}
                  >
                    {/* المريض */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            app.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <User size={18} />
                        </div>
                        <span className="font-bold text-[#0E2A2E]">
                          {app.patient?.name || t('unknown_patient')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={15} className="text-[#2D6A4F]" />
                        <span className="font-medium">
                          {new Date(app.appointment_date).toLocaleDateString(
                            i18n.language === 'ar' ? 'ar-EG' : 'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </span>
                      </div>
                    </td>

                    {/* الوقت */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-gray-600 font-mono">
                        <Clock size={15} className="text-[#2D6A4F]" />
                        {app.start_time}
                      </div>
                    </td>

                    {/* الحالة */}
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${statusBadgeClass(app.status)}`}
                      >
                        {t(app.status || 'pending')}
                      </span>
                    </td>

                    {/* الأزرار */}
                    <td className="px-4 py-4">
                      <div className="flex justify-center items-center gap-1.5">
                        {app.status !== 'completed' &&
                          app.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleComplete(app.id)}
                                disabled={loadingId === app.id}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50"
                                title={t('complete')}
                              >
                                {loadingId === app.id ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : (
                                  <CheckCircle size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => handleCancel(app.id)}
                                disabled={loadingId === app.id}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                title={t('cancel')}
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}

                        {/* <button
                          onClick={() => handleRemoveFromUI(app.id)}
                          className="p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 rounded-lg transition"
                          title={t('remove')}
                        >
                          <Trash2 size={18} />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== نسخة الموبايل: كروت (الجدول مايتظبطش على الشاشات الصغيرة) ===== */}
          <div className="grid gap-3 md:hidden">
            {localAppointments.map((app: any) => (
              <Card
                key={app.id}
                className={`p-4 border transition-all ${
                  app.status === 'cancelled'
                    ? 'bg-gray-50 opacity-70 border-gray-100'
                    : 'bg-white border-emerald-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        app.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <User size={18} />
                    </div>
                    <span className="font-bold text-[#0E2A2E]">
                      {app.patient?.name || t('unknown_patient')}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${statusBadgeClass(app.status)}`}
                  >
                    {t(app.status || 'pending')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#2D6A4F]" />
                    {app.appointment_date}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock size={14} className="text-[#2D6A4F]" />
                    {app.start_time}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  {app.status !== 'completed' && app.status !== 'cancelled' && (
                    <>
                      <button
                        onClick={() => handleComplete(app.id)}
                        disabled={loadingId === app.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition disabled:opacity-50 text-sm font-bold"
                      >
                        {loadingId === app.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        {t('complete')}
                      </button>
                      <button
                        onClick={() => handleCancel(app.id)}
                        disabled={loadingId === app.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50 text-sm font-bold"
                      >
                        <X size={16} />
                        {t('cancel')}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleRemoveFromUI(app.id)}
                    className="p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 rounded-lg transition"
                    title={t('remove')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
