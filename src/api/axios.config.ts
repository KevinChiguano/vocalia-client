import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";

declare module "axios" {
  export interface AxiosRequestConfig {
    silent?: boolean;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Activar spinner solo si no es una petición silenciosa
  if (!config.silent) {
    useUIStore.getState().showLoader();
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Desactivar spinner si no fue petición silenciosa
    if (!response.config.silent) {
      useUIStore.getState().hideLoader();
    }
    return response;
  },
  (error) => {
    // Desactivar spinner si no fue petición silenciosa
    if (!error.config?.silent) {
      useUIStore.getState().hideLoader();
    }

    const status = error.response?.status;
    const url = error.config?.url;
    const errorMessage =
      error.response?.data?.message || "Ocurrió un error inesperado";
    const errorDetails = error.response?.data?.error || "";

    // Si es un 401 en el login, devolver la respuesta con success: false
    if (status === 401 && url?.includes("/auth/login")) {
      return Promise.resolve({
        data: error.response.data,
      });
    }

    // Para 401 en otras rutas (token inválido/expirado), hacer logout
    if (status === 401) {
      useAuthStore.getState().logout();
      useUIStore
        .getState()
        .setError(
          "Sesión Expirada",
          "Tu sesión ha terminado. Por favor, vuelve a iniciar sesión."
        );
      return Promise.reject(error);
    }

    // Mostrar modal de error para otros errores (500, 400, 403, 404, etc.)
    // Excepto si es una cancelación de petición (opcional)
    if (error.code !== "ERR_CANCELED") {
      useUIStore
        .getState()
        .setError(
          status === 500 ? "Error del Servidor" : "Problema con la Petición",
          `${errorMessage}${errorDetails ? `: ${errorDetails}` : ""}`
        );
    }

    return Promise.reject(error);
  }
);
