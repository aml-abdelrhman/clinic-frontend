import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Stethoscope, Star, Users, Home, UserCog, Microscope, ClipboardList } from 'lucide-react'

export const AdminSidebar = () => {
  const { t, i18n } = useTranslation()

  // مصفوفة الروابط مع الترجمة الديناميكية
  // نستخدم i18n.language للتأكد من تحديث النصوص عند تغيير اللغة
  const navLinks = [
    { to: "/dashboard/admin", label: i18n.language === 'ar' ? 'الرئيسية' : 'Home', icon: <Home size={20} /> },
    { to: "/dashboard/admin/users", label: i18n.language === 'ar' ? 'إدارة المستخدمين' : 'Manage Users', icon: <Users size={20} /> },
    { to: "/dashboard/admin/doctors", label: i18n.language === 'ar' ? 'إدارة الأطباء' : 'Manage Doctors', icon: <UserCog size={20} /> },
    { to: "/dashboard/admin/specialties", label: i18n.language === 'ar' ? 'التخصصات' : 'Specialties', icon: <Microscope size={20} /> },
    { to: "/dashboard/admin/services", label: i18n.language === 'ar' ? 'الخدمات' : 'Services', icon: <Stethoscope size={20} /> },
    { to: "/dashboard/admin/appointments", label: i18n.language === 'ar' ? 'المواعيد' : 'Appointments', icon: <ClipboardList size={20} /> },
    { to: "/dashboard/admin/reviews", label: i18n.language === 'ar' ? 'التقييمات' : 'Reviews', icon: <Star size={20} /> },
  ]

  return (
    <div className="fixed top-0 start-0 h-screen mt-16 bg-[#0E2A2E] text-white p-2 md:p-4 w-20 md:w-64 transition-all duration-300 z-40 border-slate-700 border-e">
      <h2 className="hidden md:block text-lg font-bold mb-8 text-center text-[#A7C957]">
        {i18n.language === 'ar' ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
      </h2>

      <nav className="space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center gap-3 p-3 hover:bg-[#2D6A4F] rounded-xl transition-all duration-200"
          >
            <div className="mx-auto md:mx-0">{link.icon}</div>
            <span className="hidden md:block font-medium truncate">{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}