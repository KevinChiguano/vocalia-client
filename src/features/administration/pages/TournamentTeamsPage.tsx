import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  Plus,
  Trash2,
  Users,
  Trophy,
  LayoutGrid,
  UserSquare2,
} from "lucide-react";
import { tournamentApi } from "../api/tournament.api";
import { tournamentTeamApi as ttApi } from "../api/tournamentTeam.api";
import { teamApi } from "@/features/qualifications/api/team.api";
import { categoryApi } from "@/features/qualifications/api/category.api";
import { playerApi } from "@/features/qualifications/api/player.api";
import { Tournament } from "../types/tournament.types";
import { TournamentTeam } from "../types/tournamentTeam.types";
import { Team } from "@/features/qualifications/types/team.types";
import { Category } from "@/features/qualifications/types/category.types";
import { Player } from "@/features/qualifications/types/player.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useUIStore } from "@/store/ui.store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // If it's a relative path, prepend backend URL (removing /api from the end)
  const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const TournamentTeamsPage = () => {
  const { id } = useParams<{ id: string }>();
  const tournamentId = Number(id);
  const { showLoader, hideLoader } = useUIStore();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [registeredTeams, setRegisteredTeams] = useState<TournamentTeam[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  // Search filters
  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (tournamentId) {
      fetchInitialData();
    }
  }, [tournamentId]);

  const fetchInitialData = async () => {
    showLoader();
    try {
      // Clear previous tournament data
      setSelectedTeam(null);
      setPlayers([]);
      setAvailableTeams([]);

      const [tData, cData, ttData] = await Promise.all([
        tournamentApi.getTournament(tournamentId),
        categoryApi.getCategories({ limit: 100 }),
        ttApi.getTournamentTeams(tournamentId),
      ]);
      setTournament(tData);
      setCategories(cData.data);
      setRegisteredTeams(ttData);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      hideLoader();
    }
  };

  const handleSearch = async () => {
    showLoader();
    try {
      // Search teams to add
      const response = await teamApi.getTeams({
        search: searchName,
        category: searchCategory || undefined,
        limit: 10,
      });
      // Filter out teams already registered
      const filtered = response.data.filter(
        (t: Team) =>
          !registeredTeams.some(
            (rt) =>
              Number(rt.team?.id || rt.teamId) === Number(t.id) &&
              Number(rt.category?.id || rt.categoryId) === Number(t.categoryId),
          ),
      );
      setAvailableTeams(filtered);
    } catch (error) {
      console.error("Error fetching teams", error);
    } finally {
      hideLoader();
    }
  };

  const handleRegister = async (teamId: number, categoryId?: number) => {
    showLoader();
    try {
      await ttApi.registerTeam({ tournamentId, teamId, categoryId });
      // Remove from available and refresh registered
      setAvailableTeams((prev) => prev.filter((t) => t.id !== teamId));
      const ttData = await ttApi.getTournamentTeams(tournamentId);
      setRegisteredTeams(ttData);
    } catch (error) {
      console.error("Error registering team", error);
    } finally {
      hideLoader();
    }
  };

  const handleRemove = async (ttId: number) => {
    showLoader();
    try {
      await ttApi.removeTeam(ttId);
      const ttData = await ttApi.getTournamentTeams(tournamentId);
      setRegisteredTeams(ttData);

      // Clear players if the removed team was selected
      if (selectedTeam) {
        const removedTeamId = registeredTeams.find(
          (rt) => rt.id === ttId,
        )?.teamId;
        if (removedTeamId === selectedTeam.id) {
          setSelectedTeam(null);
          setPlayers([]);
        }
      }
    } catch (error) {
      console.error("Error removing team", error);
    } finally {
      hideLoader();
    }
  };

  const handleSelectTeam = async (team: Team) => {
    if (selectedTeam?.id === team.id) return;

    setSelectedTeam(team);
    showLoader();
    try {
      const response = await playerApi.getPlayers({
        teamId: team.id,
        limit: 100,
      });
      setPlayers(response.data);
    } catch (error) {
      console.error("Error fetching players", error);
    } finally {
      hideLoader();
    }
  };

  const groupedTeams = registeredTeams.reduce(
    (acc, rt) => {
      const catName = rt.category?.name || "Sin Categoría";
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(rt);
      return acc;
    },
    {} as Record<string, TournamentTeam[]>,
  );

  const renderTeamCard = (rt: TournamentTeam) => {
    const team = rt.team;
    if (!team) return null;
    return (
      <div
        key={rt.id}
        onClick={() => handleSelectTeam(team)}
        className={`group relative flex flex-col items-center p-6 rounded-3xl border cursor-pointer shadow-sm hover:shadow-xl ${
          selectedTeam?.id === team.id
            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
            : "border-border bg-surface hover:border-primary/40 hover:-translate-y-1"
        }`}
      >
        {/* Large Logo */}
        <div className="w-24 h-24 rounded-3xl  flex items-center justify-center text-primary font-black overflow-hidden mb-5 group-hover:scale-110 transition-transform duration-500">
          {team.logo ? (
            <img
              src={getImageUrl(team.logo)}
              alt={team.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Trophy className="w-10 h-10 opacity-30" />
          )}
        </div>

        {/* Content */}
        <div className="text-center w-full space-y-1">
          <p className="font-black text-text leading-tight group-hover:text-primary truncate w-full px-2">
            {team.name}
          </p>
          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-70">
            {rt.category?.name || "Sin Categoría"}
          </p>
          <div className="pt-2">
            <p className="text-[9px] text-primary/80 font-black uppercase tracking-tighter bg-primary/10 rounded-full py-1 px-3 inline-block">
              Click para ver Carnets
            </p>
          </div>
        </div>

        {/* Delete Button */}
        <Button
          variant="danger"
          size="xs"
          isIconOnly
          onClick={(e) => {
            e.stopPropagation();
            handleRemove(rt.id);
          }}
          className="absolute top-3 right-3 rounded-2xl shadow-lg"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  if (!tournament) return null;

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Gestión de <span className="text-primary">Equipos</span>
          </span>
        }
        description={
          <>
            Torneo: <span className="text-primary">{tournament.name}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        {/* Left Side: Search and Inscribed */}
        <div className="lg:col-span-8 space-y-8">
          {/* Search Section */}
          <Card className="border-primary/20 bg-primary/5 p-4 sm:p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Inscribir Nuevo Equipo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">
                  Categoría
                </label>
                <Select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-5 space-y-1.5">
                <Label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">
                  Nombre del Equipo
                </Label>
                <Input
                  placeholder="Ej: Los Galácticos..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="rounded-xl"
                />
              </div>
              <div className="md:col-span-3">
                <Button
                  onClick={handleSearch}
                  className="w-full gap-2 rounded-xl h-[42px]"
                >
                  <Search className="w-4 h-4" />
                  Buscar
                </Button>
              </div>
            </div>

            {/* Available Teams Search Results */}
            {availableTeams.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
                {availableTeams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border shadow-sm hover:border-primary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/10">
                        {team.logo ? (
                          <img
                            src={getImageUrl(team.logo)}
                            alt={team.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Trophy className="w-5 h-5 opacity-30" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text truncate max-w-[120px]">
                          {team.name}
                        </p>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-tight">
                          {team.category?.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => handleRegister(team.id, team.categoryId)}
                      className="rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Registered Teams List with Tabs */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <h2 className="text-xl font-black text-text flex items-center gap-2 ml-1">
                <LayoutGrid className="w-6 h-6 text-primary" />
                Equipos{" "}
                <span className="text-primary tracking-tight">Inscritos</span>
                <span className="text-primary tracking-tight">
                  ({registeredTeams.length})
                </span>
              </h2>
            </div>

            {registeredTeams.length > 0 ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="overflow-x-auto pb-2 -mx-2 px-2 ui-scrollbar">
                  <TabsList className="w-full justify-start border-b-border/30 gap-8 min-w-max">
                    <TabsTrigger
                      value="all"
                      className="uppercase tracking-widest text-[11px] font-black"
                    >
                      Todos los equipos
                    </TabsTrigger>
                    {Object.keys(groupedTeams).map((catName) => (
                      <TabsTrigger
                        key={catName}
                        value={catName}
                        className="uppercase tracking-widest text-[11px] font-black"
                      >
                        {catName}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="mt-8">
                  <TabsContent
                    value="all"
                    className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {registeredTeams.map((rt) => renderTeamCard(rt))}
                    </div>
                  </TabsContent>

                  {Object.entries(groupedTeams).map(([categoryName, teams]) => (
                    <TabsContent
                      key={categoryName}
                      value={categoryName}
                      className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {teams.map((rt) => renderTeamCard(rt))}
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-surface/50 backdrop-blur-sm">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-primary/10">
                  <Trophy className="w-10 h-10 text-primary/30" />
                </div>
                <p className="text-text font-black uppercase tracking-wider">
                  No hay equipos inscritos
                </p>
                <p className="text-xs text-text-muted mt-2 max-w-[250px] mx-auto">
                  Utiliza el buscador superior para añadir equipos al torneo
                  actual
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Player Carnets */}
        <div className="lg:col-span-4 h-fit">
          <div className="lg:sticky lg:top-24">
            <Card className="min-h-[400px] flex flex-col p-0 overflow-hidden border-border bg-surface/80 backdrop-blur-md shadow-xl rounded-2xl">
              <div className="p-6 border-b border-border bg-elevated/20">
                <h2 className="text-lg font-bold text-text flex items-center gap-2">
                  <UserSquare2 className="w-5 h-5 text-primary" />
                  Carnets de Jugadores
                </h2>
                {selectedTeam && (
                  <div className="mt-2 text-sm">
                    <span className="text-text-muted">Equipo:</span>
                    <span className="font-bold text-primary ml-1.5">
                      {selectedTeam.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 p-6 overflow-auto max-h-[calc(100vh-300px)] space-y-4 ui-scrollbar">
                {!selectedTeam ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 px-4">
                    <Users className="w-16 h-16 text-text-muted/10 mb-4" />
                    <p className="text-sm text-text-muted font-medium">
                      Selecciona un equipo de la lista para visualizar sus
                      carnets
                    </p>
                  </div>
                ) : players.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 px-4">
                    <p className="text-sm text-text-muted font-medium">
                      No hay jugadores registrados en este equipo
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
                    {players.map((player) => (
                      <div
                        key={player.dni}
                        className="group relative rounded-2xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20"
                      >
                        {/* Propiedad card_image_url segun el usuario */}
                        {(player as any).card_image_url || player.cardUrl ? (
                          <div className="aspect-3/2 w-full bg-elevated relative overflow-hidden flex items-center justify-center">
                            <img
                              src={getImageUrl(
                                (player as any).card_image_url ||
                                  player.cardUrl,
                              )}
                              alt={`Carnet de ${player.name}`}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ) : (
                          <div className="aspect-3/2 w-full bg-elevated/50 flex flex-col items-center justify-center border-b border-border text-text-muted">
                            <UserSquare2 className="w-12 h-12 opacity-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest mt-3 opacity-40">
                              Sin Carnet
                            </p>
                          </div>
                        )}

                        <div className="p-4 bg-surface/50">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-text truncate uppercase tracking-tight">
                                {player.name} {player.lastname}
                              </p>
                              <p className="text-[11px] text-primary font-black mt-0.5 bg-primary/10 w-fit px-1.5 rounded">
                                NRO {player.number || "-"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest leading-none">
                                DNI
                              </p>
                              <p className="text-[11px] text-text font-bold tracking-tight">
                                {player.dni}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
