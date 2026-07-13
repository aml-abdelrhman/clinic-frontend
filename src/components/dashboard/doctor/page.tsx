'use client';

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { DoctorLayout } from "./DoctorLayout";
import { useGetMyDoctorProfile, useUpdateDoctordata, useUpdateDoctorImage } from "@/hooks/useQuery";
import { Edit2, Save, X, Camera, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // استخدام الـ Hook الجديد الذي لا يحتاج لـ ID من الفرونت إند
  const { data: doctor, isLoading, isError, error, refetch } = useGetMyDoctorProfile();

  const { mutate: updateDoctor, isPending: isSaving } = useUpdateDoctordata();
  const { mutate: updateDoctorImage, isPending: isUploadingImage } = useUpdateDoctorImage();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    bio_ar: '',
    bio_en: '',
    years_experience: '',
    price_from: '',
  });

  // ملاحظة: formatDoctor في الباك إند بقى بيرجع name/bio كـ object جاهز
  // مش string، فمعندناش داعي لأي parse يدوي هنا تاني، لكن سايبينها
  // كطبقة حماية لو فضل حقل قديم بشكل string لأي سبب
  const parseSafe = (data: any) => {
    if (!data) return {};
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch { return {}; }
    }
    return data;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && doctor?.id) {
      const fileData = new FormData();
      fileData.append('image', e.target.files[0]);
      // لاحظي استخدام doctor.id (Doctor's primary key) وليس user.id
      updateDoctorImage({ id: doctor.id, data: fileData }, {
        onSuccess: () => refetch(),
        onError: (error: any) => {
          alert(error.response?.data?.message || (currentLang === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image'));
        },
      });
    }
  };

  const handleEditClick = () => {
    const name = parseSafe(doctor?.name);
    const bio = parseSafe(doctor?.bio);
    setFormData({
      name_ar: name.ar || '',
      name_en: name.en || '',
      bio_ar: bio.ar || '',
      bio_en: bio.en || '',
      years_experience: doctor?.years_experience?.toString() || '',
      price_from: doctor?.price_from?.toString() || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!doctor?.id) return;

    updateDoctor({
      id: doctor.id,
      data: {
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        bio_ar: formData.bio_ar,
        bio_en: formData.bio_en,
        years_experience: formData.years_experience,
        price_from: formData.price_from,
        specialty_id: doctor?.specialty_id,
      },
    }, {
      onSuccess: () => {
        setIsEditing(false);
        refetch();
      },
      onError: (error: any) => {
        console.error('Update error:', error.response?.data || error.message);
        alert(error.response?.data?.message || (currentLang === 'ar' ? 'فشل الحفظ' : 'Failed to save'));
      },
    });
  };

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-[#FAF7F2]">
      <Loader2 className="animate-spin h-8 w-8 text-[#2D6A4F]" />
    </div>
  );

  if (isError) return (
    <div className="flex h-screen items-center justify-center bg-[#FAF7F2] text-center px-4">
      <div>
        <p className="text-[#0E2A2E] font-semibold mb-2">
          {currentLang === 'ar' ? 'تعذر تحميل بيانات البروفايل' : 'Failed to load profile'}
        </p>
        <p className="text-sm text-[#0E2A2E]/60">{(error as any)?.message}</p>
      </div>
    </div>
  );

  // دالة عرض الصورة - تأكدي من توافقها مع مسار التخزين
  const getImageUrl = (image: any) => {
    if (!image) return '/default-avatar.png';
    if (typeof image === 'string' && image.startsWith('http')) return image;
    return `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '')}/storage/${image}`;
  };

  const displayName = parseSafe(doctor?.name)[currentLang] || t('profile.my_profile');
  const displayBio = parseSafe(doctor?.bio)[currentLang];

  return (
      <main className="w-full min-h-screen bg-[#FAF7F2]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12">

          {/* Masthead */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-[#0E2A2E]/10 pb-5 mb-8 md:mb-12">
            <div className="w-full sm:w-auto">
              <p className="text-[15px] tracking-[0.2em] uppercase text-[#2D6A4F] font-semibold mb-1">
                {currentLang === 'ar' ? 'سجل الطبيب' : 'Physician Record'}
              </p>
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <input
                    className="w-full sm:w-auto font-display text-xl sm:text-2xl text-[#0E2A2E] border-b border-[#2D6A4F]/40 focus:border-[#2D6A4F] outline-none bg-transparent px-1"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    placeholder={currentLang === 'ar' ? 'الاسم بالعربي' : 'Name (Arabic)'}
                  />
                  <input
                    className="w-full sm:w-auto font-display text-xl sm:text-2xl text-[#0E2A2E] border-b border-[#2D6A4F]/40 focus:border-[#2D6A4F] outline-none bg-transparent px-1"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder={currentLang === 'ar' ? 'الاسم بالإنجليزي' : 'Name (English)'}
                  />
                </div>
              ) : (
                <h1 className="font-display text-2xl sm:text-3xl md:text-[2.25rem] text-[#0E2A2E] leading-none">
                  {displayName}
                </h1>
              )}
            </div>

            {isEditing ? (
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 bg-[#0E2A2E] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#2D6A4F] disabled:opacity-60"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{currentLang === 'ar' ? 'حفظ' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 border border-[#0E2A2E]/20 text-[#0E2A2E] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#0E2A2E]/5"
                >
                  <X size={14} /> <span>{currentLang === 'ar' ? 'إلغاء' : 'Cancel'}</span>
                </button>
              </div>
            ) : (
             <button onClick={handleEditClick} className="flex items-center gap-1.5 text-xs uppercase font-semibold text-[#2D6A4F] border-b border-[#2D6A4F]/40 hover:border-[#2D6A4F] pb-0.5 shrink-0">
               <Edit2 size={13} /> <span>{currentLang === 'ar' ? 'تعديل الملف' : 'Edit Profile'}</span>
             </button>
            )}
          </div>

          {/* محتوى الصفحة - الصورة لوحدها يمين/شمال، والنبذة + البيانات مع بعض في العمود التاني */}
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 md:gap-10">

            {/* عمود الصورة فقط */}
            <div className="w-full">
              <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden bg-[#0E2A2E]/5">
                <img src={getImageUrl(doctor?.image)} className="w-full h-full object-cover" alt="Profile" />
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-[#0E2A2E]/60 text-white disabled:opacity-70"
                  >
                    {isUploadingImage ? <Loader2 size={28} className="animate-spin" /> : <Camera size={28} />}
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
              </div>
            </div>

            {/* عمود النبذة + البيانات تحتها */}
            <div className="space-y-8">
              {/* النبذة */}
              <div>
                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[14px] uppercase tracking-wider text-[#0E2A2E]/50 mb-2">
                        {currentLang === 'ar' ? 'نبذة (عربي)' : 'Bio (Arabic)'}
                      </label>
                      <textarea
                        className="w-full border border-[#0E2A2E]/15 focus:border-[#2D6A4F] outline-none rounded-lg p-3 text-sm text-[#0E2A2E] min-h-[100px]"
                        value={formData.bio_ar}
                        onChange={(e) => setFormData({ ...formData, bio_ar: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] uppercase tracking-wider text-[#0E2A2E]/50 mb-2">
                        {currentLang === 'ar' ? 'نبذة (إنجليزي)' : 'Bio (English)'}
                      </label>
                      <textarea
                        className="w-full border border-[#0E2A2E]/15 focus:border-[#2D6A4F] outline-none rounded-lg p-3 text-sm text-[#0E2A2E] min-h-[100px]"
                        value={formData.bio_en}
                        onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-lg text-[#0E2A2E]/80 leading-relaxed">{displayBio}</p>
                )}
              </div>

              {/* البيانات (سنوات الخبرة / السعر / التخصص) - بقت تحت النبذة */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-[#0E2A2E]/10">
                <div>
                  <p className="text-[14px] uppercase tracking-wider text-[#0E2A2E]/50 mb-1">
                    {currentLang === 'ar' ? 'سنوات الخبرة' : 'Years of Experience'}
                  </p>
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-full border-b border-[#2D6A4F]/40 focus:border-[#2D6A4F] outline-none bg-transparent py-1 text-sm text-[#0E2A2E]"
                      value={formData.years_experience}
                      onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-[#0E2A2E] font-medium">{doctor?.years_experience ?? '-'}</p>
                  )}
                </div>

                <div>
                  <p className="text-[14px] uppercase tracking-wider text-[#0E2A2E]/50 mb-1">
                    {currentLang === 'ar' ? 'السعر يبدأ من' : 'Price From'}
                  </p>
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-full border-b border-[#2D6A4F]/40 focus:border-[#2D6A4F] outline-none bg-transparent py-1 text-sm text-[#0E2A2E]"
                      value={formData.price_from}
                      onChange={(e) => setFormData({ ...formData, price_from: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-[#0E2A2E] font-medium">{doctor?.price_from ?? '-'}</p>
                  )}
                </div>

                <div>
                  <p className="text-[14px] uppercase tracking-wider text-[#0E2A2E]/50 mb-1">
                    {currentLang === 'ar' ? 'التخصص' : 'Specialty'}
                  </p>
                  <p className="text-sm text-[#0E2A2E] font-medium">
                    {parseSafe(doctor?.specialty?.name)[currentLang] || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}