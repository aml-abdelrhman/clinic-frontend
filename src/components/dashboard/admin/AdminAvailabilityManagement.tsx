'use client'

import React from 'react'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  useGetDoctorAvailabilityAdmin,
  useAdminDeleteAvailability,
  useGetDoctors,
} from '@/hooks/useQuery'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'

export default function AdminAvailabilityManagement() {
  const { t, i18n } = useTranslation()
  const params = useParams({ from: '/dashboard/admin/work-schedule/$doctorId' })
  const doctorIdParam = params.doctorId
  
  const isAll = doctorIdParam === 'all'
  const doctorId = isAll ? undefined : Number(doctorIdParam)

  const { data: schedule, isLoading, refetch } = useGetDoctorAvailabilityAdmin(doctorId as any)
  const { data: doctors } = useGetDoctors()
  const deleteMutation = useAdminDeleteAvailability()

  const getDoctorName = (id: any) => {
    const doctor = doctors?.find((d: any) => String(d.id) === String(id))
    if (!doctor) return t('admin.unknown')
    
    // التعامل مع الـ JSON الخاص باسم الطبيب
    const nameData = typeof doctor.name === 'string' ? JSON.parse(doctor.name) : doctor.name
    return (i18n.language === 'ar' ? nameData?.ar : nameData?.en) || t('admin.unknown')
  }

  if (isLoading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin w-12 h-12 text-primary" />
    </div>
  )

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#2D6A4F]">
            {t('admin.manage_schedules')} - {isAll ? t('admin.unknown') : getDoctorName(doctorIdParam)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.day')}</TableHead>
                  <TableHead>{t('admin.start_time')}</TableHead>
                  <TableHead>{t('admin.end_time')}</TableHead>
                  <TableHead>{t('admin.status')}</TableHead>
                  <TableHead className="text-center">{t('admin.action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(schedule) && schedule.length > 0 ? (
                  schedule.map((av: any) => (
                    <TableRow key={av.id}>
                      <TableCell className="font-medium">
                        {i18n.language === 'ar' ? av.day_name?.ar : av.day_name?.en}
                      </TableCell>
                      <TableCell>{av.start_time?.substring(0, 5)}</TableCell>
                      <TableCell>{av.end_time?.substring(0, 5)}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {t('admin.available')}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(t('admin.confirm_delete'))) {
                              deleteMutation.mutate(av.id, { onSuccess: () => refetch() })
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {t('admin.no_schedules')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}