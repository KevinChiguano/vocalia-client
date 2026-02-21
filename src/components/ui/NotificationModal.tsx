import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useUIStore } from "@/store/ui.store";
import { Button } from "./Button";

export const NotificationModal = () => {
  const { notification, clearNotification } = useUIStore();

  if (!notification) return null;

  const getTheme = () => {
    switch (notification.type) {
      case "success":
        return {
          bgClass: "bg-green-50 dark:bg-green-900/10",
          iconBg: "bg-green-100 dark:bg-green-900/30",
          iconColor: "text-green-600 dark:text-green-400",
          titleColor: "text-green-700 dark:text-green-300",
          borderColor: "border-green-500/20",
          Icon: CheckCircle2,
        };
      case "error":
        return {
          bgClass: "bg-red-50 dark:bg-red-900/10",
          iconBg: "bg-red-100 dark:bg-red-900/30",
          iconColor: "text-red-600 dark:text-red-400",
          titleColor: "text-red-700 dark:text-red-300",
          borderColor: "border-red-500/20",
          Icon: AlertCircle,
        };
      case "info":
      default:
        return {
          bgClass: "bg-blue-50 dark:bg-blue-900/10",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          iconColor: "text-blue-600 dark:text-blue-400",
          titleColor: "text-blue-700 dark:text-blue-300",
          borderColor: "border-blue-500/20",
          Icon: Info,
        };
    }
  };

  const theme = getTheme();
  const { Icon } = theme;

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm ui-card overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ${theme.borderColor}`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-border ${theme.bgClass}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${theme.iconBg}`}>
              <Icon className={`w-6 h-6 ${theme.iconColor}`} />
            </div>
            <h2 className={`text-lg font-bold ${theme.titleColor}`}>
              {notification.title}
            </h2>
          </div>
          <button
            onClick={clearNotification}
            className="p-2 text-text-muted hover:text-text hover:bg-hover rounded-full focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-text leading-relaxed whitespace-pre-line">
            {notification.message}
          </p>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={clearNotification}
              variant="secondary"
              className="px-6"
            >
              Aceptar
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
