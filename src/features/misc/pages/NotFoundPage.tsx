import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-bg via-bg to-primary/5 overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-10 sm:-left-20 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-10 sm:-right-20 w-64 h-64 sm:w-96 sm:h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-2xl mx-auto w-full">
        {/* Número 404 con efecto glassmorphism */}
        <div className="relative mb-4 sm:mb-6">
          <h1 className="type-display font-black text-transparent bg-clip-text bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 select-none leading-none tracking-tighter">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </div>

        {/* Contenido textual */}
        <div className="space-y-3 sm:space-y-4 text-center -mt-6 sm:-mt-8">
          <h2 className="type-h1 font-bold text-text bg-gradient-to-r from-text to-text/80 bg-clip-text px-4">
            Página no encontrada
          </h2>
          <p className="type-body text-text-muted max-w-sm sm:max-w-md mx-auto leading-relaxed px-4 sm:px-6">
            Parece que esta página se perdió en el espacio digital. Verifica la
            URL o regresa a un lugar seguro.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10 w-full max-w-sm sm:max-w-md px-4 sm:px-0">
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            className="w-full sm:w-auto sm:flex-1 group hover:-translate-y-0.5 transition-transform"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            Volver atrás
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="primary"
            className="w-full sm:w-auto sm:flex-1 relative overflow-hidden group hover:-translate-y-0.5 transition-transform shadow-lg hover:shadow-2xl hover:shadow-primary/40"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Home className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
            <span className="relative z-10">Ir al inicio</span>
          </Button>
        </div>

        {/* Sugerencias adicionales */}
        <div className="mt-8 sm:mt-12 text-center px-4">
          <p className="text-xs sm:text-sm text-text-muted/70">
            ¿Necesitas ayuda? Contacta con soporte
          </p>
        </div>
      </div>
    </div>
  );
};
