import { PageHeader } from "@/components/ui/PageHeader";
import { useVocalias } from "../hooks/useVocalias";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock, MapPin } from "lucide-react";

const DigitalVocaliaPage = () => {
  const { data: response, isLoading } = useVocalias();
  const vocalias = response?.data || [];
  const navigate = useNavigate();

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title={
          <>
            Vocalía <span className="text-primary">Digital</span>
          </>
        }
        description="Gestiona los partidos asignados y registra los eventos."
      />

      {isLoading ? (
        <div>Cargando partidos asignados...</div>
      ) : vocalias?.length === 0 ? (
        <div className="text-center text-muted-foreground p-8">
          No tienes vocalías asignadas pendientes.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vocalias?.map((vocalia: any) => {
            const match = vocalia.match;
            if (!match) return null;

            return (
              <Card
                key={vocalia.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-bold">
                        {match.localTeam?.name || "Equipo Local"} vs{" "}
                        {match.awayTeam?.name || "Equipo Visitante"}
                      </span>
                      <Badge variant="neutral" className="w-fit">
                        {match.category || "Sin Categoría"}
                      </Badge>
                    </div>
                    <Badge
                      variant={
                        match.status === "finalizado" ? "success" : "primary"
                      }
                    >
                      {match.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vocalia.vocalUser && (
                    <div className="text-xs font-medium px-2 py-1 bg-secondary/10 text-secondary-foreground rounded w-fit">
                      Vocal: {vocalia.vocalUser.name}
                    </div>
                  )}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {match.date
                          ? new Date(match.date).toLocaleDateString()
                          : "Fecha por definir"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {match.date
                          ? new Date(match.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--:--"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{match.field?.name || "Cancha por definir"}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => navigate(`/digital-vocalia/${match.id}`)}
                  >
                    Gestionar Partido
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DigitalVocaliaPage;
