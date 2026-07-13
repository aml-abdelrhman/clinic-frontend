'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, DollarSign, Star, Filter, ChevronDown } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  useGetServicesWithSpecialties,
  useGetSpecialties,
} from '@/hooks/useQuery'
import { getImageUrl } from '@/utils/imageUtils'
import { BookingModal } from '@/pages/BookingModal'
type SortOption = 'default' | 'price-desc' | 'rating-desc'

export function ServicesSection() {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'

  const { data: services = [] } = useGetServicesWithSpecialties()
  const { data: specialties = [] } = useGetSpecialties()

  const [selectedSpecId, setSelectedSpecId] = useState<string>('all')
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('default')

  // State للتحكم في عرض الكل
  const [showAll, setShowAll] = useState(false)

  const filteredAndSortedServices = useMemo(() => {
    let result = services.filter((s: any) => {
      const matchesSpec =
        selectedSpecId === 'all' ||
        s.doctor?.specialty_id?.toString() === selectedSpecId
      const matchesDoctor =
        selectedDoctorId === 'all' ||
        s.doctor?.id?.toString() === selectedDoctorId
      return matchesSpec && matchesDoctor
    })

    if (sortBy === 'price-desc')
      result.sort((a: any, b: any) => b.price - a.price)
    if (sortBy === 'rating-desc')
      result.sort(
        (a: any, b: any) => (b.doctor?.rating || 0) - (a.doctor?.rating || 0),
      )

    return result
  }, [services, selectedSpecId, selectedDoctorId, sortBy])

  // منطق العرض (6 خدمات فقط أو الكل)
  const displayedServices = showAll
    ? filteredAndSortedServices
    : filteredAndSortedServices.slice(0, 6)

  const uniqueDoctors = useMemo(() => {
    const docs = services.map((s: any) => s.doctor).filter(Boolean)
    return Array.from(new Map(docs.map((d: any) => [d.id, d])).values())
  }, [services])

  // في بداية المكون ServicesSection
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)

  // دالة لفتح المودال مع تخزين الخدمة المختارة
  const openBookingModal = (service: any) => {
    setSelectedService(service)
    setIsBookingOpen(true)
  }
  return (
    <div className="bg-[#1B3A3A] pt-24 pb-20">
      <section className="container mx-auto px-6">
        <h2 className="text-4xl font-black text-white mb-12 text-center">
          {t('services.title')}
        </h2>

        {/* شريط الفلاتر */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-16 bg-white/5 p-2 rounded-full border border-white/10 backdrop-blur-md mx-auto max-w-fit">
          <div className="flex items-center gap-2 pl-2 pr-4 text-white/70">
            <Filter size={16} />
            <span className="text-xs font-bold hidden sm:block">
              {t('filter_by')}:
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <div className="relative">
              <select
                className="appearance-none bg-white text-[#1B3A3A] px-4 py-1.5 rounded-full font-bold text-xs cursor-pointer pr-8 hover:bg-gray-100 transition-colors"
                onChange={(e) => setSelectedSpecId(e.target.value)}
              >
                <option value="all">{t('specialty')}</option>
                {specialties.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name[currentLang]}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#1B3A3A] pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-white text-[#1B3A3A] px-4 py-1.5 rounded-full font-bold text-xs cursor-pointer pr-8 hover:bg-gray-100 transition-colors"
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                <option value="all">{t('doctor')}</option>
                {uniqueDoctors.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name[currentLang]}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#1B3A3A] pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-white text-[#1B3A3A] px-4 py-1.5 rounded-full font-bold text-xs cursor-pointer pr-8 hover:bg-gray-100 transition-colors"
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="default">{t('sort_by')}</option>
                <option value="price-desc">{t('price_high_to_low')}</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#1B3A3A] pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedServices.map((service: any) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col border border-slate-100"
            >
              {/* الرابط للصورة والتفاصيل */}
              <Link
                to="/services/$id"
                params={{ id: service.id.toString() }}
                className="block flex-1"
              >
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#e8efed]">
                  <img
                    src={getImageUrl(service.image_url, 'service')}
                    alt={service.name[currentLang]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-[#1B3A3A] mb-1 truncate">
                    {service.name[currentLang]}
                  </h3>
                  <p className="text-sm text-[#4A6767] mb-4 font-medium italic">
                    {service.doctor?.name[currentLang]}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[#4A6767]">
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} /> {service.duration_minutes} {t('min')}
                    </div>
                    <span className="text-base font-extrabold text-[#0E2A2E]">
                      {service.price}{' '}
                      <span className="text-xs font-medium text-[#5C7873]">
                        {currentLang === 'ar' ? 'ج.م' : 'EGP'}
                      </span>
                    </span>
                  </div>
                </div>
              </Link>

              {/* زر الحجز (مدمج مباشرة في الكارت بدون div خلفية إضافي) */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => openBookingModal(service)}
                  className="w-full py-3 bg-[#1B3A3A] text-white rounded-xl font-bold hover:bg-[#2D6A4F] active:scale-[0.98] transition-all shadow-md"
                >
                  {t('book_now')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* زر عرض الكل */}
        {filteredAndSortedServices.length > 6 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 bg-white text-[#1B3A3A] font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg"
            >
              {showAll ? t('show_less') : t('show_all')}
            </button>
          </div>
        )}
      </section>
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctorId={selectedService?.doctor?.id}
        // ملاحظة: قد تحتاجين لتمرير خدمات الطبيب كاملة للمودال إذا كنتِ ستعرضين القائمة فيه
        services={[selectedService]}
        getLocalized={(data: any, lang: any) => data?.[lang] || data}
      />
    </div>
  )
}
