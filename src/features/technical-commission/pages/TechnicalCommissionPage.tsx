import { useState } from "react";
import { Calendar, MapPin, ClipboardList } from "lucide-react";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { FieldsTab } from "../components/FieldsTab";
import { ScheduleTab } from "../components/ScheduleTab";
import { ScheduleManagementTab } from "../components/ScheduleManagementTab";

type TabKey = "fields" | "schedule" | "manage";

export const TechnicalCommissionPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("fields");
  const [editingMatch, setEditingMatch] = useState<any>(null);

  const handleEditMatch = (match: any) => {
    setEditingMatch(match);
    setActiveTab("schedule");
  };

  const tabs = [
    {
      key: "fields" as TabKey,
      label: "Canchas",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      key: "schedule" as TabKey,
      label: "Programar",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      key: "manage" as TabKey,
      label: "Gestionar",
      icon: <ClipboardList className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="type-h2 font-black">
          Comisión <span className="text-primary">Técnica</span>
        </h1>
        <p className="text-text-muted">
          Gestión de fixtures, horarios y canchas para los torneos.
        </p>
      </div>

      <div className="space-y-6">
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
        />

        <div className="mt-6 animate-in fade-in slide-in-from-left-2 duration-500">
          {activeTab === "fields" && <FieldsTab />}
          {activeTab === "schedule" && (
            <ScheduleTab
              editingMatch={editingMatch}
              onCancelEdit={() => setEditingMatch(null)}
            />
          )}
          {activeTab === "manage" && (
            <ScheduleManagementTab onEdit={handleEditMatch} />
          )}
        </div>
      </div>
    </div>
  );
};
