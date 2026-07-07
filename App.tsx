import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import "./index.css";

// استبدلي Dashboard بالصفحة التي تريدين البدء بها
// import Dashboard from "@/pages/Dashboard"; 

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        {/* هنا نضع المكون (Component) الذي نريد عرضه مباشرة بدون Router */}
        {/* <Dashboard /> */}

        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        )}
      </LocaleProvider>
    </QueryClientProvider>
  );
}