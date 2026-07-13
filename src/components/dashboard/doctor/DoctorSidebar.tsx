import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Stethoscope, Calendar, Clock, Star } from 'lucide-react';
import { createRouter, createRoute, createRootRoute, Outlet, useParams } from '@tanstack/react-router';
export const DoctorSidebar = () => {
  const { t } = useTranslation();
const doctorId = localStorage.getItem('doctorId'); // طريقة بديلة لجلب الـ ID بدون Context
  return (
<aside className="sticky top-15 start-0 h-screen w-20 md:w-64 bg-white border-e border-gray-100 shadow-sm z-10 transition-all duration-300">      {/* الشعار */}
      <div className="h-20 flex items-center justify-center border-b border-gray-50">
        <div className="bg-[#2D6A4F] p-2 rounded-xl text-white">
          <Stethoscope size={24} />
        </div>
        <h2 className="hidden md:block ms-3 text-xl font-bold text-[#2D6A4F]">
          {t('sidebar_title')}
        </h2>
      </div>

      {/* الروابط بدون خلفية افتراضية */}
      <nav className="p-4 space-y-2">
        <SidebarLink to="/dashboard/doctor" icon={<LayoutDashboard size={22} />} label={t('home')} />
        <SidebarLink to="/dashboard/doctor/my-services" icon={<Stethoscope size={22} />} label={t('my_services')} />
        <SidebarLink to="/dashboard/doctor/appointments" icon={<Calendar size={22} />} label={t('appointments')} />
        <SidebarLink to="/dashboard/doctor/availability" icon={<Clock size={22} />} label={t('availability')} />
<SidebarLink 
    to="/dashboard/doctor/reviews" 
    icon={<Star size={22} />} 
    label={t('my_reviews')} 
  />
           </nav>
    </aside>
  );
};

function SidebarLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <Link 
      to={to} 
      className="flex items-center p-3 rounded-xl transition-all duration-200 text-gray-500 hover:bg-[#2D6A4F]/10 hover:text-[#2D6A4F] [&.active]:bg-[#2D6A4F] [&.active]:text-white [&.active]:font-semibold"
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="hidden md:block ms-3 font-medium">{label}</span>
    </Link>
  );
}