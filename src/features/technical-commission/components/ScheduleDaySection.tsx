import { Plus } from "lucide-react";
import { ScheduleMatchRow } from "./ScheduleMatchRow";
import { Team } from "@/features/qualifications/types/team.types";
import { Category } from "@/features/qualifications/types/category.types";
import { User } from "@/features/administration/types/user.types";
import { Field } from "../types/field.types";

interface MatchData {
  time: string;
  localTeamId: number;
  awayTeamId: number;
  category: string;
  vocalUserId: number;
  fieldId: number;
}

interface DayData {
  id: string;
  date: string;
  matches: MatchData[];
}

interface Props {
  day: DayData;
  teams: Team[];
  categories: Category[];
  vocals: User[];
  fields: Field[];
  onUpdateDay: (updatedDay: DayData) => void;
  onRemoveDay: () => void;
}

export const ScheduleDaySection = ({
  day,
  teams,
  categories,
  vocals,
  fields,
  onUpdateDay,
  onRemoveDay,
}: Props) => {
  const addMatch = () => {
    onUpdateDay({
      ...day,
      matches: [
        ...day.matches,
        {
          time: "08:00",
          localTeamId: 0,
          awayTeamId: 0,
          category: categories[0]?.name || "",
          vocalUserId: 0,
          fieldId: fields[0]?.field_id ? Number(fields[0].field_id) : 0,
        },
      ],
    });
  };

  const updateMatch = (index: number, updatedMatch: MatchData) => {
    const newMatches = [...day.matches];
    newMatches[index] = updatedMatch;
    onUpdateDay({ ...day, matches: newMatches });
  };

  const removeMatch = (index: number) => {
    onUpdateDay({
      ...day,
      matches: day.matches.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-surface border-y border-border">
      {/* Day Header */}
      <div className="bg-elevated/50 border-b border-border px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
          <input
            type="date"
            className="font-bold text-primary uppercase tracking-wider bg-surface border border-border sm:border-none focus:ring-2 focus:ring-primary/20 rounded-lg px-3 py-1.5 sm:px-2 sm:py-0 outline-none cursor-pointer w-full sm:w-auto"
            value={day.date}
            onChange={(e) => onUpdateDay({ ...day, date: e.target.value })}
          />
          <span className="text-text-subtle font-black text-[10px] tracking-widest shrink-0 hidden xs:inline">
            # PROGRAMACIÓN DIARIA
          </span>
        </div>

        <button
          onClick={onRemoveDay}
          className="text-[10px] font-black text-danger hover:text-danger/80 transition-colors uppercase tracking-widest no-print"
        >
          Eliminar Día
        </button>
      </div>

      {/* Matches Table Container */}
      <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <table className="w-full border-collapse min-w-[800px]">
          <thead className="bg-bg border-b border-border">
            <tr className="[&_th]:font-black [&_th]:uppercase [&_th]:tracking-widest [&_th]:text-[10px] [&_th]:text-text-muted">
              <th className="p-3">Hora</th>
              <th className="p-3">Equipo 1</th>
              <th className="p-3 w-10"></th>
              <th className="p-3">Equipo 2</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Vocal</th>
              <th className="p-3">Cancha</th>
              <th className="p-3 w-12 no-print"></th>
            </tr>
          </thead>
          <tbody className="bg-surface">
            {day.matches.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-12 text-center text-text-muted italic font-medium"
                >
                  No hay partidos programados para este día.
                </td>
              </tr>
            ) : (
              day.matches.map((match, idx) => (
                <ScheduleMatchRow
                  key={`${day.id}-match-${idx}`}
                  data={match}
                  teams={teams}
                  categories={categories}
                  vocals={vocals}
                  fields={fields}
                  onUpdate={(updated) => updateMatch(idx, updated)}
                  onRemove={() => removeMatch(idx)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Match Button */}
      <div className="p-3 flex justify-center border-t border-border no-print">
        <button
          onClick={addMatch}
          className="flex items-center gap-2 px-6 py-2 bg-primary/5 text-primary rounded-full border border-primary/20 font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Añadir Partido
        </button>
      </div>
    </div>
  );
};
