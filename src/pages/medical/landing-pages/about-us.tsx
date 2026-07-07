import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

export function AboutAndFeatures() {
  const { t } = useTranslation()

  const features = [
    { img: '/expreience.png', title: 'features.team.title', desc: 'features.team.desc' },
    { img: '/affordability.png', title: 'features.patient.title', desc: 'features.patient.desc' },
    { img: '/efficiency.png', title: 'features.efficiency.title', desc: 'features.efficiency.desc' },
  ]

  return (
    <section className="py-16 px-5 max-w-7xl mx-auto space-y-24">
      
      {/* الجزء الأول: About Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <img 
          src="/inside.jpg" 
          alt="Clinic" 
          className="rounded-3xl shadow-xl w-full h-80 object-cover"
        />
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-emerald-900">
            {t('about.title')}
          </h2>
          <div className="w-16 h-1 bg-emerald-500 rounded-full" />
          <p className="text-gray-600 leading-relaxed">
            {t('about.description')}
          </p>
          <Link 
            to="/AboutPage" 
            className="inline-block px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all font-semibold"
          >
            {t('about.button')}
          </Link>
        </div>
      </div>

      {/* الجزء الثاني: Features Section */}
      <div className="text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-emerald-900">
            {t('features.title')}
          </h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full" />
        </div>
        
        {/* أضفنا mb-20 هنا لضمان وجود مساحة بيضاء كبيرة أسفل الكاردات في الموبايل */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-6">
              <div className="w-40 h-40 rounded-full bg-emerald-900 flex items-center justify-center shadow-lg p-8">
                <img src={item.img} alt="feature" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-emerald-800">{t(item.title)}</h3>
                <div className="w-12 h-0.5 bg-emerald-400 mx-auto" />
              </div>
              
              <p className="text-sm text-gray-500 leading-relaxed max-w-[280px]">
                {t(item.desc)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}