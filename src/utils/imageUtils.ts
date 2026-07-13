// src/utils/imageUtils.ts

const CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || "";
const DEFAULT_AVATAR = "/default-avatar.png";
const DEFAULT_PLACEHOLDER = "/placeholder.jpg";

export const getImageUrl = (path?: string | null, type: 'avatar' | 'service' = 'avatar'): string => {
  if (!path) return type === 'avatar' ? DEFAULT_AVATAR : DEFAULT_PLACEHOLDER;

  // إذا كان الرابط يبدأ بـ http، فهو رابط جاهز (Cloudinary أو غيره)
  if (path.startsWith('http')) return path;

  // تنظيف المسار (إزالة الشرطة في البداية وكلمة storage إن وجدت)
  const cleanPath = path.replace(/^\//, '').replace(/^storage\//, '');
  
  return `${CLOUDINARY_BASE_URL}${cleanPath}`;
};