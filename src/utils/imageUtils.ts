// src/utils/imageUtils.ts

const CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || "https://res.cloudinary.com/dfgdtlfhg/image/upload/";
const DEFAULT_AVATAR = "/default-avatar.png";
const DEFAULT_PLACEHOLDER = "/placeholder.jpg";

export const getImageUrl = (path?: string | null, type: 'avatar' | 'service' = 'avatar'): string => {
  // 1. التعامل مع القيم الفارغة
  if (!path) return type === 'avatar' ? DEFAULT_AVATAR : DEFAULT_PLACEHOLDER;

  // 2. إذا كان الرابط كاملاً (يبدأ بـ http/https) فهو رابط Cloudinary كامل، نعيده كما هو
  if (path.startsWith('http')) return path;

  // 3. تنظيف المسار من البادئات غير المرغوبة (مثل / أو storage/)
  // ملاحظة: لا نحذف 'specialties/' لأنها جزء من المسار الصحيح على Cloudinary
  let cleanPath = path.replace(/^\//, '').replace(/^storage\//, '');

  // 4. إذا كان النوع 'service'، نتأكد أن المسار لا يحتاج لإضافة مجلدات إضافية
  // هنا نترك المسار كما هو لأنه يأتي جاهزاً من الداتابيز (مثل specialties/xxx.jpg)
  
  return `${CLOUDINARY_BASE_URL}${cleanPath}`;
};