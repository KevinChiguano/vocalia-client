import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getDirectImageUrl } from "@/utils/imageUtils";

interface MatchHeaderProps {
  match: any;
  localScore?: number;
  awayScore?: number;
}

export const MatchHeader = ({ match, localScore, awayScore }: MatchHeaderProps) => {
  const displayLocalScore = localScore !== undefined ? localScore : (match.local_score || 0);
  const displayAwayScore = awayScore !== undefined ? awayScore : (match.away_score || 0);

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Local Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            {match.localTeam?.team_logo ? (
              <img
                src={getDirectImageUrl(match.localTeam.team_logo)}
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
              <span>{displayLocalScore}</span>
              <span className="text-muted-foreground">-</span>
              <span>{displayAwayScore}</span>
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
                src={getDirectImageUrl(match.awayTeam.team_logo)}
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
