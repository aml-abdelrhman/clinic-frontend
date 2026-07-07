'use client';

import React from "react";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useGetAdminStats } from "@/hooks/useQuery";

/**
 * لوحة تحكم الأدمن — هوية بصرية "سجل عيادة" (Clinic Record)
 * بدل شكل الكروت التقليدي (أيقونة في دايرة ملونة + رقم كبير)، كل إحصائية
 * بتتعرض كـ "تبويب سجل" بحد ملون على الجنب ورقم بخط Monospace ثابت العرض،
 * زي ما بتشوف الأرقام في شاشة متابعة العلامات الحيوية.
 */

type StatKey = "doctors" | "services" | "appointments" | "reviews";

const STAT_META: Record<
  StatKey,
  { accent: string; accentSoft: string }
> = {
  doctors:      { accent: "#2D6A4F", accentSoft: "rgba(45,106,79,0.08)" },
  services:     { accent: "#1B4332", accentSoft: "rgba(27,67,50,0.08)" },
  appointments: { accent: "#C98A2C", accentSoft: "rgba(201,138,44,0.10)" },
  reviews:      { accent: "#7C6A46", accentSoft: "rgba(124,106,70,0.08)" },
};

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const rtl = i18n.language === "ar";
  const { data: statsData, isLoading, isError } = useGetAdminStats();

  const stats: { key: StatKey; label: string; value: number }[] = [
    {
      key: "doctors",
      label: t("admin.dashboard.totalDoctors", { defaultValue: "إجمالي الأطباء / Doctors" }),
      value: statsData?.total_doctors || 0,
    },
    {
      key: "services",
      label: t("admin.dashboard.totalServices", { defaultValue: "الخدمات المتاحة / Services" }),
      value: statsData?.total_services || 0,
    },
    {
      key: "appointments",
      label: t("admin.dashboard.newAppointments", { defaultValue: "المواعيد الجديدة / New Bookings" }),
      value: statsData?.new_orders || 0,
    },
    {
      key: "reviews",
      label: t("admin.dashboard.totalReviews", { defaultValue: "التقييمات / Reviews" }),
      value: statsData?.total_reviews || 0,
    },
  ];

  const chartData = statsData?.chart_data || [];

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="min-h-screen p-6 md:p-10 lg:p-12"
      style={{ backgroundColor: "#F7FAF8" }}
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* ===== الهيدر ===== */}
        <header className="space-y-4">
          <p
            className="text-[11px] font-bold tracking-[0.2em] uppercase"
            style={{ color: "#2D6A4F" }}
          >
            {t("admin.dashboard.eyebrow", { defaultValue: "Clinic Operations · نظرة تشغيلية" })}
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <h1
              className="text-[2rem] md:text-[2.5rem] font-black leading-tight tracking-tight"
              style={{ color: "#0F1E1B" }}
            >
              {t("admin.dashboard.title", { defaultValue: "لوحة تحكم العيادة" })}
            </h1>
            <p className="text-sm font-medium" style={{ color: "#6B7A73" }}>
              {t("admin.dashboard.subtitle", {
                defaultValue: "Real-time snapshot · بيانات حية من النظام",
              })}
            </p>
          </div>

          {/* شريط نبضي رفيع بيفصل الهيدر عن المحتوى - إشارة بصرية لطبيعة العيادة */}
          <PulseDivider />
        </header>

        {isError ? (
          <div
            className="rounded-2xl border p-6 text-sm font-bold"
            style={{ borderColor: "#E8C4BE", backgroundColor: "#FBF2F0", color: "#9A3B2E" }}
          >
            {t("admin.dashboard.error", {
              defaultValue: "تعذّر تحميل البيانات الآن. جرّب تحديث الصفحة. / Couldn't load data — try refreshing.",
            })}
          </div>
        ) : (
          <>
            {/* ===== سجلّات الإحصائيات ===== */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const meta = STAT_META[stat.key];
                return (
                  <div
                    key={stat.key}
                    className="relative bg-white rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(15,30,27,0.04)] border border-[#EAEFEC] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(15,30,27,0.06)]"
                  >
                    {/* الحد اللوني الجانبي - زي تبويب ملف مريض */}
                    <span
                      className="absolute inset-y-0 rtl:right-0 ltr:left-0 w-1.5"
                      style={{ backgroundColor: meta.accent }}
                    />
                    <div className="p-5 ps-6">
                      <p
                        className="text-[11px] font-bold uppercase tracking-wide mb-3"
                        style={{ color: "#8A968F" }}
                      >
                        {stat.label}
                      </p>
                      {isLoading ? (
                        <div
                          className="h-8 w-16 rounded-md animate-pulse"
                          style={{ backgroundColor: meta.accentSoft }}
                        />
                      ) : (
                        <p
                          className="font-mono tabular-nums text-[2.1rem] font-bold leading-none"
                          style={{ color: "#0F1E1B" }}
                        >
                          {String(stat.value).padStart(2, "0")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* ===== الرسم البياني ===== */}
            <section
              className="bg-white rounded-3xl border border-[#EAEFEC] p-6 md:p-8"
              style={{ boxShadow: "0 1px 2px rgba(15,30,27,0.04)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p
                    className="text-[11px] font-bold uppercase tracking-wide mb-1"
                    style={{ color: "#8A968F" }}
                  >
                    {t("admin.dashboard.chartEyebrow", { defaultValue: "Booking trend · 7 days" })}
                  </p>
                  <h2 className="text-lg font-bold" style={{ color: "#0F1E1B" }}>
                    {t("admin.dashboard.chartTitle", {
                      defaultValue: "معدل الحجوزات في الأيام الأخيرة",
                    })}
                  </h2>
                </div>
                <span
                  className="hidden sm:flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "rgba(45,106,79,0.08)", color: "#2D6A4F" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {t("admin.dashboard.live", { defaultValue: "Live" })}
                </span>
              </div>

              <div className="h-72 w-full" dir="ltr">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="clinicTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#2D6A4F" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F0" />
                      <XAxis
                        dataKey="date"
                        stroke="#B7C2BC"
                        fontSize={12}
                        tickMargin={10}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#B7C2BC"
                        fontSize={12}
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #EAEFEC",
                          boxShadow: "0 8px 24px rgba(15,30,27,0.08)",
                          fontSize: 13,
                        }}
                        labelStyle={{ color: "#6B7A73", marginBottom: 4, fontWeight: 700 }}
                        formatter={(value: number) => [
                          value,
                          t("admin.dashboard.bookingsLabel", { defaultValue: "حجوزات / Bookings" }),
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#2D6A4F"
                        strokeWidth={2.5}
                        fill="url(#clinicTrend)"
                        dot={{ r: 3.5, fill: "#2D6A4F", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 5.5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    className="h-full flex items-center justify-center text-sm font-medium rounded-2xl border-2 border-dashed"
                    style={{ borderColor: "#E3E9E5", color: "#9AA6A0" }}
                  >
                    {t("admin.dashboard.noChartData", {
                      defaultValue: "لا توجد بيانات حجوزات كافية بعد / Not enough data yet",
                    })}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * خط رفيع بيتحرك نبضة واحدة بسيطة زي مانيتور القلب — إشارة بصرية واحدة
 * فقط، هادية وغير متكررة، بدل ما نملأ الصفحة بأنيميشن.
 */
function PulseDivider() {
  return (
    <div className="relative h-px w-full overflow-hidden" style={{ backgroundColor: "#E3E9E5" }}>
      <span
        className="absolute inset-y-0 w-24 animate-[pulseMove_2.8s_ease-in-out_infinite]"
        style={{
          background: "linear-gradient(90deg, transparent, #2D6A4F, transparent)",
        }}
      />
      <style>{`
        @keyframes pulseMove {
          0%   { transform: translateX(-120%); }
          60%  { transform: translateX(420%); }
          100% { transform: translateX(420%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[pulseMove_2\\.8s_ease-in-out_infinite\\] { animation: none; }
        }
      `}</style>
    </div>
  );
}