'use client';

import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HeartPulse,
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// استيراد الـ Hooks والـ Store
import { useRegister } from "@/hooks/useAuth";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// تعريف التايب الخاص بالنموذج
type RegisterFormValues = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role: "patient" | "doctor" | "admin";
};

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  
  // استدعاء الـ Hook الخاص بالتسجيل (الذي يربطنا بـ Laravel)
  const { mutate: register, isPending } = useRegister();

  // schema للتحقق من البيانات (Validation)
  const registerSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, "يجب أن يكون الاسم أكثر من حرفين"),
        email: z.string().email("البريد الإلكتروني غير صالح"),
        phone: z.string().min(10, "رقم الهاتف غير صحيح"),
        password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
        password_confirmation: z.string().min(6),
        role: z.enum(["patient", "doctor", "admin"]),
      }).refine((data) => data.password === data.password_confirmation, {
        message: "كلمات المرور غير متطابقة",
        path: ["password_confirmation"],
      }),
    [],
  );

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
      role: "patient",
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    // التنفيذ باستخدام الـ Hook
    register(values, {
      onSuccess: () => {
        toast.success("تم إنشاء الحساب بنجاح!");
        navigate({ to: "/" }); // الانتقال للصفحة الرئيسية بعد النجاح
      },
      onError: (error: any) => {
        // عرض الخطأ القادم من Laravel للمستخدم
        const errorMessage = error.response?.data?.message || "حدث خطأ أثناء التسجيل";
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-10 animate-scale-in">
      <div className="rounded-3xl p-8 relative overflow-hidden border border-emerald-500/20 shadow-2xl bg-white/85 backdrop-blur-2xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-emerald-500 shadow-lg">
            <HeartPulse size={26} className="text-white" />
          </div>
          <h1 className="text-slate-900 text-2xl font-extrabold">إنشاء حساب جديد</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} className="h-11 ps-10 rounded-xl" />
                      <User className="absolute start-3 top-3 size-5 text-emerald-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="email" {...field} className="h-11 ps-10 rounded-xl" />
                      <Mail className="absolute start-3 top-3 size-5 text-emerald-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} className="h-11 ps-10 rounded-xl" />
                      <Phone className="absolute start-3 top-3 size-5 text-emerald-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showPass ? "text" : "password"} {...field} className="h-11 ps-10 rounded-xl" />
                      <Lock className="absolute start-3 top-3 size-5 text-emerald-400" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute end-3 top-3">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تأكيد كلمة المرور</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="password" {...field} className="h-11 ps-10 rounded-xl" />
                      <Lock className="absolute start-3 top-3 size-5 text-emerald-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 rounded-xl mt-4">
              {isPending ? <Loader2 className="animate-spin" /> : "تسجيل الحساب"}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-emerald-600 font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}