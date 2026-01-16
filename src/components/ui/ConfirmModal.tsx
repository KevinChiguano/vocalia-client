import { Button } from "@/components/ui/Button";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal = ({
  open,
  title,
  description,
  confirmText = "Confirmar",
  danger = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-xl shadow-soft p-6">
        <h3
          className={`text-lg font-semibold ${
            danger ? "text-danger" : "text-text"
          }`}
        >
          {title}
        </h3>

        {description && (
          <p className="mt-2 text-sm text-text-muted">{description}</p>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>

          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
