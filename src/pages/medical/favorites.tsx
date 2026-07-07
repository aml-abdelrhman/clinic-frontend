'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Trash2, Search, Loader2 } from 'lucide-react'
import {
  useGetFavorites,
  useToggleFavorite,
  useGetDoctors,
  useGetServices,
} from '@/hooks/useQuery'
import { useAuthStore, selectUser } from '@/stores/useAuthStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { BookingModal } from '@/pages/BookingModal'
import { toast } from 'sonner'

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''

const getImageUrl = (url: string | null) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${baseUrl}/storage/${url.replace('storage/', '')}`
}

// نفس أداة القراءة الآمنة للحقول ثنائية اللغة المستخدمة في ServicesSection
const getLocalized = (data: any, lang: 'ar' | 'en') => data?.[lang] || data

const DoctorImage = ({ src, alt }: { src: string; alt: string }) => {
  const [imgSrc, setImgSrc] = useState(src)
  useEffect(() => {
    setImgSrc(src)
  }, [src])
  return (
    <img
      src={imgSrc}
      className="w-full aspect-[3/4] object-cover rounded-xl mb-4 shadow-sm"
      alt={alt}
      onError={() => setImgSrc('/default-avatar.png')}
    />
  )
}

export const FavoritesIcon = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const dir = i18n.dir()
  const currentLang = i18n.language as 'ar' | 'en'

  const user = useAuthStore(selectUser)
  const { favoriteIds, toggleFavorite, clearFavorites } = useFavoriteStore()

  const [deletingId, setDeletingId] = useState<number | null>(null)

  // الطبيب اللي مودال الحجز شغال بتاعه حاليًا (null = مفيش مودال مفتوح)
  const [bookingDoctor, setBookingDoctor] = useState<any | null>(null)

  const { data: allDoctors = [], isLoading: loadingDoctors } = useGetDoctors()

  const {
    data: favorites = [],
    isLoading: loadingFavs,
    isFetching: fetchingFavs,
    refetch,
  } = useGetFavorites()
  const { mutate: toggleFavApi } = useToggleFavorite()

  // خدمات الطبيب اللي مفتوح له المودال حاليًا (بتتجاب بس لما يكون فيه طبيب مختار)
  const { data: bookingServices = [] } = useGetServices(bookingDoctor?.id)

  // مزامنة مفضلة الزائر (المخزنة محليًا قبل تسجيل الدخول) مع الباك إند - مرة واحدة فعليًا لكل مستخدم
  useEffect(() => {
    if (!user?.id || favoriteIds.length === 0) return

    const syncKey = `favorites_synced_${user.id}`
    if (localStorage.getItem(syncKey) === 'true') return

    const alreadyFavoritedIds = new Set(favorites.map((f: any) => f.doctor?.id))
    const idsToSync = favoriteIds.filter((id) => !alreadyFavoritedIds.has(id))

    localStorage.setItem(syncKey, 'true')

    if (idsToSync.length === 0) {
      clearFavorites()
      return
    }

    idsToSync.forEach((id) =>
      toggleFavApi(id, {
        onSuccess: () => {
          clearFavorites()
          refetch()
        },
      }),
    )
    toast.success(t('favorites_synced'))
  }, [user?.id, favoriteIds, favorites, toggleFavApi, clearFavorites, refetch, t])

  const [search, setSearch] = useState('')

  const displayedFavorites = useMemo(() => {
    if (user?.id) return favorites.map((f: any) => f.doctor)
    return allDoctors.filter((doc: any) => favoriteIds.includes(doc.id))
  }, [user, favorites, allDoctors, favoriteIds])

  const filtered = displayedFavorites.filter((doc: any) =>
    doc?.name?.[currentLang]?.toLowerCase().includes(search.toLowerCase()),
  )

  const getDoctorSlug = (doc: any) =>
    doc?.name?.en
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[.]/g, '') || 'doctor'

  const goToDoctorPage = (doc: any) => {
    navigate({
      to: '/medical/doctors/$slug',
      params: { slug: getDoctorSlug(doc) },
      search: { id: doc.id },
    })
  }

  // زر الحجز: يفتح BookingModal المشترك لنفس الطبيب، بدل ما يوديكي لصفحة تانية
  const handleBookNow = (e: React.MouseEvent, doc: any) => {
    e.stopPropagation()
    setBookingDoctor(doc)
  }

  const handleRemove = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    const isUserLoggedIn = !!user?.id

    if (isUserLoggedIn) {
      setDeletingId(id)
      toggleFavApi(id, {
        onSuccess: () => {
          refetch().then(() => {
            setDeletingId(null)
            toast.success(t('removed_from_favorites'))
          })
        },
        onError: () => {
          setDeletingId(null)
          toast.error(t('error_occurred'))
        },
      })
    } else {
      toggleFavorite(id)
      toast.success(t('removed_from_favorites'))
    }
  }

  if (user?.id ? loadingFavs : loadingDoctors) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <Loader2 className="animate-spin text-[#2D6A4F] mb-4" size={48} />
        <p className="text-[#0E2A2E] font-bold text-lg">{t('loading')}...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-20" dir={dir}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0E2A2E]">
            {t('favorites')}
          </h2>
          {fetchingFavs && (
            <span className="text-xs text-[#2D6A4F] animate-pulse">
              {t('updating')}...
            </span>
          )}
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder={t('search_doctor')}
            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#2D6A4F] text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search
            size={16}
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${dir === 'rtl' ? 'left-3' : 'right-3'}`}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          {t('no_favorites')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((doc: any) => (
            <div
              key={doc.id}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer"
              onClick={() => goToDoctorPage(doc)}
            >
              <DoctorImage
                src={getImageUrl(doc.image) || '/default-avatar.png'}
                alt={doc.name?.[currentLang] || 'Doctor'}
              />
              <h3 className="font-bold text-lg text-[#0E2A2E]">
                {doc.name?.[currentLang]}
              </h3>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={(e) => handleBookNow(e, doc)}
                  className="flex-1 bg-[#0E2A2E] text-white py-2 rounded-lg text-sm hover:bg-[#0E2A2E]/90 transition-colors"
                >
                  {t('book_now')}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, doc.id)}
                  disabled={deletingId === doc.id}
                  className="p-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نفس BookingModal المستخدم في ServicesSection - بيحمي من حجز ميعاد متكرر بنفس المنطق */}
      <BookingModal
        isOpen={!!bookingDoctor}
        onClose={() => setBookingDoctor(null)}
        doctorId={bookingDoctor?.id}
        services={bookingServices}
        getLocalized={getLocalized}
      />
    </div>
  )
}