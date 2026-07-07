import { Outlet } from '@tanstack/react-router';
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'sonner'; // استيراد Sonner
import { queryClient } from "./lib/queryClient";
import { LocaleProvider } from "./components/providers/LocaleProvider";
import { Topbar } from "./components/layout/Topbar";
import { Footer } from "./components/layout/Footer"; // استيراد الفوتر
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        {/* Navbar */}
        <Topbar 
          sidebarCollapsed={false} 
          onMobileMenuToggle={() => console.log("Toggle menu")} 
        />
        
        {/* Sonner Toaster: يظهر التنبيهات بشكل أنيق وعصري */}
        <Toaster 
          richColors 
          position="top-center" 
          expand={false} 
          closeButton 
        />
        
        {/* الصفحات */}
        <Outlet /> 
        <Footer />
      </LocaleProvider>
    </QueryClientProvider>
  );
}