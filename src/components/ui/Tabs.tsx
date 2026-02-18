import React, { createContext, useContext, useState } from "react";
import { cn } from "@/utils/cn";

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs = ({
  value,
  onValueChange,
  defaultValue,
  children,
  className,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const activeValue = value !== undefined ? value : internalValue;
  const setActiveValue = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider
      value={{ value: activeValue, onValueChange: setActiveValue }}
    >
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-start gap-6 border-b border-border bg-transparent p-0",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.value === value;

  return (
    <button
      className={cn(
        "relative flex items-center justify-center whitespace-nowrap pb-3 text-sm font-semibold focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive ? "text-primary" : "text-text-muted hover:text-text",
        className,
      )}
      onClick={() => context.onValueChange(value)}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />
      )}
    </button>
  );
};

export const TabsContent = ({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.value !== value) return null;

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
    </div>
  );
};
