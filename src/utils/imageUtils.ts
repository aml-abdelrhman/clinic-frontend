// src/utils/imageUtils.ts

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dfgdtlfhg/image/upload/";
const VERSION = "v1783976785/"; // رقم الإصدار الذي يعمل مع صورك
const DEFAULT_AVATAR = "/default-avatar.png";
const DEFAULT_PLACEHOLDER = "/placeholder.jpg";

export const getImageUrl = (path?: string | null, type: 'avatar' | 'service' = 'avatar'): string => {
  // 1. إذا لم يوجد مسار، نرجع الصورة الافتراضية
  if (!path) return type === 'avatar' ? DEFAULT_AVATAR : DEFAULT_PLACEHOLDER;

  // 2. إذا كان الرابط كاملاً، نرجعه كما هو
  if (path.startsWith('http')) return path;

  // 3. تنظيف المسار من أي إضافات قديمة
  const cleanPath = path.replace(/^\//, '').replace(/^storage\//, '');

  // 4. دمج الرابط الأساسي + رقم الإصدار + المسار
  // النتيجة ستكون: https://res.cloudinary.com/dfgdtlfhg/image/upload/v1783976785/specialties/xxx.jpg
  return `${CLOUDINARY_BASE_URL}${VERSION}${cleanPath}`;
};