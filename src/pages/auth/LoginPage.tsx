'use client';

import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeartPulse, Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/useAuthStore";

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

type LoginFormValues = {
  email: string;
  password: string;
};

// تعريف الأدوار المسموح بها لتجنب أخطاء TypeScript
type Role = 'admin' | 'doctor' | 'patient';

const roleRoutes: Record<Role, string> = {
  admin: "/dashboard/admin",
  doctor: "/dashboard/doctor",
  patient: "/dashboard/patient"
};

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  
  const { mutate: login, isPending } = useLogin();

  const loginSchema = z.object({
    email: z.string().email(t("medical.auth.invalidEmail")).min(1, t("medical.auth.required")),
    password: z.string().min(6, t("medical.auth.shortPassword")),
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onSuccess: () => {
        toast.success(t("medical.auth.successLogin"));
        
        // جلب المستخدم من الـ Store بعد تحديثه بواسطة الهوك
        const user = useAuthStore.getState().user;
        
        if (user && user.role in roleRoutes) {
          const destination = roleRoutes[user.role as Role];
          navigate({ to: destination as any, replace: true });
        } else {
          // توجيه افتراضي في حال عدم وجود دور محدد
          navigate({ to: "/", replace: true });
        }
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || t("medical.auth.invalidCredentials");
        toast.error(message);
      },
    });
  };

  return (
    <div className="relative w-full max-w-[450px] mx-auto px-4 py-10 animate-in fade-in zoom-in duration-500">
      <div className="rounded-[2.5rem] p-10 relative overflow-hidden bg-white/80 backdrop-blur-3xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />

        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-5 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-200/50">
            <HeartPulse size={32} className="text-white" />
          </div>
          <h1 className="text-slate-900 text-4xl font-black tracking-tight mb-2">
            {t("medical.auth.welcomeBack")}
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {t("medical.auth.loginSubtitle")}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700 ms-1.5">
                    {t("medical.auth.emailAddress")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={t("medical.auth.emailPlaceholder")}
                        {...field}
                        className="h-14 ps-12 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:border-emerald-400 transition-all duration-300 text-base"
                      />
                      <Mail className="absolute start-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
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
                  <FormLabel className="text-sm font-semibold text-slate-700 ms-1.5">
                    {t("medical.auth.password")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="h-14 ps-12 pe-12 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:border-emerald-400 transition-all duration-300 text-base"
                      />
                      <Lock className="absolute start-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 mt-4 rounded-2xl font-bold text-base text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300"
            >
              {isPending ? (
                <><Loader2 size={20} className="animate-spin" /> {t("medical.auth.verifying")}</>
              ) : (
                t("medical.auth.signIn")
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center text-base text-slate-500 font-medium mt-10">
          {t("medical.auth.noAccount")}{" "}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            {t("medical.auth.createAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}