// components/dashboard/doctor/DoctorLayout.tsx
import { DoctorSidebar } from "./DoctorSidebar";

export const DoctorLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <DoctorSidebar />
      {/* الـ ps-20 و md:ps-64 ستتحرك تلقائياً حسب اللغة بفضل دعم Tailwind لـ RTL */}
      <main className="flex-1 p-4 md:p-8 bg-gray-50 min-h-screen transition-all duration-300 ps-20 md:ps-64">
        {children}
      </main>
    </div>
  );
};