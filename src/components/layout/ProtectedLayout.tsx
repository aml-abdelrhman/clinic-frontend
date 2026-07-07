'use client';

import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'doctor' | 'patient')[];
}

export function ProtectedLayout({ children, allowedRoles }: Props) {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // إذا لم يكن مسجل دخول، طرده لصفحة اللوجن
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }

    // إذا كان مسجل دخول لكن دوره ليس ضمن المسموح له
    if (user && !allowedRoles.includes(user.role as any)) {
      navigate({ to: "/" }); // أو صفحة "غير مصرح لك"
    }
  }, [isAuthenticated, user, navigate, allowedRoles]);

  if (!isAuthenticated || !user) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin size-10" /></div>;
  }

  return <>{children}</>;
}