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
  toggleSidebar: () => void;
  closeSidebar: () => void;
  showLoader: () => void;
  hideLoader: () => void;
  setError: (title: string, message: string) => void;
  clearError: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  isLoading: false,
  loadingCount: 0,
  error: null,

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
}));
