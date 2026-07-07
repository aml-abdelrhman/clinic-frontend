'use client'

import React, { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  useGetServices,
  useDeleteService,
  useUpdateService,
  useGetDoctors,
  useGetSpecialties,
} from '@/hooks/useQuery'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash, Edit, Loader2 } from 'lucide-react'

export default function AdminServicesManagement() {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: services = [], isLoading, error } = useGetServices()
  const { data: doctors } = useGetDoctors()
  const { data: specialties } = useGetSpecialties()

  const deleteService = useDeleteService()
  const updateService = useUpdateService()

  const filteredServices = useMemo(() => {
    return services.filter((s: any) => {
      const doctor = doctors?.find((d: any) => d.id === s.doctor_id)

      let serviceName = s.name
      if (typeof serviceName === 'string' && serviceName.startsWith('{')) {
        try {
          serviceName = JSON.parse(serviceName)
        } catch (e) {}
      }
      const nameAr =
        (typeof serviceName === 'object' && serviceName !== null
          ? serviceName.ar
          : serviceName
        )?.toLowerCase() || ''

      const matchesSearch = nameAr.includes(searchTerm.toLowerCase())
      const matchesSpecialty =
        specialtyFilter === 'all' ||
        (doctor && doctor.specialty_id?.toString() === specialtyFilter)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? !!s.is_active : !s.is_active)

      return matchesSearch && matchesSpecialty && matchesStatus
    })
  }, [services, doctors, searchTerm, specialtyFilter, statusFilter])

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    const formData = new FormData()
    formData.append('is_active', currentStatus ? '0' : '1')
    formData.append('_method', 'PUT')
    updateService.mutate({ id, data: formData })
  }

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-12 h-12 text-[#2D6A4F]" />
      </div>
    )

  if (error)
    return (
      <div className="p-10 text-center text-red-600">
        حدث خطأ في تحميل البيانات.
      </div>
    )

  return (
    <div className="pt-24 px-8 pb-12 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة الخدمات الطبية</h1>
        <Button
          onClick={() => navigate({ to: '/dashboard/admin/services/add' })}
          className="bg-[#2D6A4F]"
        >
          <Plus className="ml-2" /> إضافة خدمة
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row gap-4 items-center">
          <Input
            placeholder="بحث باسم الخدمة..."
            className="w-64"
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="w-48 bg-[#2D6A4F] text-white border-none shadow-md hover:bg-[#1B4332]">
              <SelectValue placeholder="التخصص" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">كل التخصصات</SelectItem>
              {specialties?.map((s: any) => {
                let specName: any = s.name
                if (typeof specName === 'string' && specName.startsWith('{'))
                  try {
                    specName = JSON.parse(specName)
                  } catch (e) {}
                return (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {typeof specName === 'object' && specName !== null
                      ? specName.ar
                      : specName}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الصورة</TableHead>
                <TableHead>الخدمة</TableHead>
                <TableHead>الطبيب</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-center">تحكم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service: any) => {
                let serviceName = service.name
                if (
                  typeof serviceName === 'string' &&
                  serviceName.startsWith('{')
                )
                  try {
                    serviceName = JSON.parse(serviceName)
                  } catch (e) {}

                const doctor = doctors?.find(
                  (d: any) => d.id === service.doctor_id,
                )
                let docName: any = doctor?.name
                if (typeof docName === 'string' && docName.startsWith('{'))
                  try {
                    docName = JSON.parse(docName)
                  } catch (e) {}

                return (
                  <TableRow key={`row-${service.id}`}>
                    <TableCell>
                      <img
                        src={
                          service.image_url ||
                          (service.image
                            ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')}/storage/${service.image}`
                            : '/default-service.png')
                        }
                        className="w-16 h-16 rounded-xl object-cover"
                      />{' '}
                    </TableCell>
                    <TableCell className="font-bold">
                      {typeof serviceName === 'object' && serviceName !== null
                        ? serviceName.ar
                        : serviceName}
                    </TableCell>
                    <TableCell>
                      {typeof docName === 'object' && docName !== null
                        ? docName.ar
                        : docName || 'غير معروف'}
                    </TableCell>
                    <TableCell>{service.price} ج.م</TableCell>
                    <TableCell>
                      <Switch
                        checked={!!service.is_active}
                        onCheckedChange={() =>
                          handleToggleStatus(service.id, !!service.is_active)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate({
                            to: `/dashboard/admin/services/edit/${service.id}`,
                          })
                        }
                      >
                        <Edit className="text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من الحذف؟'))
                            deleteService.mutate(service.id)
                        }}
                      >
                        <Trash className="text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
