import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Stethoscope,Star} from 'lucide-react' // استيراد أيقونة طبية مناسبة

export const AdminSidebar = () => {
  const { t } = useTranslation()

  return (
    /* start-0: تعمل كـ left-0 في الإنجليزية و right-0 في العربية
       border-e: تضع حدوداً على جهة النهاية (يمين في الإنجليزية، يسار في العربية)
    */
    <div className="fixed top-0 start-0 h-screen mt-16 bg-slate-900 text-white p-4 w-20 md:w-64 transition-all duration-300 z-40 border-slate-700 border-e">
      <h2 className="hidden md:block text-xl font-bold mb-8 truncate text-center">
        {t('admin.dashboard_title')}
      </h2>

      <nav className="space-y-4">
        <Link
          to="/dashboard/admin"
          className="flex items-center p-2 hover:bg-slate-700 rounded transition-colors"
        >
          <span className="md:block hidden">{t('admin.home')}</span>
          <span className="md:hidden mx-auto text-xl">🏠</span>
        </Link>

        <Link
          to="/dashboard/admin/doctors"
          className="flex items-center p-2 hover:bg-slate-700 rounded transition-colors"
        >
          <span className="md:block hidden">{t('admin.manage_doctors')}</span>
          <span className="md:hidden mx-auto text-xl">👨‍⚕️</span>
        </Link>

        <Link
          to="/dashboard/admin/specialties"
          className="flex items-center p-2 hover:bg-slate-700 rounded transition-colors"
        >
          <span className="md:block hidden">
            {t('admin.manage_specialties')}
          </span>
          <span className="md:hidden mx-auto text-xl">🔬</span>
        </Link>

        <Link
          to="/dashboard/admin/services"
          className="flex items-center p-2 hover:bg-slate-700 rounded transition-colors"
        >
          <span className="md:block hidden">{t('admin.manage_services')}</span>
          <span className="md:hidden mx-auto text-xl">
            <Stethoscope size={20} />
          </span>
        </Link>
{/* <Link
  to="/dashboard/admin/work-schedule/$doctorId"
  params={{ doctorId: '0' }} // قومي بتحويل الرقم 0 إلى نص '0'
  className="flex items-center p-2 hover:bg-slate-700 rounded transition-colors"
>
  <span className="md:block hidden">{t('admin.manage_schedules')}</span>
  <span className="md:hidden mx-auto text-xl">📅</span>
</Link> */}

<Link
  to="/dashboard/admin/appointments"
  className="flex items-center p-2 hover:bg-slate-700 rounded transition-colors"
>
  <span className="md:block hidden">{t('admin.manage_appointments')}</span>
  <span className="md:hidden mx-auto text-xl">📋</span>
</Link>

<Link
          to="/dashboard/admin/reviews"
className="flex items-center p-2 hover:bg-slate-700 rounded transition-colors"
        >
          {/* تأكدي من إضافة admin.all_reviews أو all_reviews في ملف الترجمة حسب ما تستخدمين */}
          <span className="md:block hidden">{t('all_reviews')}</span>
          <span className="md:hidden mx-auto text-xl">
            <Star size={20} />
          </span>
        </Link>
      </nav>
    </div>
  )
}
