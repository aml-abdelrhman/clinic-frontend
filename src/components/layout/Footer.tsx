import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { MapPin, Phone, Mail, Instagram, Clock } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-[#1B3A3A] text-white py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* العمود الأول: الشعار */}
        <div className="space-y-4">
          <img
            src="/logo1.png"
            alt="Clinic logo"
            className="h-12 w-auto object-contain bg-white/10 p-2 rounded-lg"
          />
          <p className="text-xs text-gray-300 leading-relaxed opacity-80">
            {t('footer.acknowledgement')}
          </p>
        </div>

        {/* العمود الثاني: خريطة الموقع */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg mb-2 text-[#5FBF8E]">
            {t('footer.siteMap')}
          </h4>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>
              <Link to="/" className="hover:text-[#5FBF8E] transition">
                {t('footer.links.home')}
              </Link>
            </li>
            <li>
              <Link to="/AboutPage" className="hover:text-[#5FBF8E] transition">
                {t('footer.links.about')}
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-[#5FBF8E] transition">
                {t('footer.links.services')}
              </Link>
            </li>
            <li>
              <Link
                to="/medical/doctors"
                className="hover:text-[#5FBF8E] transition"
              >
                {t('footer.links.doctors')}
              </Link>
            </li>
          </ul>
        </div>

        {/* العمود الثالث: اتصل بنا */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg mb-2 text-[#5FBF8E]">
            {t('footer.contactUs')}
          </h4>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="shrink-0" />{' '}
              <span>99 Bay St, Brighton VIC 3186</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} /> <span>03 9007 0524</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} /> <span>admin@newbaymedical.com.au</span>
            </div>
            <div className="flex items-center gap-2">
              <Instagram size={16} /> <span>@newbaymedicalclinic</span>
            </div>
          </div>
        </div>

        {/* العمود الرابع: مواعيد العمل (آخر عمود) */}
        {/* العمود الرابع: مواعيد العمل */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg mb-2 text-[#5FBF8E] flex items-center gap-2">
            <Clock size={18} /> {t('footer.openingHours')}
          </h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>
              <span className="text-[#5FBF8E] font-medium">
                {t('footer.days.monFri')}:
              </span>{' '}
              {t('footer.hours')}
            </p>
            <p>
              <span className="text-[#5FBF8E] font-medium">
                {t('footer.days.sat')}:
              </span>{' '}
              {t('footer.satHours')}
            </p>
            <p>
              <span className="text-red-400 font-medium">
                {t('footer.days.sun')}:
              </span>{' '}
              {t('footer.closed')}
            </p>
            <p className="text-[11px] text-gray-400 pt-2 border-t border-white/10 mt-2">
              {t('footer.holidays')}
            </p>
          </div>
        </div>
      </div>

      {/* حقوق النشر */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} All Rights Reserved.</p>
      </div>
    </footer>
  )
}
