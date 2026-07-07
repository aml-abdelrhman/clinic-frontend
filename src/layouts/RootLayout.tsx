import React, { useState, useEffect } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { LanguageSwitcher } from "../components/layout/LanguageSwitcher";

const AUTH_ROUTES = ["/login", "/register"];

export function RootLayout() {
  const routerState = useRouterState();
  const path = routerState.location.pathname;
  const isAuth = AUTH_ROUTES.includes(path);

  if (isAuth) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center relative">
        <MeshBackground />
        <div className="absolute top-4 end-4 z-10">
          <LanguageSwitcher  />
        </div>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-void)" }}>
      <MeshBackground />

      <main className="flex-grow transition-all duration-300">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      <footer className="py-8 text-center text-white/50 border-t border-white/5 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} All Rights Reserved.</p>
      </footer>
    </div>
  );
}

function MeshBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0" style={{ background: "var(--grad-mesh)" }} />
      <div
        className="orb w-[600px] h-[600px] animate-orb-pulse"
        style={{
          top: "-200px",
          left: "-150px",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          animationDelay: "0s",
        }}
      />
      <div
        className="orb w-[500px] h-[500px] animate-orb-pulse"
        style={{
          bottom: "-100px",
          right: "-100px",
          background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
          animationDelay: "3s",
        }}
      />
      <div
        className="orb w-[400px] h-[400px] animate-orb-pulse"
        style={{
          top: "50%",
          left: "40%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(0,255,163,0.05) 0%, transparent 70%)",
          animationDelay: "6s",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}