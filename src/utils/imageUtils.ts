// src/utils/imageUtils.ts

const CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || "";
const DEFAULT_AVATAR = "/default-avatar.png";
const DEFAULT_PLACEHOLDER = "/placeholder.jpg";

export const getImageUrl = (path?: string | null, type: 'avatar' | 'service' = 'avatar'): string => {
  if (!path) return type === 'avatar' ? DEFAULT_AVATAR : DEFAULT_PLACEHOLDER;
  if (path.startsWith('http')) return path;

  // 1. استخراج اسم المجلد والملف (مثلاً: doctors/filename.jpg)
  // الـ API يرسل api/storage/doctors/filename.jpg
  // نقوم بحذف كل ما قبل اسم المجلد (doctors أو specialties)
  const parts = path.split('/');
  const folder = parts[parts.length - 2]; // مثل doctors
  const filename = parts[parts.length - 1]; // مثل filename.jpg
  
  const cleanPath = `${folder}/${filename}`;
  
  // 2. إرجاع الرابط الكامل (بدون v1783... لأن Cloudinary سيضيفه تلقائياً)
  return `${CLOUDINARY_BASE_URL}${cleanPath}`;
};