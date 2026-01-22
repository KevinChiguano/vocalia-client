import { Trash2 } from "lucide-react";
import { Team } from "@/features/qualifications/types/team.types";
import { Category } from "@/features/qualifications/types/category.types";
import { User } from "@/features/administration/types/user.types";
import { Field } from "../types/field.types";
import { Select } from "@/components/ui/Select";
import { useMemo } from "react";

interface MatchData {
  time: string;
  localTeamId: number;
  awayTeamId: number;
  category: string;
  vocalUserId: number;
  fieldId: number;
}

interface Props {
  data: MatchData;
  teams: Team[];
  categories: Category[];
  vocals: User[];
  fields: Field[];
  onUpdate: (updated: MatchData) => void;
  onRemove: () => void;
}

export const ScheduleMatchRow = ({
  data,
  teams,
  categories,
  vocals,
  fields,
  onUpdate,
  onRemove,
}: Props) => {
  // Filter teams based on the selected category name
  const filteredTeams = useMemo(() => {
    if (!data.category) return [];
    return teams.filter((t) => t.category?.name === data.category);
  }, [teams, data.category]);

  const handleChange = (field: keyof MatchData, value: any) => {
    onUpdate({
      ...data,
      [field]: value,
    });
  };

  return (
    <tr className="border-b border-border hover:bg-elevated/30 transition-colors group">
      {/* Time */}
      <td className="p-2">
        <input
          type="text"
          placeholder="HH:mm (24h)"
          className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20 text-center"
          value={data.time}
          onChange={(e) => {
            let val = e.target.value;
            // Basic auto-formatting for HH:mm
            if (
              val.length === 2 &&
              !val.includes(":") &&
              data.time.length < 2
            ) {
              val += ":";
            }
            if (val.length <= 5) {
              handleChange("time", val);
            }
          }}
          onBlur={(e) => {
            // Validate on blur
            const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!regex.test(e.target.value)) {
              // Fallback to 08:00 if invalid
              handleChange("time", "08:00");
            }
          }}
        />
      </td>

      {/* Local Team */}
      <td className="p-2">
        <Select
          className="px-2 py-1.5"
          value={data.localTeamId}
          onChange={(e) => handleChange("localTeamId", Number(e.target.value))}
        >
          <option value={0}>Seleccionar Equipo...</option>
          {filteredTeams.map((t) => (
            <option
              key={t.id}
              value={t.id}
              disabled={Number(t.id) === data.awayTeamId}
            >
              {t.name}
            </option>
          ))}
        </Select>
      </td>

      {/* VS Divider */}
      <td className="p-2 text-center">
        <span className="text-[10px] font-black text-text-muted">VS</span>
      </td>

      {/* Away Team */}
      <td className="p-2">
        <Select
          className="px-2 py-1.5"
          value={data.awayTeamId}
          onChange={(e) => handleChange("awayTeamId", Number(e.target.value))}
        >
          <option value={0}>Seleccionar Equipo...</option>
          {filteredTeams.map((t) => (
            <option
              key={t.id}
              value={t.id}
              disabled={Number(t.id) === data.localTeamId}
            >
              {t.name}
            </option>
          ))}
        </Select>
      </td>

      {/* Category */}
      <td className="p-2">
        <Select
          className="px-2 py-1.5"
          value={data.category}
          onChange={(e) => {
            const newCategory = e.target.value;
            // When category changes, reset teams if they don't belong to the new category
            onUpdate({
              ...data,
              category: newCategory,
              localTeamId: 0,
              awayTeamId: 0,
            });
          }}
        >
          <option value="">Seleccionar Categoría...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>
      </td>

      {/* Vocal */}
      <td className="p-2">
        <Select
          className="px-2 py-1.5"
          value={data.vocalUserId}
          onChange={(e) => handleChange("vocalUserId", Number(e.target.value))}
        >
          <option value={0}>Seleccionar Vocal...</option>
          {vocals.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </Select>
      </td>

      {/* Field (Cancha) */}
      <td className="p-2">
        <Select
          className="px-2 py-1.5 font-bold text-primary"
          value={data.fieldId}
          onChange={(e) => handleChange("fieldId", Number(e.target.value))}
        >
          <option value={0}>Seleccionar Cancha...</option>
          {fields.map((f) => (
            <option key={f.field_id.toString()} value={Number(f.field_id)}>
              {f.name}
            </option>
          ))}
        </Select>
      </td>

      {/* Actions */}
      <td className="p-2 text-center no-print">
        <button
          onClick={onRemove}
          className="p-2 text-text-muted hover:text-danger hover:bg-danger/5 rounded-lg transition-all"
          title="Eliminar Partido"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};
