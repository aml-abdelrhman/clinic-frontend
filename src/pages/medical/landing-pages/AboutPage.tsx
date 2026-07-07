import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export function AboutDetails() {
  const { t } = useTranslation()

  // إعدادات الحركة
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <main className="max-w-5xl mx-auto py-25 px-5 space-y-24 overflow-hidden">
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-12" // تغيير التنسيق ليكون عمودياً
      >
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-emerald-900 leading-tight">
            {t('aboutDetails.title')}
          </h1>
          <div className="w-20 h-1 bg-emerald-500 rounded-full mx-auto" />
          <p className="text-gray-600 leading-8 text-lg">
            {t('aboutDetails.longDesc')}
          </p>
        </div>

        <div className="relative w-full h-[500px]">
          <img
            src="/clinic-team.jpg"
            alt="Clinic Team"
            className="w-full h-full object-cover rounded-3xl shadow-2xl hover:scale-[1.01] transition-transform duration-500"
          />
          {/* إضافة تأثير إضاءة خلفي جذاب */}
          <div className="absolute inset-0 bg-emerald-900/10 rounded-3xl -z-10 blur-xl" />
        </div>
      </motion.section>

      {/* القسم الثاني: رحلة العناية مع أيقونات */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-white border border-emerald-50 p-10 rounded-[2rem] shadow-lg shadow-emerald-50/50"
      >
        <h2 className="text-3xl font-bold text-emerald-900 mb-12 text-center">
          {t('aboutDetails.process.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {['step1', 'step2', 'step3'].map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center space-y-4 p-6 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors"
            >
              <span className="w-12 h-12 flex items-center justify-center bg-emerald-600 text-white font-bold rounded-full text-xl shadow-md">
                0{i + 1}
              </span>
              <p className="text-gray-700 leading-relaxed font-medium">
                {t(`aboutDetails.process.${step}`)}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* قسم التكنولوجيا والفريق (الجديد) */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="p-8 bg-emerald-900 text-white rounded-3xl">
          <h3 className="text-xl font-bold mb-4">
            {t('aboutDetails.tech.title')}
          </h3>
          <p className="opacity-90">{t('aboutDetails.tech.text')}</p>
        </div>
        <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100">
          <h3 className="text-xl font-bold text-emerald-900 mb-4">
            {t('aboutDetails.team.title')}
          </h3>
          <p className="text-gray-600">{t('aboutDetails.team.text')}</p>
        </div>
      </section>

      {/* قسم التزامنا */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center space-y-6 pt-10 border-t border-gray-200"
      >
        <h2 className="text-2xl font-bold text-emerald-900">
          {t('aboutDetails.commitment.title')}
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto italic">
          {t('aboutDetails.commitment.text')}
        </p>
      </motion.section>
    </main>
  )
}
