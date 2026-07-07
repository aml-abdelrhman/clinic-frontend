import { AdminSidebar } from "./AdminSidebar";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      {/* الـ Sidebar ثابت ومثبت في الجانب */}
      <AdminSidebar />
      
      {/* ps-20: مساحة للمحتوى من جهة البداية (يمين في العربية، يسار في الإنجليزية) للموبايل 
        md:ps-64: مساحة أكبر للشاشات الكبيرة لتتناسب مع عرض الـ Sidebar 
      */}
      <main className="flex-1 p-4 md:p-8 bg-gray-50 min-h-screen transition-all duration-300 ps-20 md:ps-64">
        {children}
      </main>
    </div>
  );
};