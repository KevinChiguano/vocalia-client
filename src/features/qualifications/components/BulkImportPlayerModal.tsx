import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Upload, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import logoDefault from "@/assets/logo_san_fernando.png";
import { CreatePlayerDto } from "../types/player.types";
import { playerApi } from "../api/player.api";
import { useUIStore } from "@/store/ui.store";

interface BulkImportPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teamId?: number;
  categoryId?: number;
}

export const BulkImportPlayerModal = ({
  isOpen,
  onClose,
  onSuccess,
  teamId,
  categoryId,
}: BulkImportPlayerModalProps) => {
  const { setNotification } = useUIStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTeam, setSelectedTeam] = useState<string>(
    teamId ? String(teamId) : "",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryId ? String(categoryId) : "",
  );

  // Sync props to state when modal opens or props change
  useEffect(() => {
    if (teamId) setSelectedTeam(String(teamId));
    if (categoryId) setSelectedCategory(String(categoryId));
    if (isOpen) {
      setData([]);
      setError(null);
    }
  }, [teamId, categoryId, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      // Find the row with headers to skip titles
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      let headerRowIndex = 0;
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i] || [];
        if (
          row.includes("Nombre") ||
          row.includes("name") ||
          row.includes("nombres")
        ) {
          headerRowIndex = i;
          break;
        }
      }

      const parsedData = XLSX.utils.sheet_to_json(ws, {
        range: headerRowIndex,
      });
      setData(parsedData); // Preview data
    };

    reader.readAsBinaryString(file);
  };

  const processData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map and validate
      const playersToCreate: CreatePlayerDto[] = data.map((row: any) => ({
        name: String(row.Nombre || row.name || row.nombres || ""),
        lastname: String(row.Apellido || row.lastname || row.apellidos || ""),
        dni: String(
          row["DNI / Cédula"] ||
            row["DNI / Cedula"] ||
            row.DNI ||
            row.dni ||
            row.cedula ||
            "",
        ),
        number:
          Number(
            row["Número (Dorsal)"] ||
              row["Numero (Dorsal)"] ||
              row.Numero ||
              row.number ||
              row.dorsal,
          ) || undefined,
        teamId: Number(selectedTeam) || Number(row.TeamId || row.team_id) || 0,
        categoryId:
          Number(selectedCategory) ||
          (row.CategoryId || row.category_id
            ? Number(row.CategoryId || row.category_id)
            : undefined),
        // Add defaults or logic for missing IDs if context not provided
      }));

      // Basic validation
      const invalid = playersToCreate.filter(
        (p) => !p.name || !p.dni || !p.teamId,
      );

      if (invalid.length > 0) {
        throw new Error(
          `Hay ${invalid.length} filas inválidas. Asegúrate de tener DNI, Nombre y que el equipo esté seleccionado.`,
        );
      }

      await playerApi.bulkCreatePlayers(playersToCreate);
      setNotification(
        "Éxito",
        `${playersToCreate.length} jugadores importados correctamente.`,
        "success",
      );
      onSuccess();
      onClose();
      setData([]);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Error al importar jugadores.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Jugadores Masivamente"
      maxWidth="3xl"
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
        <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-surface">
          <Upload className="w-10 h-10 text-text-muted mb-2" />
          <p className="text-sm text-text-muted mb-2 text-center">
            Sube un archivo Excel (.xlsx) con las columnas: Nombre, Apellido,
            DNI, Numero
          </p>
          <button
            onClick={async () => {
              const workbook = new ExcelJS.Workbook();
              const worksheet = workbook.addWorksheet("Plantilla Jugadores", {
                views: [{ showGridLines: false }],
              });

              // 1. Prepare Logo Image
              let logoBase64 = "";
              try {
                const response = await fetch(logoDefault);
                const blob = await response.blob();
                logoBase64 = await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
              } catch (err) {
                console.warn("Could not load logo for Excel", err);
              }

              // Add image to workbook if successfully loaded
              if (logoBase64) {
                const imageId = workbook.addImage({
                  base64: logoBase64,
                  extension: "png",
                });

                worksheet.addImage(imageId, {
                  tl: { col: 0, row: 0 },
                  ext: { width: 80, height: 80 },
                });
              }

              // 2. Add Titles
              worksheet.mergeCells("B1:E1");
              const title1 = worksheet.getCell("B1");
              title1.value = "LIGA INDEPENDIENTE, SOCIAL Y CULTURAL";
              title1.font = { name: "Arial", bold: true, size: 16 };
              title1.alignment = { horizontal: "center", vertical: "middle" };

              worksheet.mergeCells("B2:E2");
              const title2 = worksheet.getCell("B2");
              title2.value = '" SAN FERNANDO DE GUAMANI "';
              title2.font = {
                name: "Arial",
                italic: true,
                bold: true,
                size: 14,
                color: { argb: "FF333333" },
              };
              title2.alignment = { horizontal: "center", vertical: "middle" };

              worksheet.mergeCells("B3:E3");
              const title3 = worksheet.getCell("B3");
              title3.value = "PLANTILLA DE IMPORTACIÓN DE JUGADORES";
              title3.font = {
                name: "Arial",
                bold: true,
                size: 12,
                color: { argb: "FFCC0000" },
              };
              title3.alignment = { horizontal: "center", vertical: "middle" };

              worksheet.getRow(1).height = 25;
              worksheet.getRow(2).height = 20;
              worksheet.getRow(3).height = 18;
              worksheet.getRow(4).height = 15; // padding row

              // Add Headers
              const headerRow = worksheet.getRow(5);
              headerRow.values = [
                "",
                "Nombre",
                "Apellido",
                "DNI / Cédula",
                "Número (Dorsal)",
              ];
              headerRow.height = 20;

              headerRow.eachCell((cell: any) => {
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FF003366" },
                };
                cell.alignment = { horizontal: "center", vertical: "middle" };
                cell.border = {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                };
              });

              // Add sample rows
              const sampleRow1 = worksheet.getRow(6);
              sampleRow1.values = ["", "Juan", "Perez", "1234567890", 10];
              const sampleRow2 = worksheet.getRow(7);
              sampleRow2.values = ["", "Carlos", "Mendez", "0987654321", 7];

              [sampleRow1, sampleRow2].forEach((row) => {
                row.eachCell((cell: any) => {
                  cell.alignment = { horizontal: "center", vertical: "middle" };
                  cell.border = {
                    top: { style: "thin", color: { argb: "FFCCCCCC" } },
                    left: { style: "thin", color: { argb: "FFCCCCCC" } },
                    bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
                    right: { style: "thin", color: { argb: "FFCCCCCC" } },
                  };
                });
              });

              worksheet.columns = [
                { width: 14 }, // Spacer
                { width: 25 }, // Nombre
                { width: 25 }, // Apellido
                { width: 20 }, // DNI
                { width: 18 }, // Numero
              ];

              // Generate and save
              const buffer = await workbook.xlsx.writeBuffer();
              const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "plantilla_jugadores.xlsx";
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="text-xs font-bold text-primary hover:text-primary-hover hover:underline mb-4 bg-transparent border-none cursor-pointer p-0 transition-colors"
          >
            Descargar plantilla de ejemplo
          </button>

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="block w-full text-sm text-text-muted
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary-hover file:cursor-pointer
                cursor-pointer"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {data.length > 0 && (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Apellido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Numero
                  </th>
                </tr>
              </thead>
              <tbody className="bg-bg divide-y divide-border">
                {data.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {row["DNI / Cédula"] ||
                        row["DNI / Cedula"] ||
                        row.DNI ||
                        row.dni ||
                        row.cedula}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                      {row.Nombre || row.name || row.nombres}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {row.Apellido || row.lastname || row.apellidos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {row["Número (Dorsal)"] ||
                        row["Numero (Dorsal)"] ||
                        row.Numero ||
                        row.number ||
                        row.dorsal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-surface text-xs text-text-muted text-center border-t border-border">
              Mostrando {Math.min(data.length, 5)} de {data.length} filas
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={processData} disabled={loading || data.length === 0}>
            {loading ? "Importando..." : "Importar Datos"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
