import { MapPin, Phone, MousePointerClick } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'

export function LocationSection() {
  const { t } = useTranslation()

  const cards = [
    { type: 'info', icon: MapPin, title: t('location.cards.visit.title'), desc: '99 Bay St, Brighton VIC 3186' },
    { type: 'info', icon: Phone, title: t('location.cards.call.title'), desc: '03 9007 0524' },
    { type: 'link', icon: MousePointerClick, title: t('location.cards.book.title'), desc: t('location.cards.book.desc'), path: '/services' },
  ]

  return (
    <section className="bg-emerald-900 text-white pb-20">
      <div className="text-center py-16 px-5 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">{t('location.title')}</h2>
        <p className="opacity-90 leading-relaxed mb-8">{t('location.description')}</p>
        
        <Link 
          to="/services" 
          className="inline-block px-8 py-3 bg-emerald-500 text-white rounded-full font-bold hover:bg-emerald-600 transition-all shadow-lg"
        >
          {t('location.button')}
        </Link>
      </div>

      <div className="w-full h-[400px]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3148.6548!2d144.996!3d-37.904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNewbay+Medical+Clinic!5e0!3m2!1sen!2sau!4v1!5m2!1sen!2sau"
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy"
        />
      </div>

      <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-3 gap-6 -mt-10">
        {cards.map((card, i) => {
          const Content = (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-3xl p-6 text-center text-emerald-900 shadow-xl flex flex-col items-center gap-3 ${card.type === 'link' ? 'hover:scale-105 transition-transform' : ''}`}
            >
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-100">
                <card.icon size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold">{card.title}</h3>
              <p className="text-gray-500 text-sm font-medium">{card.desc}</p>
            </motion.div>
          )

          return card.type === 'link' ? (
            <Link key={i} to={card.path} className="block">
              {Content}
            </Link>
          ) : Content
        })}
      </div>
    </section>
  )
}