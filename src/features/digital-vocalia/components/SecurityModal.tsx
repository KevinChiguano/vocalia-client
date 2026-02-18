import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { Lock } from "lucide-react";
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
    <Dialog open={open} onOpenChange={(val) => !val && onCancel && onCancel()}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Verificación de Seguridad
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Para ingresar a la gestión de este partido, por favor ingrese su
              contraseña o la contraseña del vocal asignado.
            </p>
            <Input
              type="password"
              placeholder="Contraseña..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Regresar
              </Button>
            )}
            <Button
              type="submit"
              disabled={verifyMutation.isPending || !password}
              className="w-full sm:w-auto"
            >
              {verifyMutation.isPending ? "Verificando..." : "Ingresar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
