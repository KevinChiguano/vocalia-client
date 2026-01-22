import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Trophy, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TournamentTeam } from "../types/tournamentTeam.types";
import { teamApi } from "@/features/qualifications/api/team.api";
import { Team } from "@/features/qualifications/types/team.types";
import { useUIStore } from "@/store/ui.store";
import { tournamentTeamApi as ttApi } from "../api/tournamentTeam.api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: number;
  tournamentName: string;
}

export const TournamentTeamsModal = ({
  isOpen,
  onClose,
  tournamentId,
  tournamentName,
}: Props) => {
  const [registeredTeams, setRegisteredTeams] = useState<TournamentTeam[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const { showLoader, hideLoader } = useUIStore();

  const fetchRegisteredTeams = async () => {
    try {
      const teams = await ttApi.getTournamentTeams(tournamentId);
      setRegisteredTeams(teams);
    } catch (error) {
      console.error("Error fetching registered teams", error);
    }
  };

  const fetchAvailableTeams = async (query: string) => {
    if (!query.trim()) {
      setAvailableTeams([]);
      return;
    }
    try {
      const response = await teamApi.getTeams({ search: query, limit: 5 });
      // Filter out teams already registered
      const filtered = response.data.filter(
        (t: Team) =>
          !registeredTeams.some((rt) => Number(rt.teamId) === Number(t.id)),
      );
      setAvailableTeams(filtered);
    } catch (error) {
      console.error("Error fetching available teams", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRegisteredTeams();
    }
  }, [isOpen, tournamentId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAvailableTeams(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, registeredTeams]);

  const handleRegister = async (teamId: number) => {
    showLoader();
    try {
      await ttApi.registerTeam({ tournamentId, teamId });
      setSearch("");
      fetchRegisteredTeams();
    } catch (error) {
      console.error("Error registering team", error);
    } finally {
      hideLoader();
    }
  };

  const handleRemove = async (tournamentTeamId: number) => {
    showLoader();
    try {
      await ttApi.removeTeam(tournamentTeamId);
      fetchRegisteredTeams();
    } catch (error) {
      console.error("Error removing team", error);
    } finally {
      hideLoader();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Equipos en ${tournamentName}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Search and Add */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">
            Inscribir equipo
          </label>
          <div className="relative">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <Input
                placeholder="Buscar equipo por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {availableTeams.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-xl max-h-48 overflow-auto">
                {availableTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleRegister(team.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-hover transition-colors border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold overflow-hidden">
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          team.name.charAt(0)
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-text">
                          {team.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {team.category?.name}
                        </p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* List of registered teams */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-muted flex items-center gap-2">
            <Users className="w-4 h-4" />
            Equipos Inscritos ({registeredTeams.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-auto pr-2">
            {registeredTeams.map((rt) => (
              <div
                key={rt.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface/50 group hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/10">
                    {rt.team?.logo ? (
                      <img
                        src={rt.team.logo}
                        alt={rt.team.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      rt.team?.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text truncate max-w-[120px]">
                      {rt.team?.name}
                    </p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                      {rt.team?.category?.name}
                    </p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="xs"
                  isIconOnly
                  pill
                  onClick={() => handleRemove(rt.id)}
                  className="opacity-0 group-hover:opacity-100 h-8 w-8"
                  title="Eliminar del torneo"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {registeredTeams.length === 0 && (
              <div className="col-span-full py-8 text-center border-2 border-dashed border-border rounded-xl">
                <Trophy className="w-12 h-12 text-text-muted/20 mx-auto mb-2" />
                <p className="text-text-muted text-sm">
                  No hay equipos inscritos aún
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} className="px-8">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
