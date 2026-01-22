import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { GlobalDashboardStats } from "../types/statistics.types";
import { Trophy, Users, Calendar, Goal, CreditCard, Shirt } from "lucide-react";

interface Props {
  stats: GlobalDashboardStats;
}

export const StatisticsDashboard = ({ stats }: Props) => {
  const { counts } = stats;

  const items = [
    {
      label: "Torneos",
      value: counts.tournaments,
      icon: Trophy,
      color: "text-yellow-600",
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      label: "Equipos",
      value: counts.teams,
      icon: Shirt,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      label: "Jugadores",
      value: counts.players,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
    {
      label: "Partidos",
      value: counts.matches,
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      label: "Goles",
      value: counts.goals,
      icon: Goal,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      label: "Tarj. Amarillas",
      value: counts.yellowCards,
      icon: CreditCard,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/10",
    },
    {
      label: "Tarj. Rojas",
      value: counts.redCards,
      icon: CreditCard,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className={`p-3 rounded-full ${item.bg}`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {item.label}
              </p>
              <h3 className="text-2xl font-bold">{item.value}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
