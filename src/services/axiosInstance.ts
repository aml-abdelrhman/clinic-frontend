import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../stores/useAuthStore'
import { toast } from 'sonner' // استيراد التوست

// جلب الرابط من ملف الـ env الخاص بـ Next.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Interceptor لإضافة التوكن
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * معالجة الأخطاء
 */
const handleResponseError = async (error: AxiosError) => {
  const status = error.response?.status

  if (status === 401) {
    const { logout } = useAuthStore.getState()

    // إظهار التنبيه للمستخدم
    toast.error('برجاء تسجيل الدخول لتتمكن من حجز الموعد', { duration: 2000 })

    // تأخير التوجيه لمدة 1.5 ثانية لضمان ظهور التوست وقراءتها
    setTimeout(() => {
      logout()
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        window.location.href = '/login'
      }
    }, 2500)
  }

  if (status === 403) {
    console.error(
      '❌ Access Denied: You do not have permission for this action.',
    )
  }

  return Promise.reject(error)
}

api.interceptors.response.use((r) => r, handleResponseError)

export default api
