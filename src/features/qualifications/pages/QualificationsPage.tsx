import { useState, useEffect } from "react";
import { Tag, Users, UserRoundSearch } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { CategoriesTab } from "../components/CategoriesTab";
import { TeamsTab } from "../components/TeamsTab";
import { PlayersTab } from "../components/PlayersTab";

type Tab = "categories" | "teams" | "players";

const QualificationsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("categories");

  useEffect(() => {
    if (searchParams.get("teamId")) {
      setActiveTab("players");
    }
  }, [searchParams]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    // If leaving players tab, clear params
    if (tab !== "players") {
      navigate(window.location.pathname, { replace: true });
    }
  };

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="type-h2 font-black">
          Calificaciones <span className="text-primary">y Registro</span>
        </h1>
        <p className="text-text-muted">
          Configura categorías, equipos y jugadores del torneo.
        </p>
      </div>

      {/* Tabs */}
      <CustomTabs
        activeTab={activeTab}
        onChange={(tab) => handleTabChange(tab as Tab)}
        tabs={[
          {
            key: "categories",
            label: "Categorías",
            icon: <Tag className="w-4 h-4" />,
          },
          {
            key: "teams",
            label: "Equipos",
            icon: <Users className="w-4 h-4" />,
          },
          {
            key: "players",
            label: "Jugadores",
            icon: <UserRoundSearch className="w-4 h-4" />,
          },
        ]}
      />

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-left-2 duration-500">
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "teams" && <TeamsTab />}
        {activeTab === "players" && <PlayersTab />}
      </div>
    </div>
  );
};

export default QualificationsPage;
