import { useTranslation } from 'react-i18next'
import { Phone, CalendarCheck } from 'lucide-react'
import { Link } from '@tanstack/react-router' // تأكدي من استيراد Link

export function AppointmentAndNews() {
  const { t } = useTranslation()

  return (
    <div className="space-y-16">
      {/* ── الجزء الأول: الـ Hero CTA ── */}
      <section className="bg-emerald-900 py-16 px-5 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('booking.title')}</h2>
        <p className="max-w-2xl mx-auto opacity-90 leading-relaxed mb-8">
          {t('booking.description')}
        </p>
        <div className="flex gap-4 justify-center">
          {/* رابط الاتصال */}
          <a 
            href="tel:+1234567890" 
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-full transition-all font-semibold"
          >
            <Phone size={18} /> {t('booking.call')}
          </a>
          
          {/* رابط الحجز */}
          <Link 
            to="/services" 
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 transition-all font-semibold"
          >
            <CalendarCheck size={18} /> {t('booking.book')}
          </Link>
        </div>
      </section>

      {/* ── الجزء الثاني: قسم الأخبار مع تمديد الخلفية ── */}
   {/* ── الجزء الثاني: قسم الأخبار (الخلفية البيضاء تمتد خلف المحتوى) ── */}
<section className="max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-start">
  
  {/* الجزء الأيسر: نصوص الأخبار بدون ديف خارجي إضافي */}
  <div className=" p-10 rounded-3xl space-y-10 min-h-[400px]">
    <h2 className="text-2xl font-bold text-emerald-800">{t('news.title')}</h2>
    
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-emerald-900">{t('news.infection.title')}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{t('news.infection.desc')}</p>
    </div>

    <div className="space-y-4">
      <h3 className="text-lg font-bold text-emerald-900">{t('news.mask.title')}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{t('news.mask.desc')}</p>
    </div>
  </div>

  {/* الجزء الأيمن: كرت الأعراض */}
  <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl h-fit md:mt-20 ">
    <h3 className="text-xl font-bold mb-4">{t('news.symptoms.title')}</h3>
    <ul className="space-y-3">
      {['cough', 'throat', 'fever'].map((item) => (
        <li key={item} className="flex items-center gap-3 text-sm">
          <div className="w-2 h-2 bg-emerald-100 rounded-full" /> {t(`news.symptoms.list.${item}`)}
        </li>
      ))}
    </ul>
    <p className="mt-6 text-xs bg-emerald-700/50 p-4 rounded-xl border border-emerald-500/30">
      {t('news.symptoms.note')}
    </p>
  </div>
</section>
    </div>
  )
}