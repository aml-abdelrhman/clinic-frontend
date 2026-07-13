export const getImageUrl = (path?: string | null): string => {
  // إذا كانت القيمة فارغة، نرجع الصورة الافتراضية
  if (!path) return '/default-avatar.png';
  
  // إذا كان الرابط جاهزاً (بدأ بـ http)، نرجعه كما هو
  if (path.startsWith('http')) return path;

  // تنظيف المسار: إزالة أي بادئات زائدة قد يرسلها الـ API
  // هذا يضمن أننا نأخذ فقط اسم المجلد والملف (مثلاً doctors/name.jpg)
  const cleanPath = path
    .replace(/^api\/storage\//, '')
    .replace(/^storage\//, '')
    .replace(/^\//, '');

  // دمج مع الرابط الأساسي
  return `${import.meta.env.VITE_CLOUDINARY_BASE_URL || "https://res.cloudinary.com/dfgdtlfhg/image/upload/"}${cleanPath}`;
};