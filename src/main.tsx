import "@/theme/initTheme";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

import { router } from "@/routes/AppRouter";
import { useAuthStore } from "@/store/auth.store";

import "@/styles/index.css";

const hydrateAuth = useAuthStore.getState().hydrate;

hydrateAuth();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
