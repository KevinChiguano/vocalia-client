import { create } from "zustand";

interface UIError {
  title: string;
  message: string;
}

interface UIState {
  sidebarOpen: boolean;
  isLoading: boolean;
  loadingCount: number;
  error: UIError | null;
  notification: {
    title: string;
    message: string;
    type: "success" | "error" | "info";
  } | null;
  customBreadcrumbs: { label: string; path?: string }[] | null;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  showLoader: () => void;
  hideLoader: () => void;
  setError: (title: string, message: string) => void;
  clearError: () => void;
  setNotification: (
    title: string,
    message: string,
    type?: "success" | "error" | "info",
  ) => void;
  clearNotification: () => void;
  setCustomBreadcrumbs: (
    breadcrumbs: { label: string; path?: string }[] | null,
  ) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  isLoading: false,
  loadingCount: 0,
  error: null,
  notification: null,
  customBreadcrumbs: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  closeSidebar: () => set({ sidebarOpen: false }),

  showLoader: () =>
    set((state) => {
      const newCount = state.loadingCount + 1;
      return { loadingCount: newCount, isLoading: true };
    }),

  hideLoader: () =>
    set((state) => {
      const newCount = Math.max(0, state.loadingCount - 1);
      return { loadingCount: newCount, isLoading: newCount > 0 };
    }),

  setError: (title, message) => set({ error: { title, message } }),
  clearError: () => set({ error: null }),
  setNotification: (title, message, type = "info") =>
    set({ notification: { title, message, type } }),
  clearNotification: () => set({ notification: null }),
  setCustomBreadcrumbs: (breadcrumbs) =>
    set({ customBreadcrumbs: breadcrumbs }),
}));
