import { useState } from "react";
import { Edit2, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import logoDefault from "@/assets/logo_san_fernando.png";

interface Props {
  onExportPdf: () => void;
  logoUrl?: string;
  onLogoChange?: (url: string) => void;
  title1?: string;
  onTitle1Change?: (val: string) => void;
  title2?: string;
  onTitle2Change?: (val: string) => void;
  title3?: string;
  onTitle3Change?: (val: string) => void;
}

export const ScheduleHeader = ({
  onExportPdf,
  logoUrl = logoDefault,
  onLogoChange,
  title1 = "LIGA INDEPENDIENTE, SOCIAL Y CULTURAL",
  onTitle1Change,
  title2 = '" SAN FERNANDO DE GUAMANI "',
  onTitle2Change,
  title3 = "HOJA DE PROGRAMACIÓN",
  onTitle3Change,
}: Props) => {
  const [isEditingHeader, setIsEditingHeader] = useState(false);

  return (
    <div className="bg-surface border-b-2 border-border p-4 md:p-6 relative">
      <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8">
        {/* Logo Section */}
        <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 flex items-center justify-center border border-border rounded-lg bg-white relative group overflow-hidden">
          <img
            src={logoUrl}
            alt="Liga Logo"
            crossOrigin="anonymous"
            className="max-w-full max-h-full object-contain p-2"
            onError={(e) =>
              (e.currentTarget.src =
                "https://via.placeholder.com/150?text=LOGO")
            }
          />
          {isEditingHeader && (
            <div className="absolute inset-0 bg-overlay flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <input
                type="text"
                className="text-[10px] w-full p-1 bg-surface border-none outline-none"
                placeholder="URL Logo"
                value={logoUrl}
                onChange={(e) => onLogoChange?.(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Titles Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1 md:space-y-2 w-full">
          {isEditingHeader ? (
            <>
              <input
                className="w-full text-center font-bold text-xl md:text-2xl bg-bg border border-primary/30 rounded px-2"
                value={title1}
                onChange={(e) => onTitle1Change?.(e.target.value)}
              />
              <input
                className="w-full text-center font-bold text-lg md:text-xl bg-bg border border-primary/30 rounded px-2"
                value={title2}
                onChange={(e) => onTitle2Change?.(e.target.value)}
              />
              <input
                className="w-full text-center font-bold text-base md:text-lg text-danger bg-bg border border-primary/30 rounded px-2"
                value={title3}
                onChange={(e) => onTitle3Change?.(e.target.value)}
              />
            </>
          ) : (
            <>
              <h1 className="type-h3 md:type-h2 font-black text-text leading-tight uppercase tracking-tight">
                {title1}
              </h1>
              <h2 className="type-sm md:type-h3 font-bold text-text-muted">
                {title2}
              </h2>
              <h3 className="type-xs md:type-body font-bold text-danger uppercase tracking-widest">
                {title3}
              </h3>
            </>
          )}
        </div>

        {/* Transient Actions */}
        <div className="flex flex-row lg:flex-col gap-2 no-print shrink-0 w-full lg:w-auto justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingHeader(!isEditingHeader)}
            className="gap-2 bg-surface flex-1 lg:flex-none"
          >
            {isEditingHeader ? (
              <>
                <Check className="w-4 h-4" /> Finalizar
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />{" "}
                <span className="hidden sm:inline">Editar</span> Encabezado
              </>
            )}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onExportPdf}
            className="gap-2 flex-1 lg:flex-none"
          >
            <Download className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">Exportar </span>PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
