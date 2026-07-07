import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import App from './App';

import { AboutDetails } from '@/pages/medical/landing-pages/AboutPage'; // تأكدي من المسار

import { LoginPage } from './pages/auth/LoginPage';
import { LandingPages } from '@/pages/medical/landing-pages/landingpages'; 
import { RegisterPage } from './pages/auth/RegisterPage';
import { FavoritesIcon } from '@/pages/medical/favorites';

import AdminDashboard from '@/components/dashboard/admin/page';
import AdminDoctorsDashboard from '@/components/dashboard/admin/AdminDoctorsDashboard';
import { AdminLayout } from '@/components/dashboard/admin/AdminLayout';
import AdminSpecialtiesDashboard from '@/components/dashboard/admin/Admin-specialities';
import AdminServicesTable from '@/components/dashboard/admin/AdminServicesTable';
import AddServicePage from '@/components/dashboard/admin/AddServicePage';
import EditServicePage from '@/components/dashboard/admin/EditService'; // تأكدي من المسار الصحيح
import AdminAvailabilityManagement from '@/components/dashboard/admin/AdminAvailabilityManagement';
import AdminAppointments from '@/components/dashboard/admin/AdminAppointments';
import AdminReviews from '@/components/dashboard/admin/AdminReviews';

import DoctorDashboard from '@/components/dashboard/doctor/page';
import PatientDashboard from '@/components/dashboard/patient/page';
import SpecialtyPage from '@/pages/medical/specialties/[slug]/page';
import { DoctorDetails } from './pages/medical/landing-pages/doctor-details'
import { DoctorsList } from '@/pages/medical/landing-pages/doctors';
import DoctorServicesDashboard from "@/components/dashboard/doctor/DoctorMyServices";
import { DoctorLayout } from '@/components/dashboard/doctor/DoctorLayout';
import DoctorAddService from "@/components/dashboard/doctor/DoctorAddService";
import DoctorEditService from "@/components/dashboard/doctor/EditServicePage";
import DoctorAvailabilityDashboard from "@/components/dashboard/doctor/DoctorAvailabilityDashboard";
import DoctorAppointments from '@/components/dashboard/doctor/DoctorAppointments'; // تأكدي من مسار الاستيراد
import DoctorReviews from '@/components/dashboard/doctor/DoctorReviews';

import { ServicesSection } from '@/pages/medical/landing-pages/ServicesSection'; // تأكدي من المسار
import { ServiceDetailsPage } from '@/pages/medical/landing-pages/ServiceDetailsPage' // تأكدي من المسار

const rootRoute = createRootRoute({
  component: App,
});


const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/AboutPage', // هذا يطابق الـ to="/about" في الـ Link
  component: AboutDetails,
});

// 1. المسارات العامة
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: LandingPages });
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', component: RegisterPage });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage });
const favoritesRoute = createRoute({ 
  getParentRoute: () => rootRoute, 
  path: '/favorites', 
  component: FavoritesIcon 
});

const servicesPageListRoute = createRoute({ 
  getParentRoute: () => rootRoute, 
  path: '/services', 
  component: ServicesSection 
});


// 2. تخطيط الأدمن (Admin Layout)
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dashboard/admin',
  component: () => <AdminLayout><Outlet /></AdminLayout>,
});

// المسارات الفرعية للأدمن (أبناء الـ adminLayoutRoute)
const adminDashboardRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/', component: AdminDashboard });
const adminDoctorsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: 'doctors', component: AdminDoctorsDashboard });
const adminSpecialtiesRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: 'specialties', component: AdminSpecialtiesDashboard });
const adminServicesRoute = createRoute({ 
  getParentRoute: () => adminLayoutRoute, 
  path: 'services', 
  component: AdminServicesTable // تأكدي أن الاسم هنا يطابق ما تم استيراده
});

const addServiceRoute = createRoute({ 
  getParentRoute: () => adminLayoutRoute, 
  path: 'services/add', 
  component: AddServicePage 
});

// في ملف router.tsx
const editServiceRoute = createRoute({ 
  getParentRoute: () => adminLayoutRoute, 
  path: 'services/edit/$id', // عدليها لتصبح هكذا
  component: EditServicePage 
});

export const adminAppointmentsRoute = createRoute ({
  getParentRoute: () => adminLayoutRoute,
  path: 'appointments',
  component: AdminAppointments,
});

export const adminReviewsRoute = createRoute ({
  getParentRoute: () => adminLayoutRoute,
  path: 'reviews', // هنا فقط الجزء الفرعي
  component: AdminReviews,
});

// تأكدي أن التعريف بهذا الشكل:
 export const doctorScheduleRoute = createRoute({ 
  getParentRoute: () => adminLayoutRoute, 
  path: 'work-schedule/$doctorId', // بدون سلاش في البداية
  component: AdminAvailabilityManagement 
});

// 3. مسارات أخرى
const doctorRoute = createRoute({ getParentRoute: () => rootRoute, path: '/dashboard/doctor', component: DoctorDashboard });
const patientRoute = createRoute({ getParentRoute: () => rootRoute, path: '/dashboard/patient', component: PatientDashboard });
const specialtiesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/specialties', component: () => <div>قائمة التخصصات</div> });
const specialtyDetailsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/specialties/$slug', component: SpecialtyPage });

const doctorsListRoute = createRoute({ getParentRoute: () => rootRoute, path: '/medical/doctors', component: DoctorsList });
const doctorDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'medical/doctors/$slug',
  component: DoctorDetails, // هنا نربط الرابط بالملف
});


const doctorLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dashboard/doctor',
  component: () => <DoctorLayout><Outlet /></DoctorLayout>,
});

// مسارات الطبيب الفرعية (أبناء الـ doctorLayoutRoute)
const doctorDashboardRoute = createRoute({ 
  getParentRoute: () => doctorLayoutRoute, 
  path: '/', 
  component: DoctorDashboard 
});

const doctorServicesRoute = createRoute({ 
  getParentRoute: () => doctorLayoutRoute, 
  path: 'my-services', 
  component: DoctorServicesDashboard 
});

const addDoctorServiceRoute = createRoute({ 
  getParentRoute: () => doctorLayoutRoute, 
  path: 'my-services/add', 
  component: DoctorAddService // تأكدي من استيراد هذه الصفحة
});

const editDoctorServiceRoute = createRoute({ 
  getParentRoute: () => doctorLayoutRoute, 
  path: 'my-services/edit/$id', 
  component: DoctorEditService // تأكدي من استيراد هذه الصفحة
});


const serviceDetailsRoute = createRoute({ 
  getParentRoute: () => rootRoute, 
  path: 'services/$id', 
  component: ServiceDetailsPage 
});

const doctorAvailabilityRoute = createRoute({
  getParentRoute: () => doctorLayoutRoute,
  path: 'availability',
  component: DoctorAvailabilityDashboard, // تأكدي من عمل import للمكون هنا
});

const doctorAppointmentsRoute = createRoute({
  getParentRoute: () => doctorLayoutRoute,
  path: 'appointments', // سيصبح المسار كاملاً: /dashboard/doctor/appointments
  component: DoctorAppointments, 
});

const doctorReviewsRoute = createRoute({
  getParentRoute: () => doctorLayoutRoute,
  path: 'reviews', // رابط ثابت ونظيف: /dashboard/doctor/reviews
  component: DoctorReviews, // سنمرر الـ ID داخل المكون نفسه
});

// 4. تجميع الروتر
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    aboutRoute,
    registerRoute,
    loginRoute,
    servicesPageListRoute,
    favoritesRoute,
    adminLayoutRoute.addChildren([
      adminDashboardRoute,
      adminDoctorsRoute,
      adminSpecialtiesRoute,
      adminServicesRoute,
      addServiceRoute,
      editServiceRoute,
      doctorScheduleRoute,
      adminAppointmentsRoute,
      adminReviewsRoute
    ]),
    doctorLayoutRoute.addChildren([
        doctorDashboardRoute,
        doctorServicesRoute,
        addDoctorServiceRoute,    // أضيفيها هنا
    editDoctorServiceRoute,
        doctorAvailabilityRoute,
        doctorAppointmentsRoute,
        doctorReviewsRoute
    ]),
    // doctorRoute,
    patientRoute,
    specialtiesRoute,
    specialtyDetailsRoute,
    doctorDetailsRoute,
    doctorsListRoute,
    serviceDetailsRoute
    // doctorServicesRoute
  ]),
});

declare module '@tanstack/react-router' {
  interface Register { router: typeof router; }
}