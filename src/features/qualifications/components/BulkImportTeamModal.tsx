import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Upload, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import logoDefault from "@/assets/logo_san_fernando.png";
import { CreateTeamDto } from "../types/team.types";
import { teamApi } from "../api/team.api";
import { useUIStore } from "@/store/ui.store";
import { Category } from "../types/category.types";
import { Select } from "@/components/ui/Select";

interface BulkImportTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  categoryId?: number;
}

export const BulkImportTeamModal = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  categoryId,
}: BulkImportTeamModalProps) => {
  const { setNotification } = useUIStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryId ? String(categoryId) : "",
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const parsedData = XLSX.utils.sheet_to_json(ws);
      setData(parsedData); // Preview data
    };

    reader.readAsBinaryString(file);
  };

  const processData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map and validate
      const teamsToCreate: CreateTeamDto[] = data.map((row: any) => ({
        name: row.Nombre || row.name || row.nombre,
        logo: row.Logo || row.logo || undefined,
        categoryId:
          Number(selectedCategory) ||
          (row.CategoryId || row.category_id
            ? Number(row.CategoryId || row.category_id)
            : 0),
      }));

      // Basic validation
      const invalid = teamsToCreate.filter((t) => !t.name || !t.categoryId);

      if (invalid.length > 0) {
        throw new Error(
          `Hay ${invalid.length} filas inválidas. Asegúrate de tener Nombre y Categoría.`,
        );
      }

      await teamApi.bulkCreateTeams(teamsToCreate);
      setNotification(
        "Éxito",
        `${teamsToCreate.length} equipos importados correctamente.`,
        "success",
      );
      onSuccess();
      onClose();
      setData([]);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Error al importar equipos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Equipos Masivamente"
      maxWidth="3xl"
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
        <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-surface">
          <Upload className="w-10 h-10 text-text-muted mb-2" />
          <p className="text-sm text-text-muted mb-2 text-center">
            Sube un archivo Excel (.xlsx) con la columna: Nombre
          </p>
          <button
            onClick={async () => {
              const workbook = new ExcelJS.Workbook();
              const worksheet = workbook.addWorksheet("Plantilla Equipos", {
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
              worksheet.mergeCells("B1:C1");
              const title1 = worksheet.getCell("B1");
              title1.value = "LIGA INDEPENDIENTE, SOCIAL Y CULTURAL";
              title1.font = { name: "Arial", bold: true, size: 16 };
              title1.alignment = { horizontal: "center", vertical: "middle" };

              worksheet.mergeCells("B2:C2");
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

              worksheet.mergeCells("B3:C3");
              const title3 = worksheet.getCell("B3");
              title3.value = "PLANTILLA DE IMPORTACIÓN DE EQUIPOS";
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
                "Nombre del Equipo",
                "URL Logo (Opcional)",
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
              sampleRow1.values = ["", "Equipo Ejemplo", ""];
              const sampleRow2 = worksheet.getRow(7);
              sampleRow2.values = ["", "FC Barcelona", ""];

              [sampleRow1, sampleRow2].forEach((row) => {
                row.eachCell((cell: any) => {
                  cell.alignment = { horizontal: "left", vertical: "middle" };
                  cell.border = {
                    top: { style: "thin", color: { argb: "FFCCCCCC" } },
                    left: { style: "thin", color: { argb: "FFCCCCCC" } },
                    bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
                    right: { style: "thin", color: { argb: "FFCCCCCC" } },
                  };
                });
              });

              worksheet.columns = [{ width: 14 }, { width: 40 }, { width: 40 }];

              // Generate and save
              const buffer = await workbook.xlsx.writeBuffer();
              const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "plantilla_equipos.xlsx";
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="text-xs font-bold text-primary hover:text-primary-hover hover:underline mb-4 bg-transparent border-none cursor-pointer p-0 transition-colors"
          >
            Descargar plantilla de ejemplo
          </button>

          <div className="w-full max-w-sm mb-4">
            <Select
              label="Categoría (Requerido)"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              error={
                !selectedCategory && data.length > 0 ? "Requerido" : undefined
              }
            >
              <option value="">Seleccionar Categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

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
                    Nombre
                  </th>
                </tr>
              </thead>
              <tbody className="bg-bg divide-y divide-border">
                {data.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                      {row.Nombre || row.name || row.nombre}
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
          <Button
            onClick={processData}
            disabled={loading || data.length === 0 || !selectedCategory}
          >
            {loading ? "Importando..." : "Importar Datos"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
