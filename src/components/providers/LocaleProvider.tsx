import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DirectionProvider } from '@/components/ui/direction'
import { isRtl } from '@/i18n/config'

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const dir = isRtl(i18n.language) ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = i18n.language
    document.documentElement.dir = dir
  }, [i18n.language, dir])

  return <DirectionProvider dir={dir}>{children}</DirectionProvider>
}
