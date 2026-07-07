'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

import {
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Filter,
  Search,
  Heart,
} from 'lucide-react'

import { toast } from 'sonner'

import {
  useGetDoctors,
  useGetSpecialties,
  useToggleFavorite,
  useGetFavorites,
} from '@/hooks/useQuery'

import { useAuthStore, selectUser } from '@/stores/useAuthStore'
import { useFavoriteStore } from '@/stores/favoriteStore'

export const DoctorsList = () => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'
  const navigate = useNavigate()
  const dir = i18n.dir()

  const user = useAuthStore(selectUser)
  const { favoriteIds, toggleFavorite, setFavorites } = useFavoriteStore()

  const { mutate: toggleFavApi } = useToggleFavorite()
  const { data: doctors = [], isLoading } = useGetDoctors()
  const { data: specialties = [] } = useGetSpecialties()
  const { data: apiFavorites = [] } = useGetFavorites()

  // مزامنة مفضلة الزائر (المخزّنة محليًا قبل تسجيل الدخول) مع الباك إند - مرة واحدة فعليًا لكل مستخدم
  // العلَم هنا لازم يكون في localStorage مش useRef، لأن useRef بيرجع false تاني مع أي remount
  // للكومبوننت، وده كان بيخلي نفس الدكاترة يتـ toggle تاني (يعني يتحذفوا لأنهم كانوا مضافين بالفعل)
  useEffect(() => {
    if (!user?.id || favoriteIds.length === 0) return

    const syncKey = `favorites_synced_${user.id}`
    if (localStorage.getItem(syncKey) === 'true') return

    // نستبعد أي id متزامن بالفعل مع الباك إند، عشان الـ toggle ماتشيلوش حاجة موجودة أصلاً
    const alreadySyncedIds = new Set(
      apiFavorites.map((f: any) => f.doctor_id ?? f.doctor?.id),
    )
    const idsToSync = favoriteIds.filter((id) => !alreadySyncedIds.has(id))

    localStorage.setItem(syncKey, 'true') // نعلّمها اتزامنت قبل ما نبدأ، عشان أي remount مايكررش العملية

    if (idsToSync.length > 0) {
      idsToSync.forEach((id) => toggleFavApi(id))
    }

    setFavorites([])
  }, [user?.id, favoriteIds, apiFavorites, setFavorites, toggleFavApi])

  const handleToggle = (
    e: React.MouseEvent,
    id: number,
    isCurrentlyFav: boolean,
  ) => {
    e.stopPropagation()

    // --- المنطق للزوار (غير المسجلين) ---
    if (!user?.id) {
      toggleFavorite(id)
      toast.success(
        isCurrentlyFav ? t('removed_from_favorites') : t('added_to_favorites'),
      )
      return
    }

    // --- المنطق للمستخدمين المسجلين ---
    const togglePromise = new Promise((resolve, reject) => {
      toggleFavApi(id, {
        onSuccess: (data: any) => {
          toggleFavorite(id)
          resolve(data)
        },
        onError: (err) => reject(err),
      })
    })

    toast.promise(togglePromise, {
      loading: t('processing'),
      success: () =>
        isCurrentlyFav ? t('removed_from_favorites') : t('added_to_favorites'),
      error: t('error_try_again'),
    })
  }

  const [specialtyId, setSpecialtyId] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc: any) => {
      const matchesSpec =
        specialtyId === 'all' || doc.specialty_id?.toString() === specialtyId
      const matchesSearch = doc.name[currentLang]
        .toLowerCase()
        .includes(search.toLowerCase())
      return matchesSpec && matchesSearch
    })
  }, [doctors, specialtyId, search, currentLang])

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', direction: dir },
    [Autoplay({ delay: 3000, stopOnInteraction: false })],
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (isLoading)
    return (
      <div className="py-20 text-center text-[#2D6A4F]">جاري التحميل...</div>
    )

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-17" dir={dir}>
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#2D6A4F] mb-1">
            <Stethoscope size={20} />
            <h6 className="text-lg font-semibold">
              {t('doctors.our_doctors')}
            </h6>
          </div>
          <h2 className="text-3xl font-black text-[#0E2A2E]">
            {t('doctors.title')}
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={scrollPrev}
            className="p-2 rounded-full border hover:bg-[#2D6A4F] hover:text-white transition-all"
          >
            {dir === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
          </button>
          <button
            onClick={scrollNext}
            className="p-2 rounded-full border hover:bg-[#2D6A4F] hover:text-white transition-all"
          >
            {dir === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 bg-gray-50 p-4 rounded-xl items-center justify-start">
        <div className="flex items-center gap-2 text-[#2D6A4F]">
          <Filter size={18} />
          <span className="font-bold text-sm">{t('filter_by')}:</span>
        </div>

        <select
          className="p-2 rounded-lg border border-gray-200 outline-none text-sm bg-white min-w-[150px]"
          onChange={(e) => setSpecialtyId(e.target.value)}
        >
          <option value="all">{t('specialty')}</option>
          {specialties.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name[currentLang]}
            </option>
          ))}
        </select>

        <div className="relative w-64">
          <input
            type="text"
            placeholder={t('search_doctor')}
            className="w-full p-2 pl-10 pr-10 rounded-lg border border-gray-200 outline-none text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search
            size={16}
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${dir === 'rtl' ? 'left-3' : 'right-3'}`}
          />
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {filteredDoctors.map((doc: any) => {
            const isFav = user?.id
              ? apiFavorites?.some((f: any) => f.doctor_id === doc.id)
              : favoriteIds.includes(doc.id)

            return (
              <div
                key={doc.id}
                className="flex-[0_0_40%] md:flex-[0_0_20%] lg:flex-[0_0_16%] cursor-pointer group relative"
              >
                <button
                  onClick={(e) => handleToggle(e, doc.id, isFav)}
                  className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                >
                  <Heart
                    size={18}
                    className={
                      isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'
                    }
                  />
                </button>

                <div
                  className="cursor-pointer group"
                  onClick={() => {
                    const slug = doc.name.en
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[.]/g, '')
                    navigate({
                      to: '/medical/doctors/$slug',
                      params: { slug },
                      search: { id: doc.id },
                    })
                  }}
                >
                  <div className="relative mb-4 w-full">
                    <img
                      src={
                        doc.image
                          ? doc.image.startsWith('http')
                            ? doc.image
                            : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '')}/storage/${doc.image.replace('storage/', '')}`
                          : '/default-avatar.png'
                      }
                      className="w-full aspect-[2/3] object-cover rounded-xl shadow-inner"
                      alt={doc.name[currentLang]}
                    />
                  </div>

                  <h3 className="font-bold text-md truncate w-full text-center">
                    {doc.name?.[currentLang]}
                  </h3>

                  <p className="text-[#2D6A4F] text-s font-medium mt-1 text-center w-full">
                    {doc.specialty?.name?.[currentLang]}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}