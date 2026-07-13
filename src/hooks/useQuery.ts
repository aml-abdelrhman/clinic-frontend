import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/axiosInstance'
import { toast } from 'sonner'
import { selectUser, useAuthStore } from '@/stores/useAuthStore'

const AVAILABILITY_KEY = ['doctorAvailability']

// ==========================================================================
// Types
// ==========================================================================

export interface Specialty {
  id: number
  name: { ar: string; en: string }
  slug: string
  image: string | null
  description: { ar: string; en: string }
}

export interface Doctor {
  id: number
  user_id?: number
  specialty_id: number
  name: { ar: string; en: string }
  bio: { ar: string; en: string } | null
  years_experience: number
  rating: number
  image: string | null
  languages: string[]
  price_from: number
  specialty?: Specialty
  services?: Service[]
  availabilities?: {
    day_of_week: number
    start_time: string
    end_time: string
  }[]
}

export interface Service {
  id: number
  doctor_id: number
  name: { ar: string; en: string }
  price: number
  duration_minutes: number
  image_url: string | null
  is_active: boolean
}

// ==========================================================================
// Shared / Public (تخصصات وأطباء - بيانات عامة تستخدمها كل الأدوار)
// ==========================================================================

// جلب كل التخصصات
export const useGetSpecialties = () => {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const res = await api.get('/specialties')
      return res.data as Specialty[]
    },
  })
}

// جلب تخصص واحد عن طريق الـ slug
export const useGetSpecialty = (slug: string) => {
  return useQuery({
    queryKey: ['specialty', slug],
    queryFn: async () => {
      const res = await api.get(`/specialties/${slug}`)
      return res.data as Specialty
    },
    enabled: !!slug,
  })
}

// جلب كل الأطباء مع دعم فلترة اختيارية (تخصص / تقييم)
export const useGetDoctors = (filters?: {
  specialty_id?: number
  rating?: number
}) => {
  return useQuery({
    queryKey: ['doctors', filters],
    queryFn: async () => {
      const res = await api.get('/doctors', { params: filters })
      return res.data as Doctor[]
    },
  })
}

// جلب تفاصيل طبيب واحد بالـ id
export const useGetDoctor = (id: number) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const res = await api.get(`/doctors/${id}`)
      return res.data as Doctor
    },
    enabled: !!id,
  })
}

export const useGetMyDoctorProfile = () => {
  return useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      const res = await api.get('/doctor/profile')
      if (!res?.data?.data) {
        throw new Error('Doctor profile not found in response')
      }
      return res.data.data
    },
  })
}
export const useGetServices = (doctorId?: number) => {
  return useQuery({
    queryKey: ['services', doctorId],
    queryFn: async () => {
      const url = doctorId ? `/services?doctor_id=${doctorId}` : '/services'
      const res = await api.get(url)
      return res.data.data as Service[]
    },
  })
}

// جلب الخدمات مع تخصصاتها المرتبطة
export const useGetServicesWithSpecialties = () => {
  return useQuery({
    queryKey: ['servicesWithSpecs'],
    queryFn: async () => {
      const { data } = await api.get('/services-with-specialties')
      return data.data
    },
  })
}

// جلب المواعيد حسب الدور (patient / doctor / admin)
export const useGetAvailability = (
  role: 'patient' | 'doctor' | 'admin',
  doctorId?: number,
) => {
  return useQuery({
    queryKey: ['availability', role, doctorId],
    queryFn: async () => {
      let url = '/availabilities'
      if (role === 'doctor') url = '/doctor/my-availability'
      if (role === 'admin') url = '/admin/availability'
      const res = await api.get(url, {
        params: doctorId ? { doctor_id: doctorId } : {},
      })
      return res.data
    },
    enabled:
      role === 'doctor' ||
      (role === 'patient' && !!doctorId) ||
      role === 'admin',
  })
}

// حذف ميعاد معين (تعمل للطبيب أو للأدمن حسب الـ role الممرر)
export const useDeleteAvailability = (role: 'doctor' | 'admin') => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number | string) => {
      const url =
        role === 'admin'
          ? `/admin/availability/${id}`
          : `/doctor/availability/${id}`
      const response = await api.delete(url)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      toast.success('تم حذف الموعد بنجاح')
    },
    onError: (error: any) => {
      toast.error('فشل حذف الموعد')
    },
  })
}

// ==========================================================================
// User / Patient (حجوزات، تقييمات، مفضلة)
// ==========================================================================

// جلب مواعيد المستخدم الحالي
export const useGetMyAppointments = (options?: any) => {
  return useQuery({
    queryKey: ['my-appointments'],
    queryFn: () => api.get('/my-appointments').then((res) => res.data),
    ...options,
  })
}

// إنشاء حجز جديد
export const useCreateAppointment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/appointments', data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] }),
  })
}

// إلغاء موعد
export const useCancelAppointment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.put(`/appointments/${id}/cancel`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] }),
  })
}

// إضافة تقييم لطبيب بعد الحجز
export const useAddReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/reviews', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] })
    },
  })
}

// إضافة/حذف طبيب من المفضلة
export const useToggleFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (doctorId: number) => api.post(`/favorites/${doctorId}`),
    onMutate: async (doctorId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

// جلب قائمة المفضلة الخاصة بالمستخدم
export const useGetFavorites = () => {
  const user = useAuthStore(selectUser)
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const res = await api.get('/favorites')
      return res.data
    },
    enabled: !!user?.id && !!token,
    staleTime: 1000 * 60 * 5,
  })
}


// ==========================================
// Doctor Self-Profile Hooks (داشبورد الطبيب لنفسه)
// ==========================================

export const useUpdateDoctordata = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      api.post(`/doctor/profile/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] })
    },
    onError: (error: any) => {
      console.error('Update doctor data error:', error.response?.data || error.message)
    },
  })
}

/**
 * تحديث صورة الطبيب فقط
 */
export const useUpdateDoctorImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      api.post(`/doctor/profile/${id}/image`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] })
    },
    onError: (error: any) => {
      console.error('Update doctor image error:', error.response?.data || error.message)
    },
  })
}
// جلب خدمات الطبيب الحالي (من التوكن)
export const useGetDoctorServices = () => {
  return useQuery({
    queryKey: ['doctorServices'],
    queryFn: async () => {
      const token = useAuthStore.getState().token

      const response = await api.get('/doctor/services', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      return response.data
    },
    enabled: !!useAuthStore.getState().token,
  })
}

// حذف خدمة تابعة للطبيب الحالي
export const useRemovedoctorService = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (serviceId: number | string) => {
      const response = await api.delete(`/doctor/services/${serviceId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorServices'] })
    },
    onError: (error) => {
      console.error('Error deleting service:', error)
    },
  })
}

// تحديث خدمة تابعة للطبيب الحالي
export const useUpdatedoctorService = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: number | string
      formData: FormData
    }) => {
      if (!formData.has('_method')) {
        formData.append('_method', 'PUT')
      }

      const response = await api.post(`/doctor/services/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorServices'] })
    },
  })
}

// جلب خدمة واحدة تابعة للطبيب الحالي
export const useGetSingleService = (id: string | number) => {
  return useQuery({
    queryKey: ['doctorService', id],
    queryFn: async () => {
      const response = await api.get(`/doctor/services/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

// إضافة خدمة جديدة للطبيب الحالي
export const useAddDoctorService = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/doctor/services', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorServices'] })
    },
  })
}

// تحديث جدول المواعيد الأسبوعي للطبيب
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (schedule: any[]) => {
      const response = await api.post('/doctor/update-schedule', { schedule })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'doctor'] })
      toast.success('تم تحديث الجدول بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل تحديث الجدول')
    },
  })
}

// جلب مواعيد الطبيب الحالي (من التوكن مباشرة)
export const useGetMyAvailability = () => {
  return useQuery({
    queryKey: ['my-availability'],
    queryFn: async () => {
      const token = useAuthStore.getState().token
      console.log('🚀 جاري محاولة جلب مواعيد الطبيب...')
      console.log('🔑 التوكن المستخدم:', token)

      try {
        const response = await api.get('/doctor/my-availability', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })

        console.log('✅ استجابة السيرفر ناجحة:', response.data)
        return response.data
      } catch (error: any) {
        console.error('❌ فشل الطلب! تفاصيل الخطأ:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          headers: error.config?.headers,
        })
        throw error
      }
    },
    enabled: !!useAuthStore.getState().token,
  })
}

// تحديث جدول مواعيد الطبيب الحالي بالكامل
export const useUpdateMySchedule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (schedule: any[]) => {
      return await api.post('/doctor/update-schedule', { schedule })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-availability'] })
      toast.success('تم تحديث الجدول بنجاح')
    },
    onError: (error: any) => {
      console.error('خطأ تحديث الجدول:', error.response?.data || error.message)
      toast.error('فشل تحديث الجدول')
    },
  })
}

// تحديث ميعاد فردي للطبيب الحالي
export const useUpdateAvailability = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      start_time,
      end_time,
    }: {
      id: number
      start_time: string
      end_time: string
    }) => {
      const response = await api.put(`/doctor/availability/${id}`, {
        start_time,
        end_time,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAvailability'] })
      queryClient.refetchQueries({ queryKey: ['doctorAvailability'] })
    },
  })
}

// إضافة ميعاد جديد للطبيب الحالي
export const useAddAvailability = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      day_of_week: number
      start_time: string
      end_time: string
    }) => {
      const response = await api.post('/doctor/availability', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAvailability'] })
      queryClient.refetchQueries({ queryKey: ['doctorAvailability'] })
    },
  })
}

// حذف ميعاد للطبيب الحالي
export const useDeleteMyAvailability = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/doctor/availability/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAvailability'] })
      queryClient.refetchQueries({ queryKey: ['doctorAvailability'] })
    },
  })
}

// إنهاء موعد من طرف الطبيب
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.post(`/doctor/appointments/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] })
    },
  })
}

// جلب مواعيد/حجوزات الطبيب الحالي
export const useGetDoctorAppointments = () => {
  return useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: () => api.get('/doctor/appointments').then((res) => res.data),
  })
}

// تحديث حالة حجز (تأكيد أو إلغاء) من طرف الطبيب
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(
        `/doctor/appointments/${id}/${status === 'cancelled' ? 'cancel' : 'confirm'}`,
        { status },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] }),
  })
}

// جلب تقييمات الطبيب الحالي
export const useGetDoctorReviews = () => {
  return useQuery({
    queryKey: ['doctor-reviews'],
    queryFn: async () => {
      try {
        const response = await api.get('/doctor/reviews')
        return response.data
      } catch (error: any) {
        console.group('❌ Error Diagnoses')
        console.error('Message:', error.message)
        console.error('Status:', error.response?.status)
        console.error('Full URL Attempted:', error.config?.url)
        console.error('Response Data:', error.response?.data)
        console.groupEnd()

        throw error
      }
    },
  })
}

// ==========================================================================
// Admin (إدارة التخصصات، الأطباء، الخدمات، المواعيد، الحجوزات، التقييمات، الإحصائيات)
// ==========================================================================
// جلب قائمة كل المستخدمين (للأدمن)
export const useGetUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const token = useAuthStore.getState().token
      const response = await api.get('/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      return response.data
    },
  })
}

// تحديث دور المستخدم (للأدمن)
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const token = useAuthStore.getState().token
      return await api.put(
        `/admin/users/${id}/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      )
    },
    onSuccess: () => {
      // تحديث قائمة المستخدمين بعد تغيير الرول
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// حذف مستخدم (للأدمن)
export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const token = useAuthStore.getState().token
      // تأكدي أن الرابط يبدأ بـ /api/admin/users/ وليس admin/admin/users/
      return await api.delete(`/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err) => {
      console.error("خطأ في الحذف:", err);
    }
  })
}

// إضافة تخصص جديد
export const useAddSpecialty = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/admin/specialties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] })
      toast.success('تمت إضافة التخصص بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء الإضافة')
    },
  })
}

// تحديث تخصص موجود
export const useUpdateSpecialty = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
api.post(`/admin/specialties/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] })
      toast.success('تم تحديث التخصص بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل التحديث')
    },
  })
}

// حذف تخصص
export const useDeleteSpecialty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, force = false }: { id: number; force?: boolean }) => 
      api.delete(`/admin/specialties/${id}${force ? '?force=1' : ''}`),
      
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
    },
    onError: (error: any) => {
      // نتركها فارغة لنلتقط الخطأ في الـ Component
    },
  });
};

// إضافة طبيب جديد
export const useAddDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/admin/doctors', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('تم إضافة الطبيب بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل إضافة الطبيب')
    },
  })
}

// تحديث بيانات طبيب
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => {
      if (!formData.has('_method')) {
        formData.append('_method', 'PUT')
      }

      return api.post(`/admin/doctors/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('تم تحديث بيانات الطبيب بنجاح')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'فشل التحديث'
      toast.error(message)

      if (error.response?.data?.errors) {
        console.error('Validation Errors:', error.response.data.errors)
      }
    },
  })
}

// حذف طبيب
export const useDeleteDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/admin/doctors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('تم حذف الطبيب من النظام')
    },
    onError: (error: any) => {
      toast.error('فشل عملية الحذف')
    },
  })
}

// جلب خدمة واحدة بمعرفها (للأدمن)
export const useGetServiceById = (id: string | number) => {
  return useQuery({
    queryKey: ['doctor-services', id],
    queryFn: async () => {
      const res = await api.get(`/admin/doctor-services/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

// إضافة خدمة جديدة
export const useCreateService = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/admin/services', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('تمت إضافة الخدمة بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل إضافة الخدمة')
    },
  })
}

// تحديث خدمة موجودة
export const useUpdateService = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => {
      if (!data.has('_method')) {
        data.append('_method', 'PUT')
      }
      return api.post(`/admin/services/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('تم التحديث بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل التحديث')
    },
  })
}

// حذف خدمة
export const useDeleteService = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/admin/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('تم حذف الخدمة')
    },
    onError: (error: any) => {
      toast.error('فشل الحذف')
    },
  })
}

// جلب كل خدمات الأطباء (للأدمن)
export const useGetDoctorServicestoadmin = () => {
  return useQuery({
    queryKey: ['doctor-services'],
    queryFn: async () => {
      const res = await api.get('/admin/doctor-services')
      return res.data.data
    },
  })
}

// جلب مواعيد طبيب معين (للأدمن)
export const useGetDoctorAvailabilityAdmin = (doctorId: number | null) => {
  return useQuery({
    queryKey: ['admin-doctor-availability', doctorId],
    queryFn: async () => {
      const token = useAuthStore.getState().token
      const response = await api.get(
        `/admin/availability?doctor_id=${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      )
      return response.data
    },
    enabled: !!doctorId,
  })
}

// حذف أي ميعاد (للأدمن)
export const useAdminDeleteAvailability = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => {
      const token = useAuthStore.getState().token
      return api.delete(`/admin/availability/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['admin-doctor-availability'],
      }),
  })
}

// جلب كل الحجوزات (للأدمن)
export const useGetAdminAppointments = () => {
  return useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const { data } = await api.get('/admin/appointments')
      return data
    },
  })
}

// حذف حجز (للأدمن)
export const useDeleteAdminAppointment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/admin/appointments/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] })
    },
  })
}

// جلب كل التقييمات (للأدمن)
export const useGetAdminReviews = () => {
  return useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => api.get('/admin/reviews').then((res) => res.data),
  })
}

// حذف تقييم (للأدمن)
export const useDeleteReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    },
  })
}

export const useGetAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard-stats');
      return data.data;
    }
  });
};
 