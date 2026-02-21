import { useState } from "react";
import { FieldsTab } from "../components/FieldsTab";
import { ScheduleManagementTab } from "../components/ScheduleManagementTab";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { CalendarDays, MapPin } from "lucide-react";

type TabKey = "matches" | "fields";

export const TechnicalCommissionPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("fields");

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <PageHeader
          title={
            <>
              Comisión <span className="text-primary">Técnica</span>
            </>
          }
          description="Gestiona los partidos asignados y registra los eventos."
        />
      </div>
      {/* Simple Internal Tab Switcher */}
      <div className="pb-1">
        <CustomTabs
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as TabKey)}
          tabs={[
            {
              key: "fields",
              label: "Gestión de Sedes",
              icon: <MapPin className="w-4 h-4" />,
            },
            {
              key: "matches",
              label: "Gestión de Partidos",
              icon: <CalendarDays className="w-4 h-4" />,
            },
          ]}
        />
      </div>

      <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
        {activeTab === "fields" && <FieldsTab />}
        {activeTab === "matches" && <ScheduleManagementTab />}
      </div>
    </div>
  );
};
