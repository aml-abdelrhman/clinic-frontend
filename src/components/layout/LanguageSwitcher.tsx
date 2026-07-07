import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/i18n/config';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const current = (i18n.language?.split('-')[0] ?? 'en') as SupportedLanguage;

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* الزر الرئيسي */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white/50 backdrop-blur-md border border-slate-200 hover:border-emerald-500 transition-all text-slate-700 hover:text-emerald-600"
      >
        <span className="font-bold text-sm w-6 text-center">
          {current === 'ar' ? 'ع' : 'EN'}
        </span>
        <ChevronDown size={14} className={cn("transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-24 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          {SUPPORTED_LANGUAGES.map((lng) => (
            <button
              key={lng}
              onClick={() => changeLanguage(lng)}
              className={cn(
                "w-full text-right px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                current === lng 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {lng === 'ar' ? 'العربية' : 'English'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}