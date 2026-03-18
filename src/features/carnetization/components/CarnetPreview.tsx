import { Camera, QrCode, Shield, FileImage } from "lucide-react";
import { Player } from "../../qualifications/types/player.types";
import { useEffect, useState } from "react";

const Base64Image = ({ src, alt, className, style }: any) => {
  const [base64, setBase64] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setBase64(null);
      return;
    }
    if (src.startsWith("data:")) {
      setBase64(src);
      return;
    }

    let isMounted = true;
    setBase64(null);

    fetch(src, { mode: "cors" })
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted) {
            setBase64(reader.result as string);
          }
        };
        reader.readAsDataURL(blob);
      })
      .catch((err) => {
        console.warn("Base64 conversion error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (!src) return null;

  return (
    <img
      src={base64 || src}
      alt={alt}
      className={className}
      style={style}
      crossOrigin={base64 ? undefined : "anonymous"}
    />
  );
};

export interface CarnetPreviewProps {
  player: Player;
  idPrefix?: string;
  color?:
    | "gold"
    | "blue"
    | "red"
    | "purple"
    | "primary"
    | "info"
    | "success"
    | "slate"
    | "secondary"
    | "accent"
    | "danger"
    | "warning";
  leagueName?: string;
  presidentName?: string;
  activeYear?: string;
  leagueLogoUrl?: string; // New: League logo URL
  signatureUrl?: string; // New: Signature image URL
  logoUrl?: string;
}

const colores = {
  primary: {
    bg: "bg-primary",
    bgMuted: "bg-primary/10",
    textMuted: "text-primary",
    textLight: "text-white",
    borderActive: "border-primary",
  },
  info: {
    bg: "bg-info",
    bgMuted: "bg-info/10",
    textMuted: "text-info",
    textLight: "text-white",
    borderActive: "border-info",
  },
  success: {
    bg: "bg-success",
    bgMuted: "bg-success/10",
    textMuted: "text-success",
    textLight: "text-white",
    borderActive: "border-success",
  },
  slate: {
    bg: "bg-slate-700",
    bgMuted: "bg-slate-700/10",
    textMuted: "text-slate-700",
    textLight: "text-white",
    borderActive: "border-slate-700",
  },
};

export const CarnetPreview = ({
  player,
  idPrefix = "",
  color = "primary",
  leagueName = "Liga Deportiva Barrial San Fernando",
  presidentName = "Sr. Marco Martínez",
  activeYear = "2025-2026",
  leagueLogoUrl,
  signatureUrl,
  logoUrl,
}: CarnetPreviewProps) => {
  const colorActual = colores[color as keyof typeof colores] || colores.primary;

  const teamLogo = logoUrl || (player.team?.logo as string);

  const safeImageUrl = player.imageUrl;
  const safeTeamLogo = teamLogo;
  const safeLeagueLogo = leagueLogoUrl;
  const safeSignature = signatureUrl;

  return (
    <div className="flex flex-col lg:flex-row gap-6 print:gap-0 print:block group relative items-center justify-center">
      {/* Frente del Carnet */}
      <div className="print:break-after-page print:mb-0">
        <div
          id={`${idPrefix}carnet-frente-${player.dni}`}
          className={`relative w-[284px] h-[450px] ${colorActual.bg} rounded-xl shadow-2xl overflow-hidden flex flex-col items-center mx-auto`}
        >
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>

          {/* Header */}
          <div className="w-full flex justify-between items-start mb-4 z-10 px-4 pt-4">
            <div className="text-[10px] font-bold text-white uppercase opacity-80 leading-tight shrink-0 max-w-[65%] truncate">
              {player.team?.name || "LIGA NACIONAL"}
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shrink-0">
              {safeLeagueLogo ? (
                <Base64Image
                  src={safeLeagueLogo}
                  alt="Liga"
                  className="w-full h-full object-contain p-1 rounded-full"
                />
              ) : (
                <Shield className="text-white w-4 h-4" />
              )}
            </div>
          </div>

          {/* Profile Picture */}
          <div className="w-32 h-32 rounded-full border-4 border-white/30 overflow-hidden mb-4 z-10 shadow-lg bg-surface shrink-0">
            {safeImageUrl ? (
              <Base64Image
                src={safeImageUrl}
                alt="Jugador"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Camera className="w-8 h-8 text-border mb-1" />
                <div className="text-text-muted text-[10px] font-bold">
                  FOTO
                </div>
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="text-center z-10 px-4 w-full mt-2">
            <h3 className="text-white font-black text-lg uppercase leading-none mb-1 wrap-break-word">
              {player.name} {player.lastname}
            </h3>
            <p className="text-white/80 text-[10px] font-medium tracking-widest uppercase truncate">
              JUGADOR
            </p>
          </div>

          {/* ✅ Team Logo debajo del Player Info — con colores reales (sin filtro) */}
          {safeTeamLogo && (
            <div className="z-10 mt-3 mb-2 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center p-1.5">
                <Base64Image
                  src={safeTeamLogo}
                  alt="Logo del Equipo"
                  className="w-full h-full object-contain mix-blend-multiply"
                  style={{ filter: "none" }}
                />
              </div>
            </div>
          )}

          {/* Footer Info Box */}
          <div className="mt-auto w-full bg-black/20 backdrop-blur-sm p-3 z-10 grid grid-cols-2 gap-2 text-white">
            <div className="text-center">
              <p className="text-[8px] uppercase opacity-70">Categoría</p>
              <p className="text-xs font-bold truncate">
                {player.category?.name || "N/A"}
              </p>
            </div>
            <div className="text-center border-l border-white/20">
              <p className="text-[8px] uppercase opacity-70">ID Número</p>
              <p className="text-xs font-bold truncate">{player.dni}</p>
            </div>
          </div>
          <p className="my-2 text-[8px] text-white/50 font-bold tracking-widest uppercase z-10 w-full text-center">
            {activeYear}
          </p>
        </div>
      </div>

      {/* Reverso del Carnet */}
      <div className="print:break-after-page">
        <div
          id={`${idPrefix}carnet-reverso-${player.dni}`}
          className={`relative w-[284px] h-[450px] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col text-gray-800 mx-auto p-5`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div
              className={`w-10 h-10 ${colorActual.bgMuted} rounded-lg flex items-center justify-center ${colorActual.textMuted}`}
            >
              <QrCode className="w-5 h-5" />
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-text-muted uppercase leading-none mb-1">
                Vigencia
              </p>
              <p className="text-xs font-black truncate max-w-[100px]">
                {activeYear}
              </p>
            </div>
          </div>

          {/* League Info Box */}
          <div className="mb-2 flex flex-col items-center">
            <p className="text-[10px] font-bold text-text-subtle uppercase mb-2">
              Liga Oficial
            </p>
            {safeLeagueLogo && (
              <div className="w-16 h-16 mb-2">
                <Base64Image
                  src={safeLeagueLogo}
                  alt="Liga"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="text-xs font-black border-b border-border pb-1 wrap-break-word text-center w-full">
              {leagueName}
            </div>
          </div>

          {/* Signatures Area */}
          <div className="mt-auto mb-8 flex flex-col items-center">
            <div className="h-14 w-32 grayscale opacity-80 mb-1 flex items-center justify-center">
              {safeSignature ? (
                <Base64Image
                  src={safeSignature}
                  alt="Firma"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center text-text-muted">
                  <FileImage className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <div className="text-[8px] font-bold uppercase">
                    Sin Firma
                  </div>
                </div>
              )}
            </div>
            <div className="w-full border-t border-border text-center pt-1">
              <p className="text-[10px] font-black uppercase truncate">
                {presidentName}
              </p>
              <p className="text-[8px] font-medium text-text-subtle uppercase">
                Presidente de Liga
              </p>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="bg-elevated rounded-lg p-2 text-[7px] text-text-muted leading-tight text-center">
            Este carnet es personal e intransferible. Debe presentarse
            obligatoriamente antes de cada partido oficial al representante de
            la federación.
          </div>
        </div>
      </div>
    </div>
  );
};
