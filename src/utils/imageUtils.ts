// src/utils/imageUtils.ts

const CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || "";
const DEFAULT_AVATAR = "/default-avatar.png";
const DEFAULT_PLACEHOLDER = "/placeholder.jpg";

export const getImageUrl = (path?: string | null): string => {
  if (!path) return '/default-avatar.png';
  
  // إذا كان الرابط جاهزاً، لا نفعل شيئاً
  if (path.startsWith('http')) return path;

  // تنظيف المسار
  const cleanPath = path
    .replace(/^api\/storage\//, '')
    .replace(/^storage\//, '')
    .replace(/^\//, '');
  
  const finalUrl = `${import.meta.env.VITE_CLOUDINARY_BASE_URL || "https://res.cloudinary.com/dfgdtlfhg/image/upload/"}${cleanPath}`;
  
  // هذا السطر سيخبرك بالمسار الذي يحاول المتصفح تحميله
  console.log("🛠️ Image Path Analysis:", { original: path, final: finalUrl });
  
  return finalUrl;
};