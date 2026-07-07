import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router'; // هذا هو ملف الروتر الذي قمنا بإنشائه
import "./index.css";
import "./i18n/config";

// هذا السطر يبحث عن الحاوية (div) في ملف index.html
const rootElement = document.getElementById("root") || document.getElementById("app");

if (!rootElement) {
  throw new Error("Failed to find the root element. Please check your index.html has a <div id='root'></div> or <div id='app'></div>");
}

// هنا نقوم ببدء التطبيق باستخدام RouterProvider
// وبهذا نضمن أن كل التطبيق أصبح "داخل" الروتر
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);