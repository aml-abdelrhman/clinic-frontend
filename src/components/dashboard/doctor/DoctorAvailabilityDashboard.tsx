'use client';

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetMyAvailability, useDeleteMyAvailability, useUpdateAvailability, useAddAvailability } from "@/hooks/useQuery";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Trash, Calendar, Edit, Check, X, Plus, Clock, Stethoscope } from "lucide-react";

// أسماء أيام الأسبوع + نصوص الصفحة كلها هنا مباشرة حسب اللغة
// بدل الاعتماد على ملفات ترجمة خارجية (زي t('days.sunday'))
const TEXTS = {
  ar: {
    title: 'مواعيدي المتاحة',
    add_new: 'إضافة موعد جديد',
    day: 'اليوم',
    start: 'من الساعة',
    end: 'إلى الساعة',
    add: 'إضافة',
    actions: 'الإجراءات',
    error_exists: 'هذا الموعد مسجل بالفعل لنفس اليوم',
    confirm_delete: 'هل أنتِ متأكدة من حذف هذا الموعد؟',
    days: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  },
  en: {
    title: 'My Availability',
    add_new: 'Add New Slot',
    day: 'Day',
    start: 'Start',
    end: 'End',
    add: 'Add',
    actions: 'Actions',
    error_exists: 'This slot already exists for this day',
    confirm_delete: 'Are you sure you want to delete this slot?',
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
};

export default function DoctorAvailabilityDashboard() {
  const { i18n } = useTranslation();
  const lang = (i18n.language === 'ar' ? 'ar' : 'en') as 'ar' | 'en';
  const tx = TEXTS[lang];

  // المصفوفة معرفة من TEXTS مباشرة، مش من ملفات ترجمة خارجية
  const days = tx.days.map((label, id) => ({ id, label }));

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ start_time: "", end_time: "" });
  const [addForm, setAddForm] = useState({ day_of_week: "0", start_time: "09:00", end_time: "17:00" });

  const { data: schedule = [], isLoading, refetch, isFetching } = useGetMyAvailability();

  const deleteMutation = useDeleteMyAvailability();
  const updateMutation = useUpdateAvailability();
  const addMutation = useAddAvailability();

  const isSlotExists = (day: number, start: string, excludeId?: number) => {
    return schedule.some(
      (s: any) =>
        s.day_of_week === day &&
        s.start_time.substring(0, 5) === start &&
        s.id !== excludeId
    );
  };

  const handleAdd = () => {
    const day = parseInt(addForm.day_of_week);
    const exists = schedule.some(
      (s: any) => Number(s.day_of_week) === day && s.start_time.substring(0, 5) === addForm.start_time.substring(0, 5)
    );

    if (exists) {
      alert(tx.error_exists);
      return;
    }

    addMutation.mutate({ ...addForm, day_of_week: day }, { onSuccess: () => refetch() });
  };

  const saveEdit = async (id: number) => {
    const currentSlot = schedule.find((s: any) => s.id === id);
    if (isSlotExists(currentSlot.day_of_week, editForm.start_time, id)) {
      alert(tx.error_exists);
      return;
    }
    updateMutation.mutate({ id, ...editForm }, { onSuccess: () => { setEditingId(null); refetch(); } });
  };

  const TimeInput = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
      <input
        type={isFocused ? "time" : "text"}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm text-center"
        style={{ direction: "ltr", fontFamily: "monospace" }}
      />
    );
  };

  return (
    <div className={`pt-24 px-4 w-full max-w-5xl mx-auto ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-emerald-700">
          <Stethoscope className="w-8 h-8" /> {tx.title}
        </h1>
        <Button variant="outline" onClick={() => i18n.changeLanguage(lang === 'ar' ? 'en' : 'ar')}>
          <Globe className="w-4 h-4 mr-2" /> {lang === 'ar' ? 'English' : 'العربية'}
        </Button>
      </div>

      <Card className="mb-8 border-t-4 border-t-emerald-500 shadow-md">
        <CardHeader><CardTitle className="text-emerald-600 flex items-center gap-2"><Calendar className="w-5 h-5"/> {tx.add_new}</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{tx.day}</label>
            <select value={addForm.day_of_week} onChange={(e) => setAddForm({...addForm, day_of_week: e.target.value})} className="border rounded-md px-3 py-2 w-40 h-10">
              {days.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{tx.start}</label>
            <TimeInput value={addForm.start_time} onChange={(v) => setAddForm({...addForm, start_time: v})} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{tx.end}</label>
            <TimeInput value={addForm.end_time} onChange={(v) => setAddForm({...addForm, end_time: v})} />
          </div>
          <Button onClick={handleAdd} disabled={addMutation.isPending} className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white">
            {addMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4 mr-1" />}
            {tx.add}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-emerald-50">
              <TableRow>
                <TableHead className="text-emerald-800">{tx.day}</TableHead>
                <TableHead className="text-emerald-800">{tx.start}</TableHead>
                <TableHead className="text-emerald-800">{tx.end}</TableHead>
                <TableHead className="text-center text-emerald-800">{tx.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin w-8 h-8 mx-auto text-emerald-600" /></TableCell></TableRow>
              ) : schedule.map((av: any) => (
                <TableRow key={av.id} className="hover:bg-emerald-50/50 transition-colors">
                  <TableCell className="font-bold text-gray-700">{days.find(d => d.id === Number(av.day_of_week))?.label}</TableCell>
                  <TableCell>
                    {editingId === av.id ? <TimeInput value={editForm.start_time} onChange={(v) => setEditForm({...editForm, start_time: v})} /> : <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-500"/>{av.start_time.substring(0, 5)}</span>}
                  </TableCell>
                  <TableCell>
                    {editingId === av.id ? <TimeInput value={editForm.end_time} onChange={(v) => setEditForm({...editForm, end_time: v})} /> : av.end_time.substring(0, 5)}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingId === av.id ? (
                      <div className="flex justify-center gap-2">
                        <Button size="sm" onClick={() => saveEdit(av.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Check className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-4 h-4" /></Button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => { setEditingId(av.id); setEditForm({start_time: av.start_time.substring(0,5), end_time: av.end_time.substring(0,5)}) }}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => { if(window.confirm(tx.confirm_delete)) deleteMutation.mutate(av.id, { onSuccess: () => refetch() })}} disabled={deleteMutation.isPending}><Trash className="w-4 h-4" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}