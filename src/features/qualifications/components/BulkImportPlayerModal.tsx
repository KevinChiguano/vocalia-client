import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Upload, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { CreatePlayerDto } from "../types/player.types";
import { playerApi } from "../api/player.api";
import { Team } from "../types/team.types";
import { Category } from "../types/category.types";
import { Select } from "@/components/ui/Select";

interface BulkImportPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teamId?: number;
  categoryId?: number;
  teams?: Team[];
  categories?: Category[];
}

export const BulkImportPlayerModal = ({
  isOpen,
  onClose,
  onSuccess,
  teamId,
  categoryId,
  teams = [],
  categories = [],
}: BulkImportPlayerModalProps) => {
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
      const data = XLSX.utils.sheet_to_json(ws);
      setData(data); // Preview data
    };

    reader.readAsBinaryString(file);
  };

  const processData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map and validate
      const playersToCreate: CreatePlayerDto[] = data.map((row: any) => ({
        name: row.Nombre || row.name || row.nombres,
        lastname: row.Apellido || row.lastname || row.apellidos,
        dni: String(row.DNI || row.dni || row.cedula),
        number: Number(row.Numero || row.number || row.dorsal) || undefined,
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
      alert(`${playersToCreate.length} jugadores importados correctamente.`);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Jugadores Masivamente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2">
              Sube un archivo Excel (.xlsx) con las columnas: Nombre, Apellido,
              DNI, Numero
            </p>
            <button
              onClick={() => {
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet([
                  {
                    Nombre: "Juan",
                    Apellido: "Perez",
                    DNI: "1234567890",
                    Numero: 10,
                  },
                ]);
                XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
                XLSX.writeFile(wb, "plantilla_jugadores.xlsx");
              }}
              className="text-xs text-primary hover:underline mb-4 bg-transparent border-none cursor-pointer p-0"
            >
              Descargar plantilla de ejemplo
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Categoría (Opcional)"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  // Reset team if category changes to keep consistency
                  // setSelectedTeam("");
                }}
              >
                <option value="">Seleccionar Categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Equipo (Requerido)"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                error={
                  !selectedTeam && data.length > 0 ? "Requerido" : undefined
                }
              >
                <option value="">Seleccionar Equipo</option>
                {teams
                  .filter((t) =>
                    selectedCategory
                      ? Number(t.categoryId) === Number(selectedCategory)
                      : true,
                  )
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
              </Select>
            </div>

            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary/90"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {data.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DNI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apellido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numero
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.DNI || row.dni || row.cedula}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.Nombre || row.name || row.nombres}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.Apellido || row.lastname || row.apellidos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.Numero || row.number || row.dorsal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500 text-center">
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
              disabled={loading || data.length === 0}
            >
              {loading ? "Importando..." : "Importar Datos"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
