'use client';

import React from "react";
import { useTranslation } from "react-i18next";
import { useGetDoctorServices, useRemovedoctorService } from "@/hooks/useQuery"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash, Plus } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return '/default-service.png';
  if (path.startsWith('http')) return path;
 const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '');
  const cleanPath = path.replace(/^storage\//, '');
  
  return `${baseUrl}/storage/${cleanPath}`;
};
export default function DoctorServicesDashboard() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  
  const { data: services = [], isLoading } = useGetDoctorServices();
  const deleteService = useRemovedoctorService();

  const getLocalized = (data: any) => {
    if (typeof data === 'string' && data.startsWith('{')) {
      try { return JSON.parse(data); } catch (e) { return { ar: data, en: data }; }
    }
    return data || { ar: "", en: "" };
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin w-10 h-10 text-[#2D6A4F]" />
    </div>
  );

  return (
    <div className={`pt-24 px-4 md:px-8 pb-12 w-full max-w-6xl mx-auto ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{t('my_medical_services')}</h1>
        <Button className="bg-[#2D6A4F]" onClick={() => router.navigate({ to: '/dashboard/doctor/my-services/add' })}>
          <Plus className="ml-2 w-4 h-4" /> {t('add_service')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('services_list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('image')}</TableHead>
                  <TableHead>{t('service_name')}</TableHead>
                  <TableHead>{t('price')}</TableHead>
                  <TableHead>{t('duration')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-center">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service: any) => {
                  const name = getLocalized(service.name);
                  const imageUrl = getImageUrl(service.image_url);
                  
                  return (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg overflow-hidden border bg-slate-50">
                          <img 
                            src={imageUrl} 
                            className="w-full h-full object-cover" 
                            alt="Service" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/default-service.png';
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{name[i18n.language] || name.ar}</TableCell>
                      <TableCell>{service.price} {t('currency')}</TableCell>
                      <TableCell>{service.duration_minutes} {t('min')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {service.is_active ? t('active') : t('inactive')}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.navigate({ to: `/dashboard/doctor/my-services/edit/${service.id}` })}>
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { if(confirm(t('confirm_delete'))) { deleteService.mutate(service.id); } }}>
                            <Trash className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <footer className="text-center mt-12 py-6 border-t text-sm text-gray-500">
        Doctor Dashboard © 2026
      </footer>
    </div>
  );
}