import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface MatchHeaderProps {
  match: any;
}

export const MatchHeader = ({ match }: MatchHeaderProps) => {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Local Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            {match.localTeam?.team_logo ? (
              <img
                src={match.localTeam.team_logo}
                alt={match.localTeam.name}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-xl font-bold">
                {match.localTeam?.name?.charAt(0)}
              </div>
            )}
            <h3 className="text-xl font-bold text-center">
              {match.localTeam?.name}
            </h3>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl font-black font-mono tracking-wider flex items-center gap-4">
              <span>{match.local_score}</span>
              <span className="text-muted-foreground">-</span>
              <span>{match.away_score}</span>
            </div>
            <Badge
              variant={match.status === "en_curso" ? "neutral" : "primary"}
            >
              {match.status?.toUpperCase() || "PENDIENTE"}
            </Badge>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            {match.awayTeam?.team_logo ? (
              <img
                src={match.awayTeam.team_logo}
                alt={match.awayTeam.name}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-xl font-bold">
                {match.awayTeam?.name?.charAt(0)}
              </div>
            )}
            <h3 className="text-xl font-bold text-center">
              {match.awayTeam?.name}
            </h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
