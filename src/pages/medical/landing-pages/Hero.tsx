'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from '@tanstack/react-router'
import { Phone, Calendar, Search, User, Stethoscope } from 'lucide-react'
import { isRtl } from '@/i18n/config'
import { cn } from '@/lib/utils'
import { useGetDoctors, useGetSpecialties } from '@/hooks/useQuery'

export function Hero() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const rtl = isRtl(i18n.language)
  const [search, setSearch] = useState('')

  const { data: doctors } = useGetDoctors()
  const { data: specialties } = useGetSpecialties()

  const results = useMemo(() => {
    if (!search.trim()) return { doctors: [], specialties: [] }
    const q = search.toLowerCase()
    return {
      doctors:
        doctors
          ?.filter(
            (d: any) =>
              d.name.ar.includes(q) || d.name.en?.toLowerCase().includes(q),
          )
          .slice(0, 3) || [],
      specialties:
        specialties
          ?.filter(
            (s: any) =>
              s.name.ar.includes(q) || s.name.en?.toLowerCase().includes(q),
          )
          .slice(0, 3) || [],
    }
  }, [search, doctors, specialties])

  const getSlug = (name: any) => {
    const nameEn = name?.en || name?.ar || 'doctor' // fallback للاسم بالعربي إذا غاب الإنجليزي
    return nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[.]/g, '')
  }

  return (
    <main dir={rtl ? 'rtl' : 'ltr'} className="bg-[#F7F4EE] font-body">
      <section className="relative w-full h-[600px] md:h-[800px] overflow-visible flex items-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/hero.jpg")',
            backgroundPosition: 'center center',
            transform: rtl ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        />
        <div className="absolute inset-0 bg-black/40 z-0" />

        <div className="relative z-20 container mx-auto px-6 w-full flex items-center">
          <div className={cn('max-w-xl', rtl ? 'text-right' : 'text-left')}>
            <h1 className="text-3xl md:text-6xl font-black text-white leading-tight mb-4">
              {t('hero.title')} <br />{' '}
              <span className="text-[#5FBF8E]">{t('hero.subtitle')}</span>
            </h1>
            <p className="text-sm md:text-lg text-white/90 mb-8 leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="relative w-full">
              <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-row gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('hero.placeholder')}
                  className="flex-1 px-4 py-3 outline-none text-[#0E2A2E] rounded-xl w-full"
                />
                <button className="bg-[#1C5D5E] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#164a4b] transition flex items-center gap-2">
                  <Search size={20} />
                </button>
              </div>

              {search.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-100">
                  {results.doctors.map((d: any) => (
                    <button
                      key={d.id}
                      onClick={() =>
                        navigate({
                          to: '/medical/doctors/$slug',
                          params: { slug: getSlug(d.name) },
                          search: { id: d.id },
                        })
                      }
                      className="w-full p-4 hover:bg-[#f0f9f6] flex items-center gap-3 border-b border-slate-50 transition-colors text-[#0E2A2E]"
                    >
                      {' '}
                      <User size={18} className="text-[#1C5D5E]" />
                      <span className="font-bold">{d.name.ar}</span>
                      <span className="text-xs bg-[#e8efed] px-2 py-1 rounded text-[#1C5D5E]">
                        طبيب
                      </span>
                    </button>
                  ))}
                  {results.specialties.map((s: any) => (
                    <button
                      key={s.id}
                      onClick={() =>
                        navigate({
                          to: '/specialties/$slug',
                          params: { slug: getSlug(s.name) },
                          search: { id: s.id },
                        })
                      }
                      className="w-full p-4 hover:bg-[#f0f9f6] flex items-center gap-3 border-b border-slate-50 transition-colors text-[#0E2A2E]"
                    >
                      {' '}
                      <Stethoscope size={18} className="text-[#1C5D5E]" />
                      <span className="font-bold">{s.name.ar}</span>
                      <span className="text-xs bg-[#e8efed] px-2 py-1 rounded text-[#1C5D5E]">
                        تخصص
                      </span>
                    </button>
                  ))}
                  {results.doctors.length === 0 &&
                    results.specialties.length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-sm">
                        لا توجد نتائج مطابقة
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الكارد السفلي */}
        <div className="absolute -bottom-54 md:-bottom-30 left-1/2 -translate-x-1/2 z-10 w-[90%] md:w-[70%] bg-white rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center gap-4 md:gap-6 border-b-4 border-[#1C5D5E]">
          <div className="w-full md:w-1/3 shrink-0">
            <img
              src="/outside.jpg"
              alt="Clinic"
              className="w-full h-48 md:h-55 object-cover rounded-xl"
            />
          </div>
          <div className="w-full md:w-2/3">
            <h3 className="font-black text-[#0E2A2E] text-lg md:text-xl mb-2">
              {t('clinicCard.title')}
            </h3>
            <p className="text-xs md:text-sm text-slate-600 mb-4 leading-relaxed line-clamp-2 md:line-clamp-3">
              {t('clinicCard.description')}
            </p>
            <div className="flex gap-2">
              {/* زر الحجز بالروتر */}
              <Link
                to="/services"
                className="bg-[#1C5D5E] text-white px-4 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center gap-1 hover:bg-[#164a4b] transition"
              >
                <Calendar size={14} /> {t('clinicCard.book')}
              </Link>

              {/* زر الاتصال */}
              <a
                href="tel:+1234567890"
                className="border border-[#1C5D5E] text-[#1C5D5E] px-4 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center gap-1 hover:bg-[#1C5D5E] hover:text-white transition"
              >
                <Phone size={14} /> {t('clinicCard.call')}
              </a>
            </div>
          </div>
        </div>
      </section>
      <div className="h-44 md:h-24 bg-[#1B3A3A]" />
    </main>
  )
}
