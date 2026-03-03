import { useVocalias } from "../hooks/useVocalias";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import enCursoImg from "@/assets/en_curso.jpg";
import proximoImg from "@/assets/proximo.jpg";
import { PageHeader } from "@/components/ui/PageHeader";

const DigitalVocaliaPage = () => {
  const { data: response, isLoading } = useVocalias();
  const vocalias = response?.data || [];
  const navigate = useNavigate();

  const today = new Date().toDateString();
  const partidosHoy = vocalias.filter(
    (v: any) =>
      v.match?.date && new Date(v.match.date).toDateString() === today,
  ).length;
  const pendientes = vocalias.filter(
    (v: any) => v.match?.status === "programado",
  ).length;
  const completados = vocalias.filter(
    (v: any) => v.match?.status === "finalizado",
  ).length;

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Title Section */}
      <PageHeader
        title={
          <>
            Mis Vocalías <span className="text-primary">Asignadas</span>
          </>
        }
        description="Gestiona el registro de eventos en tiempo real."
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 mt-6 lg:mt-0">
        <div className="bg-surface/60 backdrop-blur-md border border-border p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-text-subtle text-sm font-medium uppercase tracking-wider">
              Partidos Hoy
            </p>
            <h3 className="text-4xl font-bold text-text mt-1">
              {partidosHoy < 10 ? `0${partidosHoy}` : partidosHoy}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">
              calendar_today
            </span>
          </div>
        </div>
        <div className="bg-surface/60 backdrop-blur-md border border-border p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-text-subtle text-sm font-medium uppercase tracking-wider">
              Pendientes
            </p>
            <h3 className="text-4xl font-bold text-text mt-1">
              {pendientes < 10 ? `0${pendientes}` : pendientes}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-warning-soft flex items-center justify-center text-warning">
            <span className="material-symbols-outlined text-3xl">
              pending_actions
            </span>
          </div>
        </div>
        <div className="bg-surface/60 backdrop-blur-md border border-border p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-text-subtle text-sm font-medium uppercase tracking-wider">
              Completados
            </p>
            <h3 className="text-4xl font-bold text-text mt-1">
              {completados < 10 ? `0${completados}` : completados}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-success-soft flex items-center justify-center text-success">
            <span className="material-symbols-outlined text-3xl">
              check_circle
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : vocalias?.length === 0 ? (
        <div className="bg-surface/40 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-8 text-center min-h-[250px]">
          <span className="material-symbols-outlined text-5xl text-text-subtle mb-4">
            add_circle
          </span>
          <h4 className="text-text-muted font-medium">¿Falta algún partido?</h4>
          <p className="text-text-subtle text-sm mt-2">
            Contacta al administrador para asignar nuevas vocalías a tu perfil.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {vocalias?.map((vocalia: any, index: number) => {
            const match = vocalia.match;
            if (!match) return null;

            const isLive = match.status === "en_curso";
            const isFinished = match.status === "finalizado";
            const isPending = match.status === "programado";

            let borderColor = "border-border";
            let statusBg = "bg-surface";
            let statusText = "text-text";
            let statusLabel = match.status;

            if (isLive) {
              borderColor = "border-primary";
              statusBg = "bg-primary";
              statusText = "text-white";
              statusLabel = "EN VIVO";
            } else if (isPending) {
              borderColor = "border-warning";
              statusBg = "bg-warning";
              statusText = "text-black";
              statusLabel = "PRÓXIMO";
            } else if (isFinished) {
              borderColor = "border-success";
              statusBg = "bg-success";
              statusText = "text-white";
              statusLabel = "FINALIZADO";
            }

            return (
              <div
                key={`${vocalia.id}-${index}`}
                className={`bg-surface border-l-4 ${borderColor} rounded-2xl overflow-hidden shadow-lg flex flex-col md:flex-row transition-transform hover:-translate-y-1`}
              >
                <div className="md:w-1/3 xl:w-2/5 relative h-48 md:h-auto bg-elevated shrink-0">
                  <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-l from-surface via-surface/10 to-transparent z-10"></div>

                  {/* Background Default Image */}
                  <div
                    className={`absolute inset-0 w-full h-full bg-center bg-cover ${
                      isFinished || isPending
                        ? "grayscale opacity-50"
                        : "opacity-50"
                    }`}
                    style={{
                      backgroundImage: `url(${isLive ? enCursoImg : proximoImg})`,
                    }}
                  ></div>

                  <div
                    className={`absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 ${statusBg} ${statusText} text-xs font-bold rounded-full`}
                  >
                    {isLive && (
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    )}
                    {statusLabel}
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between relative z-20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-elevated flex items-center justify-center border border-border overflow-hidden">
                        {match.localTeam?.logoUrl ||
                        match.localTeam?.logo ||
                        match.localTeam?.team_logo ||
                        match.localTeam?.team?.logoUrl ? (
                          <img
                            src={
                              match.localTeam.logoUrl ||
                              match.localTeam.logo ||
                              match.localTeam.team_logo ||
                              match.localTeam.team?.logoUrl
                            }
                            alt={
                              match.localTeam.name ||
                              match.localTeam.team_name ||
                              match.localTeam.team?.name
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-text-subtle">
                            shield
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-text uppercase line-clamp-1">
                        {match.localTeam?.name ||
                          match.localTeam?.team_name ||
                          "Local"}
                      </p>
                    </div>

                    <div className="px-4 py-1 flex flex-col items-center justify-center min-w-[100px]">
                      {isLive || isFinished ? (
                        <div className="text-3xl font-black text-text flex gap-2">
                          <span>{match.localScore || 0}</span>
                          <span
                            className={
                              isLive ? "text-primary" : "text-text-muted"
                            }
                          >
                            :
                          </span>
                          <span>{match.awayScore || 0}</span>
                        </div>
                      ) : (
                        <div className="text-3xl font-black text-text-muted flex gap-2 italic">
                          VS
                        </div>
                      )}
                      <p
                        className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
                          isPending
                            ? "text-warning"
                            : isLive
                              ? "text-primary"
                              : "text-text-muted"
                        }`}
                      >
                        {match.category || "Categoría"}
                      </p>
                    </div>

                    <div className="flex-1 text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-elevated flex items-center justify-center border border-border overflow-hidden">
                        {match.awayTeam?.logoUrl ||
                        match.awayTeam?.logo ||
                        match.awayTeam?.team_logo ||
                        match.awayTeam?.team?.logoUrl ? (
                          <img
                            src={
                              match.awayTeam.logoUrl ||
                              match.awayTeam.logo ||
                              match.awayTeam.team_logo ||
                              match.awayTeam.team?.logoUrl
                            }
                            alt={
                              match.awayTeam.name ||
                              match.awayTeam.team_name ||
                              match.awayTeam.team?.name
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-text-subtle">
                            shield
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-text uppercase line-clamp-1">
                        {match.awayTeam?.name ||
                          match.awayTeam?.team_name ||
                          "Visitante"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6 text-sm text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`material-symbols-outlined text-[18px] ${borderColor.replace(
                          "border-",
                          "text-",
                        )}`}
                      >
                        location_on
                      </span>
                      {match.field?.name || "Cancha por definir"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`material-symbols-outlined text-[18px] ${borderColor.replace(
                          "border-",
                          "text-",
                        )}`}
                      >
                        schedule
                      </span>
                      {match.date
                        ? new Date(match.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`material-symbols-outlined text-[18px] ${borderColor.replace(
                          "border-",
                          "text-",
                        )}`}
                      >
                        calendar_today
                      </span>
                      {match.date
                        ? new Date(match.date).toLocaleDateString()
                        : "--/--/--"}
                    </div>
                  </div>

                  {isFinished ? (
                    <Button
                      className="w-full text-sm flex items-center justify-center gap-2 font-bold"
                      onClick={() => navigate(`/digital-vocalia/${match.id}`)}
                      variant="outline"
                    >
                      <span className="material-symbols-outlined">
                        visibility
                      </span>{" "}
                      VER DETALLES
                    </Button>
                  ) : (
                    <Button
                      className="w-full text-sm flex items-center justify-center gap-2 font-bold shadow-md"
                      onClick={() => navigate(`/digital-vocalia/${match.id}`)}
                      variant={isLive ? "primary" : "secondary"}
                    >
                      <span className="material-symbols-outlined">
                        {isLive ? "edit_note" : "play_circle"}
                      </span>
                      {isLive ? "REGISTRAR ACCIÓN" : "INICIAR VOCALÍA"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DigitalVocaliaPage;
