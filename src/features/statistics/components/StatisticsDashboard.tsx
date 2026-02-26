import { GlobalDashboardStats } from "../types/statistics.types";
import { Trophy, Users, UserSquare2, Activity, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Props {
  stats: GlobalDashboardStats;
}

export const StatisticsDashboard = ({ stats }: Props) => {
  const { counts } = stats;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-text text-xl font-bold flex items-center gap-2">
        <Activity className="size-6 text-primary" />
        Estadísticas Generales
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Torneos */}
        <Card className="p-5 flex flex-col gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Trophy className="size-6" />
          </div>
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">
              Total Torneos
            </p>
            <p className="text-2xl font-bold text-text">{counts.tournaments}</p>
          </div>
        </Card>

        {/* Equipos Inscritos */}
        <Card className="p-5 flex flex-col gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Users className="size-6" />
          </div>
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">
              Equipos
            </p>
            <p className="text-2xl font-bold text-text">{counts.teams}</p>
          </div>
        </Card>

        {/* Jugadores */}
        <Card className="p-5 flex flex-col gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <UserSquare2 className="size-6" />
          </div>
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">
              Federados
            </p>
            <p className="text-2xl font-bold text-text">{counts.players}</p>
          </div>
        </Card>

        {/* Goles */}
        <Card className="p-5 flex flex-col gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <BarChart3 className="size-6" />
          </div>
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">
              Goles Totales
            </p>
            <p className="text-2xl font-bold text-text">{counts.goals}</p>
          </div>
        </Card>

        {/* Sanciones */}
        <Card className="p-5 flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="h-10 w-4 bg-yellow-400 rounded-sm"></div>
            <div className="h-10 w-4 bg-red-600 rounded-sm"></div>
          </div>
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">
              Amarillas/Rojas
            </p>
            <p className="text-2xl font-bold text-text">
              {counts.yellowCards} / {counts.redCards}
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};
