'use client'

import React from 'react'
import { useParams, useNavigate, notFound } from '@tanstack/react-router'
import {
  useGetSpecialty,
  useGetDoctors,
  useGetServicesWithSpecialties,
} from '@/hooks/useQuery'
import {
  Loader2,
  Stethoscope,
  Users,
  ArrowRight,
  Briefcase,
  DollarSign,
  Clock,
  ChevronLeft,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getImageUrl } from '@/utils/imageUtils' // تأكدي من المسار الصحيح

export default function SpecialtyPage() {
  const { slug } = useParams({ from: '/specialties/$slug' })
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'

  const {
    data: specialty,
    isLoading: loadingSpec,
    isError,
  } = useGetSpecialty(slug)
  const { data: allDoctors, isLoading: loadingDocs } = useGetDoctors()
  const { data: allServices = [] } = useGetServicesWithSpecialties()

  if (loadingSpec || loadingDocs)
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Loader2 className="animate-spin text-[#2D6A4F]" size={48} />
        <p className="text-slate-400 font-medium">{t('loading')}...</p>
      </div>
    )

  if (isError || !specialty) throw notFound()

  const specialtyDoctors = allDoctors?.filter(
    (doc: any) => doc.specialty?.id === specialty.id,
  )
  const specialtyServices = allServices?.filter(
    (serv: any) => serv.doctor?.specialty_id === specialty.id,
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20" dir={i18n.dir()}>
      {/* 1. هيدر التخصص (صورة خلفية احترافية) */}
      <header
        className="relative h-[450px] flex items-center overflow-hidden shadow-2xl"
        style={{
          // backgroundImage: `url(${specialty.image ? `${baseUrl}/storage/${specialty.image}` : '/default-specialty-bg.jpg'})`,
          backgroundImage: `url(${getImageUrl(specialty.image) || '/default-specialty-bg.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E2A2E]/90 to-[#0E2A2E]/40" />
        <div className="max-w-6xl mx-auto px-6 relative z-10 w-full text-white">
          <button
            onClick={() => navigate({ to: '/specialties' })}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-all"
          >
            <ArrowRight size={18} /> {t('back_to_specialties')}
          </button>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            {String(specialty.name?.[currentLang] || '')}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
            {String(specialty.description?.[currentLang] || '')}
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 2. قسم الخدمات (صور عريضة) */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2 drop-shadow-md">
              <Briefcase className="text-white" />
              {t('specialty_services')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {specialtyServices.map((service: any) => (
                <div
                  key={service.id}
                  onClick={() =>
                    navigate({
                      to: '/services/$id',
                      params: { id: service.id.toString() },
                    })
                  }
                  className="group bg-white rounded-3xl p-3 border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  <div className="w-full h-80 rounded-3xl overflow-hidden mb-6 shadow-inner">
                    {' '}
                    <img
                      // src={service.image_url || '/default-service.png'}
                      src={
                        getImageUrl(service.image_url) || '/default-service.png'
                      }
                      alt={String(service.name?.[currentLang] || '')}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="px-3 pb-3">
                    <h3 className="font-bold text-lg mb-2 text-[#0E2A2E]">
                      {String(service.name?.[currentLang] || '')}
                    </h3>
                    <div className="flex gap-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={16} /> {service.duration_minutes}{' '}
                        {t('min')}
                      </span>
                      <span className="flex items-center gap-1 text-[#2D6A4F]">
                        <DollarSign size={16} /> {service.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. قسم الأطباء (صور دائرية أنيقة) */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2 drop-shadow-md">
              <Users className="text-white" /> {t('specialty_doctors')}
            </h2>

            {/* تحديث في قسم الأطباء */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl space-y-4">
              {specialtyDoctors?.map((doctor: any) => (
                <div
                  key={doctor.id}
                  onClick={() => {
                    const slug = doctor.name.en
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[.]/g, '')
                    navigate({
                      to: '/medical/doctors/$slug',
                      params: { slug },
                      search: { id: doctor.id },
                    })
                  }}
                >
                  {/* تكبير الصورة وإضافة إطار */}
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0">
                    <img
                      // src={doctor.image || '/default-avatar.png'}
                      src={getImageUrl(doctor.image) || '/default-avatar.png'}
                      alt={String(doctor.name?.[currentLang] || '')}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-[#0E2A2E] text-lg">
                      {String(doctor.name?.[currentLang] || '')}
                    </h3>
                    <p className="text-xs text-[#2D6A4F] font-bold bg-[#E8F3EF] px-3 py-1 rounded-full inline-block mt-1">
                      {t('consultant')}
                    </p>
                  </div>
                  <ChevronLeft
                    size={24}
                    className="text-slate-400 group-hover:text-[#2D6A4F] transition-colors"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
