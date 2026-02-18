import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  hideCloseButton?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
  hideCloseButton,
}: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Only attach escape listener if close button is not hidden (optional behavior, but often desired for strict modals)
      // Actually, standard modal behavior usually allows escape unless strict "cannot close" mode.
      // But hideCloseButton implies we might not want easy closing.
      // For now, let's keep escape to close unless we want to block that too.
      // Re-reading user request: "SecurityModal". Often these are forced.
      // If I hide the close button, I probably don't want escape to work either?
      // Let's assume just visual hiding for now, OR maybe the user wants to force interaction.
      // Typically `hideCloseButton` is visual.
      if (!hideCloseButton) {
        window.addEventListener("keydown", handleEscape);
      }
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, hideCloseButton]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full ui-card overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200",
          maxWidthClasses[maxWidth],
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated">
          <h2 className="type-h3 font-bold text-primary">{title}</h2>
          {!hideCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              pill
              onClick={onClose}
              className="text-text-muted hover:text-text h-9 w-9"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
