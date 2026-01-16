import { createPortal } from "react-dom";
import { AlertCircle, X } from "lucide-react";
import { useUIStore } from "@/store/ui.store";
import { Button } from "./Button";

export const ErrorModal = () => {
  const { error, clearError } = useUIStore();

  if (!error) return null;

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md ui-card overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-red-500/20">
        {/* Header con icono de advertencia */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-red-700 dark:text-red-300">
              {error.title || "Ups! Algo salió mal"}
            </h2>
          </div>
          <button
            onClick={clearError}
            className="p-2 text-text-muted hover:text-text hover:bg-hover rounded-full transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-text leading-relaxed">
            {error.message ||
              "No se pudo completar la operación solicitada. Por favor, intenta de nuevo."}
          </p>

          <div className="mt-8 flex justify-end">
            <Button onClick={clearError} variant="danger" className="px-8">
              Entendido
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
