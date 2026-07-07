'use client'

import { useTranslation } from 'react-i18next'
import { Loader2, AlertCircle, Stethoscope } from 'lucide-react'
import { useGetSpecialties } from '@/hooks/useQuery'
import { Link } from '@tanstack/react-router'
import React, { useEffect } from 'react'

export function ContentSection() {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'
  const { data: specialties, isLoading, isError } = useGetSpecialties()

  // كود التشخيص (Diagnostics)
useEffect(() => {
  if (isLoading) {
    console.log("⏳ ContentSection: Loading...");
  } else if (isError) {
    console.error("❌ ContentSection: Error fetching data.");
  } else if (specialties) {
    console.log("✅ ContentSection: Specialties fetched:", specialties.length, "items.");
    specialties.forEach((s) => {
      console.log(`🔍 Item: ${s.name?.ar}, Image: ${s.image ? 'Present' : 'Missing'}, URL: ${s.image || 'N/A'}`);
    });
  }
}, [specialties, isLoading, isError]);
  return (
    <div className="bg-[#1B3A3A] pt-24 pb-20">
      <section className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">
            {t('medical.common.specialties')}
          </h2>
        </div>

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialties?.map((cat) => {
              // const imageUrl = cat.image ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${cat.image}` : null;

              const imageUrl = cat.image
                ? cat.image.startsWith('http')
                  ? cat.image
                  : `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')}/storage/${cat.image.replace('storage/', '')}`
                : null
              return (
                <Link
                  key={cat.id}
                  to="/specialties/$slug"
                  params={{ slug: cat.slug }}
                  className="group bg-white p-0 hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  {/* الصورة أصبحت أطول (aspect ratio 4/3) */}
                  <div className="w-full aspect-[4/3] overflow-hidden bg-[#e8efed]">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={cat.name[currentLang]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Stethoscope className="text-[#1B3A3A]" size={48} />
                      </div>
                    )}
                  </div>

                  {/* تقليل مساحة الكلام (Padding أقل و line-clamp أصغر) */}
                  {/* حاوية النص */}
                  <div className="p-4 w-full flex flex-col items-center text-center">
                    <h3 className="font-bold text-lg text-[#1B3A3A] mb-1">
                      {cat.name[currentLang] || cat.name.ar}
                    </h3>
                    <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                      {cat.description[currentLang] || cat.description.ar}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}