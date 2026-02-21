import { useState } from "react";
import { Tag, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { CategoriesTab } from "../components/CategoriesTab";
import { TeamsTab } from "../components/TeamsTab";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlayersTab } from "../components/PlayersTab";

type Tab = "categories" | "teams";

const QualificationsPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("categories");

  const isPlayersView = !!searchParams.get("teamId");

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  // Dedicated full-page view for Players
  if (isPlayersView) {
    return <PlayersTab />;
  }

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <PageHeader
        title={
          <>
            Calificaciones <span className="text-primary">y Registro</span>
          </>
        }
        description="Configura categorías, equipos y la nómina de cada equipo."
      />

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
        ]}
      />

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-left-2 duration-500">
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "teams" && <TeamsTab />}
      </div>
    </div>
  );
};

export default QualificationsPage;
