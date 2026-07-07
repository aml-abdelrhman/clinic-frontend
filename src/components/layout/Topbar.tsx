import React, { useState, useRef, useMemo, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Search,
  Heart,
  ChevronDown,
  LogOut,
  User,
  Settings,
  X,
  Stethoscope,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '../../stores/useAuthStore'
import {
  useGetDoctors,
  useGetSpecialties,
  useGetFavorites,
  useGetMyAppointments,
} from '@/hooks/useQuery'
import { cn } from '@/lib/utils'
import { isRtl } from '@/i18n/config'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useFavoriteStore } from '@/stores/favoriteStore'

interface TopbarProps {
  sidebarCollapsed: boolean
  onMobileMenuToggle?: () => void
}

export function Topbar({ sidebarCollapsed }: TopbarProps) {
  const { t, i18n } = useTranslation()
  const rtl = isRtl(i18n.language)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  
  const { data: doctors } = useGetDoctors()
  const { data: specialties } = useGetSpecialties()

  const { data: apiFavorites = [] } = useGetFavorites()
  const { favoriteIds } = useFavoriteStore()
  const count = user?.id ? apiFavorites.length : favoriteIds.length

const { data: myAppointments = [] } = useGetMyAppointments({
  enabled: !!user?.id, 
});

const activeAppointmentsCount = useMemo(() => {
    if (!user?.id || user.role !== 'patient' || !Array.isArray(myAppointments)) return 0
    return myAppointments.filter((app: any) => app.status === 'confirmed').length
  }, [user?.id, user?.role, myAppointments])

  // نفس منطق تحديد لوحة التحكم المستخدم في قائمة البروفايل، عشان أيقونة السماعة توجّه
  // كل دور لداشبورده الصح بدل ما تفتح داشبورد المريض للكل
  const dashboardPath =
    user?.role === 'admin'
      ? '/dashboard/admin'
      : user?.role === 'doctor'
      ? '/dashboard/doctor'
      : '/dashboard/patient'

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const searchRefDesktop = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    // trim() يشيل أي مسافات زيادة في البداية/النهاية اللي بتضيفها لوحة مفاتيح الموبايل تلقائيًا
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery.length < 2) return { doctors: [], specialties: [] }

    const q = trimmedQuery.toLowerCase()

    return {
      doctors:
        doctors
          ?.filter((d: any) => {
            const arName = d.name?.ar?.trim() || ''
            const enName = d.name?.en?.trim().toLowerCase() || ''
            return arName.includes(trimmedQuery) || enName.includes(q)
          })
          .slice(0, 3) || [],
      specialties:
        specialties
          ?.filter((s: any) => {
            const arName = s.name?.ar?.trim() || ''
            const enName = s.name?.en?.trim().toLowerCase() || ''
            return arName.includes(trimmedQuery) || enName.includes(q)
          })
          .slice(0, 3) || [],
    }
  }, [searchQuery, doctors, specialties])

  const hasResults = results.doctors.length > 0 || results.specialties.length > 0

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (searchRefDesktop.current && !searchRefDesktop.current.contains(target)) {
        setSearchOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate({ to: '/medical/doctors', search: { search: searchQuery } as any })
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  // الانتقال لصفحة تفاصيل الطبيب: نفس المنطق بالظبط المستخدم في صفحة قائمة الأطباء
  // (نحسب الـ slug من doc.name.en بدل الاعتماد على d.slug اللي ممكن يكون undefined)
  const goToDoctor = (doc: any) => {
    const slug = doc.name.en
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[.]/g, '')

    navigate({
      to: '/medical/doctors/$slug',
      params: { slug },
      search: { id: doc.id },
    })
    setSearchOpen(false)
    setSearchQuery('')
  }

  // عند الضغط على أيقونة المواعيد وهو مش مسجل دخول: نطلعله تنبيه بس، من غير ما نجبره يروح صفحة اللوجن
  const handleAppointmentsClick = () => {
    toast.error(
      t('medical.topbar.loginToSeeAppointments', {
        defaultValue: 'سجل الدخول لتتمكن من رؤية قائمة مواعيدك',
      })
    )
  }

  const iconButtonClass =
    'relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all'

  const SearchResultsDropdown = () => (
    <div
      className={cn(
        'z-50 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden',
        'fixed left-3 right-3 top-[calc(var(--topbar-h)+0.5rem)]',
        'sm:absolute sm:left-auto sm:right-auto sm:top-full sm:mt-3 sm:w-80 sm:max-w-sm',
        rtl ? 'sm:left-0' : 'sm:right-0'
      )}
    >
      {hasResults ? (
        <>
          {results.doctors.length > 0 && (
            <div className="p-2">
              <p className="text-[10px] text-gray-400 font-bold uppercase px-3 pt-2">
                {t('medical.common.doctors')}
              </p>
              {results.doctors.map((d: any) => (
                <button
                  key={d.id}
                  onClick={() => goToDoctor(d)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl transition text-start"
                >
                  <User size={16} className="text-emerald-600 shrink-0" />
                  <span className="text-sm font-bold text-gray-800 truncate">
                    {d.name.ar}
                  </span>
                </button>
              ))}
            </div>
          )}
          {results.specialties.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase px-3 pt-2">
                {t('medical.common.specialties')}
              </p>
              {results.specialties.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => {
                    navigate({ to: '/specialties/$slug', params: { slug: s.slug } })
                    setSearchOpen(false)
                    setSearchQuery('')
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl transition text-start"
                >
                  <Stethoscope size={16} className="text-emerald-600 shrink-0" />
                  <span className="text-sm font-bold text-gray-800 truncate">
                    {s.name.ar}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400 text-center py-6 px-4">
          {t('medical.topbar.noResults', { defaultValue: 'No results found' })}
        </p>
      )}
    </div>
  )

  return (
    <header
      className="fixed top-0 z-30 w-full bg-white border-b border-gray-100"
      style={{ height: 'var(--topbar-h)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-full flex items-center gap-2 sm:gap-3">

        {/* اللوجو */}
        <div className="flex-1 min-w-0">
  <Link to="/" className="inline-block">
    <img src="/logo1.png" alt="Clinic logo" className="h-8 sm:h-10 w-auto object-contain" />
  </Link>
</div>

        {/* مجموعة الأيقونات */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-50 rounded-xl p-1 shrink-0">
          {/* أيقونة/صندوق البحث */}
          <div className="relative" ref={searchRefDesktop}>
            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                className={iconButtonClass}
                title={t('medical.common.search', { defaultValue: 'Search' })}
              >
                <Search size={18} />
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                <div className="relative">
                  <Search
                    size={16}
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 text-emerald-600',
                      rtl ? 'right-3' : 'left-3'
                    )}
                  />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    placeholder={t('medical.topbar.searchPlaceholder')}
                    className={cn(
                      'py-2 w-[130px] xs:w-[160px] sm:w-64 text-sm bg-gray-50 text-gray-800 rounded-xl border border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all',
                      rtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    )}
                  />
                </div>
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                  className="text-gray-400 hover:text-gray-800 shrink-0"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {searchOpen && searchQuery.length >= 2 && <SearchResultsDropdown />}
          </div>

          <Link
            to="/favorites"
            className={iconButtonClass}
            title={t('medical.common.favorites', { defaultValue: 'Favorites' })}
          >
            <Heart size={18} />
            {count > 0 && (
              <span className="absolute -top-0.5 -end-0.5 bg-emerald-500 text-white text-[9px] min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full font-bold shadow-md">
                {count}
              </span>
            )}
          </Link>


        {/* أيقونة المواعيد */}
{user ? (
  <Link
    to={dashboardPath}
    className={iconButtonClass}
    title={t('medical.common.appointments', { defaultValue: 'Appointments' })}
  >
    <Stethoscope size={18} />
    {activeAppointmentsCount > 0 && (
      <span className="absolute -top-0.5 -end-0.5 bg-emerald-500 text-white text-[9px] min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full font-bold shadow-md">
        {activeAppointmentsCount}
      </span>
    )}
  </Link>
) : (
  <button
    onClick={handleAppointmentsClick}
    className={iconButtonClass}
    title={t('medical.common.appointments', { defaultValue: 'Appointments' })}
  >
    <Stethoscope size={18} />
  </button>
)}
          <LanguageSwitcher />
        </div>

        {/* قائمة المستخدم */}
        <div className="relative shrink-0" ref={userMenuRef}>
          {user ? (
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm hover:bg-slate-800 transition-all duration-200"
            >
              <div className="hidden md:block text-start">
                <p className="text-white text-xs font-semibold leading-tight max-w-[110px] truncate">
                  {user.name}
                </p>
                <p className="text-[10px] capitalize text-emerald-400 font-bold opacity-90">
                  {t(`medical.common.${user.role}`, { defaultValue: user.role })}
                </p>
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center md:hidden">
                <User size={14} className="text-emerald-400" />
              </div>
              <ChevronDown
                size={14}
                className={cn('text-white/50 transition-transform duration-200 hidden md:block', userMenuOpen && 'rotate-180')}
              />
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap"
            >
              <User size={16} />
              <span className="hidden sm:inline">{t('medical.auth.signIn')}</span>
            </Link>
          )}

          {user && userMenuOpen && (
            <div
              className={cn(
                'absolute top-full mt-2 w-52 rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150',
                rtl ? 'left-0' : 'right-0'
              )}
              style={{
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div className="px-4 py-3 border-b border-white/5 md:hidden">
                <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                <p className="text-[10px] capitalize text-emerald-400 font-bold">
                  {t(`medical.common.${user.role}`, { defaultValue: user.role })}
                </p>
              </div>
              <Link
                to={dashboardPath}
                className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/5 transition-colors text-sm"
                onClick={() => setUserMenuOpen(false)}
              >
                <Settings size={16} />
                {t('medical.routes.dashboard')}
              </Link>
              <button
                onClick={() => { logout(); setUserMenuOpen(false); navigate({ to: '/' }) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-white/5 transition-colors text-sm border-t border-white/5"
              >
                <LogOut size={16} />
                {t('medical.auth.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}