'use client';
import { useTranslation } from "react-i18next";
import { DoctorLayout } from "./DoctorLayout";
import { useGetDoctor } from "@/hooks/useQuery"; 
import { useAuthStore } from "@/stores/useAuthStore"; 
import { Activity } from "lucide-react";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const { user } = useAuthStore();
  const { data: profile, isLoading } = useGetDoctor(user?.id || 0);

  const parseSafe = (data: any) => { try { return typeof data === 'string' ? JSON.parse(data) : data; } catch { return {}; } };

  if (isLoading) return <div className="flex h-screen items-center justify-center font-bold text-[#2D6A4F]">Loading...</div>;

  return (
    <DoctorLayout>
      <main className="w-full px-4 py-6 md:p-8 lg:p-10 space-y-6">
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          <section className="xl:col-span-4 w-full">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden xl:sticky xl:top-8">
              <img 
                src={profile?.image ? (profile.image.startsWith('http') ? profile.image : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${profile.image.replace('storage/', '')}`) : '/default-avatar.png'} 
                className="w-full h-72 md:h-96 object-cover"
                alt="profile"
              />
              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-black text-[#0E2A2E] break-words">{parseSafe(profile?.name)[currentLang]}</h2>
                <p className="text-[#2D6A4F] font-bold text-lg mb-6">{parseSafe(profile?.specialty?.name)[currentLang]}</p>
                
                <div className="space-y-2">
                  <InfoRow label={t('profile.years_experience')} value={`${profile?.years_experience} ${t('common.years')}`} />
                  <InfoRow label={t('profile.consultation_fee')} value={`${profile?.price_from} SAR`} />
                  <InfoRow label={t('profile.rating')} value={`${profile?.rating || 4.8}/5.0`} />
                </div>
              </div>
            </div>
          </section>

          <section className="xl:col-span-8 w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatItem title={t('profile.patients_today')} value="12" />
              <StatItem title={t('profile.confirmed_appointments')} value="8" />
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm w-full">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#0E2A2E]"><Activity size={20} className="text-[#2D6A4F]"/> {t('profile.professional_bio')}</h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-lg">{parseSafe(profile?.bio)[currentLang]}</p>
            </div>
          </section>
        </div>
      </main>
    </DoctorLayout>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 py-3">
      <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase">{label}</p>
      <p className="text-slate-800 font-black text-sm md:text-base">{value}</p>
    </div>
  );
}

function StatItem({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">{title}</p>
      <p className="text-2xl md:text-3xl font-extrabold text-[#0E2A2E] mt-2">{value}</p>
    </div>
  );
}