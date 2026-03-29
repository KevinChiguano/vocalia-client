import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { vocaliaApi } from "../api/vocalia.api";
import { useMutation } from "@tanstack/react-query";

interface SecurityModalProps {
  open: boolean;
  matchId: number;
  onSuccess: () => void;
  onCancel?: () => void; // Optional if we want to redirect back
}

export const SecurityModal = ({
  open,
  matchId,
  onSuccess,
  onCancel,
}: SecurityModalProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const verifyMutation = useMutation({
    mutationFn: (pwd: string) => vocaliaApi.verifyAccess(matchId, pwd),
    onSuccess: () => {
      onSuccess();
      setError("");
      setPassword("");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Contraseña incorrecta");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    verifyMutation.mutate(password);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onCancel || (() => {})}
      title="Verificación de Seguridad"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Lock className="w-6 h-6" />
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              Para ingresar a la gestión de este partido, por favor ingrese su
              contraseña o la contraseña del vocal asignado.
            </p>
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Ingrese su contraseña"
              className="pr-12 h-12 bg-elevated/40 border-border focus:ring-primary/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-0 bottom-0 px-3 text-text-muted hover:text-primary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {error && (
            <div className="bg-danger/10 text-danger text-xs font-semibold p-3 rounded-lg border border-danger/20 animate-in fade-in slide-in-from-top-1 duration-200">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border/40 sm:justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Regresar
            </Button>
          )}
          <Button
            type="submit"
            disabled={verifyMutation.isPending || !password}
            className="w-full sm:w-auto min-w-[120px] shadow-lg shadow-primary/20"
          >
            {verifyMutation.isPending ? "Verificando..." : "Ingresar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
