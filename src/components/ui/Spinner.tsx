import { useUIStore } from "@/store/ui.store";
import { Loader2 } from "lucide-react";
import { createPortal } from "react-dom";

export const Spinner = () => {
  const { isLoading } = useUIStore();

  if (!isLoading) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-overlay p-4 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      <div className="relative flex flex-col items-center gap-4 p-8 bg-surface rounded-3xl shadow-2xl border border-border animate-in zoom-in-95 duration-500">
        {/* Efecto de brillo en el fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-3xl blur-xl" />

        {/* Contenedor del spinner con efecto de anillo */}
        <div className="relative">
          {/* Anillo exterior decorativo */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse" />

          {/* Spinner principal */}
          <div className="relative bg-surface rounded-full p-3">
            <Loader2
              className="w-10 h-10 text-primary animate-spin"
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Texto con animación */}
        <div className="relative flex items-center gap-1">
          <span className="text-sm font-semibold text-text animate-pulse">
            Procesando
          </span>

          {/* Puntos animados */}
          <span className="inline-flex gap-0.5">
            <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};
