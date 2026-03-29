import React, { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { getDirectImageUrl } from "@/utils/imageUtils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder: "teams" | "players" | "others";
  label?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  folder,
  label,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona una imagen válida");
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir la imagen. Por favor, inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className={`space-y-2 flex flex-col items-center ${className}`}>
      {label && (
        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {label}
        </label>
      ) }
      
      <div className="relative group w-full flex justify-center">
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
        />

        {value ? (
          <div className="relative aspect-square w-40 h-40 rounded-2xl border-2 border-dashed border-border overflow-hidden bg-elevated/50 group">
            <img
              src={getDirectImageUrl(value)}
              alt="Preview"
              className="w-full h-full object-contain p-2"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="xs"
                onClick={() => fileInputRef.current?.click()}
              >
                Cambiar
              </Button>
              <Button
                type="button"
                variant="danger"
                size="xs"
                isIconOnly
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square w-40 h-40 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-text-muted group"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Subiendo...</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Subir Imagen</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <p className="text-[9px] text-text-muted italic text-center">
        Formatos soportados: PNG, JPG, WebP. Máximo 5MB.
      </p>
    </div>
  );
};
