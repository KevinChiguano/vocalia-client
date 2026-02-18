// CustomTabsUnderline.tsx
import { cn } from "@/utils/cn";
import { ReactNode } from "react";

interface TabItem<T extends string> {
  key: T;
  label: string;
  icon?: ReactNode;
}

interface Props<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export function CustomTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: Props<T>) {
  return (
    <div className="flex border-b border-border gap-6">
      {tabs.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative flex items-center gap-2 pb-3 text-sm font-semibold",
              active ? "text-primary" : "text-text-muted hover:text-text",
            )}
          >
            {tab.icon}
            {tab.label}

            {active && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
