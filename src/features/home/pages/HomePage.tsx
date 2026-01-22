import {
  Settings,
  Users,
  IdCard,
  Calendar,
  Clipboard,
  Gavel,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { ModuleCard } from "@/features/home/components/ModuleCard";
import { PageHeader } from "@/components/ui/PageHeader";

const HomePage = () => {
  const modules = [
    {
      title: "GESTIÓN DE USUARIOS",
      description: "Administración de usuarios, roles y permisos.",
      icon: Users,
      to: "/administration/users",
    },
    {
      title: "ADMINISTRACIÓN",
      description: "Gestión de Torneos y Configuración.",
      icon: Settings,
      to: "/administration/tournaments",
    },
    {
      title: "CALIFICACIONES",
      description: "Inscripción de categorias, equipos, jugadores y fotos.",
      icon: Users,
      to: "/qualifications",
    },
    {
      title: "CARNETIZACIÓN",
      description: "Generación e impresión de carnets PDF o PNG.",
      icon: IdCard,
      to: "/credentials",
    },
    {
      title: "COMISIÓN TÉCNICA",
      description: "Creación de Fixtures, horarios y canchas.",
      icon: Calendar,
      to: "/technical-commission",
    },
    {
      title: "VOCALÍA DIGITAL",
      description: "Registro de goles, tarjetas y eventos del partido.",
      icon: Clipboard,
      to: "/digital-vocalia",
    },
    {
      title: "DISCIPLINA",
      description: "Sanciones, revisión de informes y multas.",
      icon: Gavel,
      to: "/discipline",
    },
    {
      title: "FINANCIERO",
      description: "Cobro de vocalías, multas y reportes económicos.",
      icon: DollarSign,
      to: "/financial",
    },
    {
      title: "ESTADÍSTICAS",
      description: "Tablas de posiciones y goleadores.",
      icon: BarChart3,
      to: "/statistics",
    },
  ];

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Bienvenido al Sistema Integral de Administración Deportiva y Estadísticas de Campeonatos"
        description="Selecciona un módulo para comenzar a trabajar."
        className="mb-8"
      />

      <h2 className="type-h3 font-semibold text-primary mb-6">
        Módulos Disponibles
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {modules.map((module) => (
          <ModuleCard key={module.title} {...module} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
