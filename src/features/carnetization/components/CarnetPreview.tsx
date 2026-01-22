import { Camera, FileImage, Download } from "lucide-react";
import { Player } from "@/features/qualifications/types/player.types";
import { exportCarnetToPNG } from "../utils/exportCarnetsPNG.util";
import { useUIStore } from "@/store/ui.store";

interface CarnetPreviewProps {
  player: Player;
  color?: "gold" | "blue" | "red" | "purple";
  leagueName?: string;
  presidentName?: string;
  activeYear?: string;
  logoUrl?: string; // This is the team logo, usually.
  leagueLogoUrl?: string; // New prop for league logo on back
  signatureUrl?: string;
  disableDownload?: boolean;
  onDownloadBlocked?: () => void;
}

const colores = {
  gold: {
    gradiente: "from-[#ffd700] via-[#f4c430] to-[#daa520]",
    oscuro: "from-[#daa520] to-[#b8860b]",
    borde: "border-[#b8860b]",
    texto: "text-[#b8860b]",
  },
  blue: {
    gradiente: "from-blue-400 via-blue-500 to-blue-600",
    oscuro: "from-blue-600 to-blue-700",
    borde: "border-blue-700",
    texto: "text-blue-600",
  },
  red: {
    gradiente: "from-red-400 via-red-500 to-red-600",
    oscuro: "from-red-600 to-red-700",
    borde: "border-red-700",
    texto: "text-red-600",
  },
  purple: {
    gradiente: "from-purple-400 via-purple-500 to-purple-600",
    oscuro: "from-purple-600 to-purple-700",
    borde: "border-purple-700",
    texto: "text-purple-600",
  },
};

export const CarnetPreview = ({
  player,
  color = "gold",
  leagueName = "Liga Deportiva Barrial San Fernando",
  presidentName = "Sr. Marco Martínez",
  activeYear = "2025-2026",
  logoUrl, // We'll try to get this from player.team.logo if not provided
  leagueLogoUrl,
  signatureUrl,
  disableDownload,
  onDownloadBlocked,
}: CarnetPreviewProps) => {
  const colorActual = colores[color];

  const teamLogo = logoUrl || (player.team?.logo as string);

  const downloadPNG = async () => {
    if (disableDownload) {
      onDownloadBlocked?.();
      return;
    }
    const { showLoader, hideLoader } = useUIStore.getState();
    showLoader();
    try {
      await exportCarnetToPNG(player.dni, player.name);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="flex flex-col gap-4 print:gap-0 print:block group relative">
      {/* PNG Download Button - Hidden on Print */}
      <button
        onClick={downloadPNG}
        className="absolute -top-4 -right-4 z-20 p-2 bg-white rounded-full shadow-lg border border-border transition-all hover:bg-surface hover:scale-110 print:hidden"
        title="Descargar PNG"
      >
        <Download className="w-5 h-5 text-primary" />
      </button>

      {/* Frente del Carnet */}
      <div className="print:break-after-page print:mb-0 mb-4">
        <div
          id={`carnet-frente-${player.dni}`}
          className={`relative w-[450px] h-[284px] bg-gradient-to-br ${colorActual.gradiente} rounded-xl overflow-hidden shadow-2xl border-4 border-white mx-auto`}
        >
          {/* Patrón de cuadrícula sutil */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px),
                repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px)
              `,
              }}
            />
          </div>

          <div className="relative z-10 h-full p-4 flex flex-col">
            {/* Header con logo y QR */}
            <div className="flex justify-between items-start mb-2">
              <div
                className={`w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg border-2 ${colorActual.borde}`}
              >
                {teamLogo ? (
                  <img
                    src={teamLogo}
                    alt="Logo"
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className={`text-[8px] font-bold ${colorActual.texto}`}>
                    LOGO
                  </div>
                )}
              </div>

              <div className="bg-white px-4 py-1 text-center flex-1 mx-2 shadow-lg rounded mt-2">
                <div className="text-sm font-black text-gray-800 tracking-wide truncate">
                  {player.team?.name || "SIN EQUIPO"}
                </div>
              </div>

              <div
                className={`w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg border-2 ${colorActual.borde}`}
              >
                <div className="text-[8px] font-bold text-gray-600">QR</div>
              </div>

              <div
                className={`w-12 h-12 ml-1 bg-white rounded-lg px-2 py-1 shadow-lg border-2 ${colorActual.borde} min-w-[40px] text-center`}
              >
                <div className={`text-[8px] font-bold ${colorActual.texto}`}>
                  No.
                </div>
                <div
                  className={`text-lg font-black ${colorActual.texto} leading-none`}
                >
                  {player.number || "00"}
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 flex gap-3 overflow-hidden mt-1">
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="text-[8px] font-bold text-white mb-0.5 uppercase tracking-wide">
                    Nombres:
                  </div>
                  <div
                    className={`bg-gradient-to-r ${colorActual.oscuro} px-2 py-1.5 mb-2 rounded shadow-md`}
                  >
                    <div className="text-[11px] font-black text-white leading-tight uppercase truncate">
                      {player.name} {player.lastname}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-1">
                    <div>
                      <div className="text-[8px] font-bold text-white uppercase">
                        Cédula:
                      </div>
                      <div
                        className={`bg-gradient-to-r ${colorActual.oscuro} px-2 py-1 rounded shadow-md`}
                      >
                        <div className="text-[10px] font-black text-white">
                          {player.dni}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-white uppercase">
                        DD/MM/AA:
                      </div>
                      <div
                        className={`bg-gradient-to-r ${colorActual.oscuro} px-2 py-1 rounded shadow-md`}
                      >
                        <div className="text-[10px] font-black text-white">
                          {player.birthDate
                            ? (() => {
                                const date = new Date(player.birthDate);
                                const day = date.getUTCDate();
                                const month = date.getUTCMonth() + 1;
                                const year = date.getUTCFullYear();
                                return `${day}/${month}/${year}`;
                              })()
                            : "00/00/0000"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[8px] font-bold text-white mb-0.5 uppercase">
                      Categoría:
                    </div>
                    <div
                      className={`bg-gradient-to-r ${colorActual.oscuro} px-2 py-1 rounded shadow-md`}
                    >
                      <div className="text-sm font-black text-white uppercase truncate">
                        {player.category?.name || "MÁXIMA"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Balones decorativos */}
                <div className="flex gap-2 mt-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="relative w-6 h-6">
                      <div className="absolute inset-0 bg-white rounded-full shadow-lg"></div>
                      <div className="absolute inset-0.5 rounded-full border-2 border-gray-800 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-full relative">
                            <div className="absolute inset-0 border-[1px] border-gray-800"></div>
                            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Foto del jugador */}
              <div
                className={`w-24 h-28 bg-white rounded-lg shadow-2xl flex items-center justify-center overflow-hidden border-2 ${colorActual.borde} shrink-0 mt-3`}
              >
                {player.imageUrl ? (
                  <img
                    src={player.imageUrl}
                    alt="Jugador"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="w-6 h-6 text-gray-300 mx-auto mb-0.5" />
                    <div className="text-gray-400 text-[8px] font-bold">
                      FOTO
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reverso del Carnet */}
      <div className="print:break-after-page">
        <div
          id={`carnet-reverso-${player.dni}`}
          className={`relative w-[450px] h-[284px] bg-gradient-to-br from-white to-gray-50 rounded-xl overflow-hidden shadow-2xl border-4 ${colorActual.borde} mx-auto`}
        >
          {/* Franja decorativa superior */}
          <div
            className={`h-8 bg-gradient-to-br ${colorActual.gradiente} relative overflow-hidden`}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 20px)`,
              }}
            />
          </div>

          <div className="px-4 py-3 flex flex-col items-center h-[calc(100%-2rem)]">
            {/* Título de la liga */}
            <div className="text-center">
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                {leagueName}
              </h2>
              <div
                className={`h-0.5 w-16 bg-gradient-to-r ${colorActual.gradiente} mx-auto rounded-full mt-1`}
              ></div>
            </div>

            {/* Logo de la Liga - SIN FONDO */}
            <div className="w-25 h-13 flex items-center justify-center mt-1">
              {leagueLogoUrl ? (
                <img
                  src={leagueLogoUrl}
                  alt="Liga"
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-[8px] text-gray-400 font-semibold">
                  LOGO LIGA
                </div>
              )}
            </div>

            {/* Firma */}
            <div className="w-24 h-14  rounded-lg flex items-center justify-center mb-2 mt-1">
              {signatureUrl ? (
                <img
                  src={signatureUrl}
                  alt="Firma"
                  className="max-w-full max-h-full object-contain p-1"
                />
              ) : (
                <div className="text-center">
                  <FileImage className="w-5 h-5 text-gray-300 mx-auto mb-0.5" />
                  <div className="text-gray-400 text-[7px] font-bold">
                    FIRMA/QR
                  </div>
                </div>
              )}
            </div>

            {/* Información del presidente */}
            <div className="text-center mb-1">
              <div className="text-[11px] font-bold text-gray-800 mb-0.5">
                {presidentName}
              </div>
              <div className="text-[9px] text-gray-600 font-semibold uppercase tracking-wide">
                Presidente
              </div>
            </div>

            {/* Año activo */}
            <div
              className={`inline-block bg-gradient-to-r ${colorActual.gradiente} text-white px-7 py-1.5 rounded-full shadow-lg mt-1`}
            >
              <div className="text-[11px] font-black">{activeYear}</div>
            </div>
          </div>

          {/* Franja inferior */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colorActual.gradiente}`}
          ></div>
        </div>
      </div>
    </div>
  );
};
