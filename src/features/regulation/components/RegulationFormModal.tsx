import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { regulationApi } from "../api/regulation.api";
import {
  RegulationArticle,
  CreateRegulationDTO,
} from "../types/regulation.types";
import { useUIStore } from "@/store/ui.store";

const schema = z.object({
  article_num: z.string().min(1, "El número de artículo es obligatorio."),
  title: z.string().min(1, "El título es obligatorio."),
  description: z.string().min(1, "La descripción es obligatoria."),
  sanction: z.string().min(1, "La sanción es obligatoria."),
  badge_variant: z.enum([
    "primary",
    "warning",
    "danger",
    "info",
    "success",
    "neutral",
    "outline",
  ]),
  category: z.string().min(1, "La categoría es obligatoria."),
});

type FormValues = z.infer<typeof schema>;

interface RegulationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: RegulationArticle | null;
}

export const RegulationFormModal = ({
  isOpen,
  onClose,
  article,
}: RegulationFormModalProps) => {
  const queryClient = useQueryClient();
  const { setNotification } = useUIStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      article_num: "",
      title: "",
      description: "",
      sanction: "",
      badge_variant: "neutral",
      category: "",
    },
  });

  useEffect(() => {
    if (article) {
      reset({
        article_num: article.article_num,
        title: article.title,
        description: article.description,
        sanction: article.sanction,
        badge_variant: article.badge_variant as any,
        category: article.category,
      });
    } else {
      reset({
        article_num: "",
        title: "",
        description: "",
        sanction: "",
        badge_variant: "neutral",
        category: "",
      });
    }
  }, [article, reset, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: CreateRegulationDTO) => regulationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regulation-articles"] });
      setNotification("Éxito", "El artículo se creó correctamente.", "success");
      onClose();
    },
    onError: () => {
      setNotification(
        "Error",
        "Ocurrió un error al crear el artículo.",
        "error",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) =>
      regulationApi.update(article!.article_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regulation-articles"] });
      setNotification(
        "Éxito",
        "El artículo se actualizó correctamente.",
        "success",
      );
      onClose();
    },
    onError: () => {
      setNotification(
        "Error",
        "Ocurrió un error al actualizar el artículo.",
        "error",
      );
    },
  });

  const onSubmit = (data: FormValues) => {
    if (article) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={article ? "Editar Artículo" : "Nuevo Artículo"}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Número de Artículo"
            placeholder="Ej. ARTÍCULO 14.2"
            {...register("article_num")}
            error={errors.article_num?.message}
          />
          <Input
            label="Título Corto"
            placeholder="Ej. Faltas Graves"
            {...register("title")}
            error={errors.title?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Categoría"
            placeholder="Ej. Sanciones Disciplinarias"
            {...register("category")}
            error={errors.category?.message}
          />
          <Select
            label="Color del Artículo (Badge)"
            {...register("badge_variant")}
            error={errors.badge_variant?.message}
          >
            <option value="neutral">Neutral (Gris)</option>
            <option value="primary">Primario (Azul/Tema)</option>
            <option value="warning">Advertencia (Amarillo)</option>
            <option value="danger">Peligro (Rojo)</option>
            <option value="info">Información (Celeste)</option>
            <option value="success">Éxito (Verde)</option>
            <option value="outline">Borde solamente</option>
          </Select>
        </div>

        <Textarea
          label="Descripción del Artículo"
          placeholder="Texto completo de la regla o normativa..."
          rows={4}
          {...register("description")}
          error={errors.description?.message}
        />

        <Input
          label="Sanción"
          placeholder="Ej. Suspensión de 2 partidos y multa de $5"
          {...register("sanction")}
          error={errors.sanction?.message}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            {article ? "Guardar Cambios" : "Crear Artículo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
