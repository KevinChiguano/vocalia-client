import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/utils/cn";

// Mapeo de nombres de rutas
const routeNameMap: Record<string, string> = {
  administration: "Administración",
  leagues: "Ligas",
  tournaments: "Torneos",
  qualifications: "Calificaciones",
  login: "Iniciar Sesión",
  teams: "Equipos",
  players: "Jugadores",
  matches: "Partidos",
  // Add more mappings as needed
};

// Rutas que deben ser omitidas del breadcrumb
const skipRoutes = new Set([
  "administration", // Ruta intermedia sin página propia
]);

/**
 * Verifica si un segmento es un ID numérico
 */
const isNumericId = (segment: string): boolean => {
  return /^\d+$/.test(segment);
};

/**
 * Verifica si un segmento debe ser omitido del breadcrumb
 */
const shouldSkipSegment = (segment: string): boolean => {
  return skipRoutes.has(segment) || isNumericId(segment);
};

/**
 * Formatea un segmento de ruta para mostrar
 */
const formatSegment = (segment: string): string => {
  if (routeNameMap[segment]) return routeNameMap[segment];
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
};

/**
 * Construye la ruta completa para un segmento, incluyendo los segmentos omitidos
 */
const buildPath = (pathnames: string[], targetIndex: number): string => {
  return `/${pathnames.slice(0, targetIndex + 1).join("/")}`;
};

interface BreadcrumbProps {
  className?: string;
}

export const Breadcrumb = ({ className }: BreadcrumbProps) => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Filtrar segmentos que no deben mostrarse
  const visibleSegments = pathnames
    .map((segment, index) => ({
      segment,
      originalIndex: index,
      path: buildPath(pathnames, index),
    }))
    .filter(({ segment }) => !shouldSkipSegment(segment));

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center text-sm text-text-secondary/70 mb-4",
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {/* Home siempre presente */}
        <li>
          <Link
            to="/"
            className="flex items-center hover:text-primary"
            title="Inicio"
          >
            <Home className="w-4 h-4" />
            <span className="ml-2">Inicio</span>
          </Link>
        </li>

        {/* Separador después de Home si hay más elementos */}
        {visibleSegments.length > 0 && (
          <li className="text-gray-400">
            <ChevronRight className="w-4 h-4" />
          </li>
        )}

        {/* Segmentos visibles */}
        {visibleSegments.map(({ segment, path }, index) => {
          const isLast = index === visibleSegments.length - 1;

          return (
            <li key={path} className="flex items-center gap-2">
              {isLast ? (
                <span className="font-medium text-primary cursor-default">
                  {formatSegment(segment)}
                </span>
              ) : (
                <>
                  <Link to={path} className="hover:text-primary">
                    {formatSegment(segment)}
                  </Link>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
