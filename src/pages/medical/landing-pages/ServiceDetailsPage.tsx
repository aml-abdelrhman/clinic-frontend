'use client'

import { useState, useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Clock,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  User,
  Stethoscope,
  Sparkles,
} from 'lucide-react'
import { useGetServicesWithSpecialties } from '@/hooks/useQuery'
import { BookingModal } from '@/pages/BookingModal'

export const ServiceDetailsPage = () => {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'
  const isRtl = i18n.dir() === 'rtl'

  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const { data: services = [], isLoading } = useGetServicesWithSpecialties()

  const service = useMemo(
    () => services.find((s: any) => s.id.toString() === id),
    [services, id],
  )

  if (isLoading)
    return (
      <div className="flex justify-center py-20 text-emerald-700 font-bold">
        Loading...
      </div>
    )
  if (!service)
    return (
      <div className="text-center py-20 text-gray-500">Service not found</div>
    )

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] py-22 px-4 md:px-8"
      dir={i18n.dir()}
    >
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate({ to: '..' })}
          className="mb-8 flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-medium transition-all group"
        >
          {isRtl ? (
            <ArrowRight className="group-hover:-translate-x-1 transition-transform" />
          ) : (
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          )}
          {t('back_to_services')}
        </button>

        <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Image Section */}
          <div className="md:col-span-5">
            <div className="sticky top-24">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white bg-white p-2">
                {/* <img 
                  src={service.image_url} 
                  alt={service.name[currentLang]} 
                  className="w-full h-[450px] object-cover rounded-[2rem]"
                /> */}

                <img
                  src={
                    service.image_url
                      ? service.image_url.startsWith('http')
                        ? service.image_url
                        : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '')}/storage/${service.image_url.replace('storage/', '')}`
                      : '/default-service.png'
                  }
                  alt={service.name[currentLang]}
                  className="w-full h-[450px] object-cover rounded-[2rem]"
                />
                <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-emerald-900 font-bold flex items-center gap-2 shadow-sm text-sm">
                  <Sparkles size={16} />{' '}
                  {service.specialty_name?.[currentLang] ||
                    service.specialty_name}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content Section */}
          <div className="md:col-span-7 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-[#0E2A2E] leading-[1.1]">
                {service.name[currentLang]}
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed">
                {t('professional_service_description', {
                  defaultValue:
                    'Experience premium medical care tailored to your needs by our expert medical team.',
                })}
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">
                    {t('doctor')}
                  </p>
                  <p className="font-bold text-slate-800">
                    {service.doctor?.name[currentLang]}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">
                    {t('duration')}
                  </p>
                  <p className="font-bold text-slate-800">
                    {service.duration_minutes} {t('min')}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing & CTA */}
            <div className="bg-[#0E2A2E] rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-emerald-400 font-bold uppercase text-sm mb-1">
                  {t('price_label')}
                </p>
                <div className="text-4xl font-black">
                  {service.price}{' '}
                  <span className="text-lg font-medium text-slate-400">
                    {t('currency')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsBookingOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
              >
                {t('book_now')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctorId={service.doctor?.id}
        services={[service]}
        getLocalized={(data: any, lang: any) => data?.[lang] || data}
      />
    </div>
  )
}
