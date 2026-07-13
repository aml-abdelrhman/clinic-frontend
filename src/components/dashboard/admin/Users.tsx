'use client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGetUsers, useUpdateUserRole, useDeleteUser } from '@/hooks/useQuery'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, UserCog, Mail } from 'lucide-react'

// تعريف الترجمات هنا مباشرة
const translations = {
  ar: {
    "name": "الاسم",
    "email": "البريد الإلكتروني",
    "role": "الصلاحية",
    "patient": "مريض",
    "doctor": "طبيب",
    "admin": "مدير النظام",
    "admin.manage_users": "إدارة المستخدمين",
    "admin.actions": "الإجراءات",
    "admin.confirm_delete_user": "هل أنت متأكد من حذف هذا المستخدم؟"
  },
  en: {
    "name": "Name",
    "email": "Email",
    "role": "Role",
    "patient": "Patient",
    "doctor": "Doctor",
    "admin": "Admin",
    "admin.manage_users": "Manage Users",
    "admin.actions": "Actions",
    "admin.confirm_delete_user": "Are you sure you want to delete this user?"
  }
};

export default function AdminUsersDashboard() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  
  // دالة مساعدة للترجمة من الكائن المدمج
  const t_local = (key: string) => translations[lang][key as keyof typeof translations['ar']] || key;

  const { data: users, isLoading, refetch } = useGetUsers()
  const { mutate: updateRole } = useUpdateUserRole()
  const { mutate: deleteUser } = useDeleteUser()

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRole({ id: userId, role: newRole }, { onSuccess: () => refetch() })
  }

  const handleDelete = (userId: number) => {
    if (window.confirm(t_local('admin.confirm_delete_user'))) {
      deleteUser(userId, { onSuccess: () => refetch() })
    }
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin h-10 w-10 text-[#2D6A4F]" />
    </div>
  )

  const RoleSelect = ({ user }: { user: any }) => (
    <Select value={user.role} onValueChange={(val) => handleRoleChange(user.id, val)}>
      <SelectTrigger className="w-full sm:w-[150px] border-[#2D6A4F]/20 focus:ring-[#2D6A4F]">
        <SelectValue placeholder={t_local(user.role)} />
      </SelectTrigger>
      <SelectContent className="bg-white border-slate-200 shadow-xl">
        <SelectItem value="patient">{t_local('patient')}</SelectItem>
        <SelectItem value="doctor">{t_local('doctor')}</SelectItem>
        <SelectItem value="admin">{t_local('admin')}</SelectItem>
      </SelectContent>
    </Select>
  )

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <UserCog className="text-[#2D6A4F]" size={28} />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0E2A2E]">{t_local('admin.manage_users')}</h1>
      </div>

      {/* Mobile: Cards */}
      <div className="flex flex-col gap-4 sm:hidden">
        {users?.map((user: any) => (
          <div key={user.id} className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-[#0E2A2E] text-lg">{user.name}</p>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                  <Mail size={14} />
                  <span className="break-all">{user.email}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full shrink-0">
                <Trash2 size={20} />
              </Button>
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-400 mb-1 block">{t_local('role')}</label>
              <RoleSelect user={user} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#2D6A4F] text-white">
                <th className="p-5 font-semibold">{t_local('name')}</th>
                <th className="p-5 font-semibold">{t_local('email')}</th>
                <th className="p-5 font-semibold">{t_local('role')}</th>
                <th className="p-5 font-semibold text-center">{t_local('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user: any) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                  <td className="p-5 font-medium text-[#0E2A2E]">{user.name}</td>
                  <td className="p-5 text-gray-600">{user.email}</td>
                  <td className="p-5"><RoleSelect user={user} /></td>
                  <td className="p-5 text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full">
                      <Trash2 size={20} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}