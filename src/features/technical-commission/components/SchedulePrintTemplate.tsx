import { Team } from "@/features/qualifications/types/team.types";
import { Category } from "@/features/qualifications/types/category.types";
import { User } from "@/features/administration/types/user.types";
import { Field } from "../types/field.types";
import logoDefault from "@/assets/logo_san_fernando.png";

interface Props {
  logoUrl?: string;
  title1: string;
  title2: string;
  title3: string;
  fecha: number;
  vuelta: number;
  days: any[];
  teams: Team[];
  categories: Category[];
  vocals: User[];
  fields: Field[];
  assignedVocalsSummary: any[];
}

export const SchedulePrintTemplate = ({
  logoUrl,
  title1,
  title2,
  title3,
  fecha,
  vuelta,
  days,
  teams,
  vocals,
  fields,
  assignedVocalsSummary,
}: Props) => {
  return (
    <div
      className="bg-white text-black p-8 mx-auto"
      style={{
        width: "800px",
        minHeight: "1123px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-8 border-b-2 border-black pb-6 mb-6">
        <div className="w-24 h-24 shrink-0 flex items-center justify-center">
          <img
            src={logoUrl || logoDefault}
            alt="Logo"
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="flex-1 text-center space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-tight leading-tight">
            {title1}
          </h1>
          <h2 className="text-xl font-bold text-gray-700 italic">{title2}</h2>
          <h3 className="text-lg font-black text-red-600 uppercase tracking-widest">
            {title3}
          </h3>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex gap-12 mx-auto">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">
              FECHA
            </span>
            <span className="text-3xl font-black">{fecha}</span>
          </div>
          <div className="w-px h-10 bg-gray-300 self-center"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">
              VUELTA
            </span>
            <span className="text-3xl font-black">{vuelta}</span>
          </div>
        </div>
      </div>

      {/* Days and Matches */}
      {days.map((day) => (
        <div key={day.id} className="mb-8 last:mb-0 break-inside-avoid">
          <div className="bg-gray-100 border-l-4 border-blue-800 px-4 py-2 mb-2 flex justify-between items-center">
            <span className="font-black text-sm uppercase tracking-wider">
              {new Date(day.date + "T12:00:00").toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="text-[10px] font-black text-gray-500 tracking-widest">
              # PROGRAMACIÓN DIARIA
            </span>
          </div>

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50 [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:text-[10px] [&_th]:font-black [&_th]:uppercase [&_th]:tracking-widest [&_th]:text-gray-600">
                <th className="w-20">Hora</th>
                <th>Equipo 1</th>
                <th className="w-8"></th>
                <th>Equipo 2</th>
                <th className="w-32">Categoría</th>
                <th className="w-32">Cancha</th>
                <th className="w-40">Vocal</th>
              </tr>
            </thead>
            <tbody>
              {day.matches.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-gray-400 italic text-sm border border-gray-300"
                  >
                    No hay partidos programados.
                  </td>
                </tr>
              ) : (
                day.matches.map((m: any, mIdx: number) => {
                  const localTeam = teams.find(
                    (t) => Number(t.id) === Number(m.localTeamId),
                  );
                  const awayTeam = teams.find(
                    (t) => Number(t.id) === Number(m.awayTeamId),
                  );
                  const vocal = vocals.find(
                    (v) => Number(v.id) === Number(m.vocalUserId),
                  );
                  const field = fields.find(
                    (f) => Number(f.field_id) === Number(m.fieldId),
                  );

                  return (
                    <tr
                      key={mIdx}
                      className="border border-gray-300 [&_td]:p-3 [&_td]:text-sm"
                    >
                      <td className="text-center font-bold border border-gray-300">
                        {m.time}
                      </td>
                      <td className="font-bold border border-gray-300">
                        {localTeam?.name || "TBD"}
                      </td>
                      <td className="text-center text-[10px] font-black text-gray-400 border border-gray-300">
                        VS
                      </td>
                      <td className="font-bold border border-gray-300">
                        {awayTeam?.name || "TBD"}
                      </td>
                      <td className="text-center font-medium border border-gray-300">
                        {m.category}
                      </td>
                      <td className="text-center font-bold text-xs border border-gray-300">
                        {field?.name || "TBD"}
                      </td>
                      <td className="font-bold uppercase text-xs border border-gray-300">
                        {vocal?.name || "SIN ASIGNAR"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ))}

      {/* Vocals Summary */}
      <div className="mt-12 flex justify-end break-inside-avoid">
        <div className="w-64 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-blue-50 border-b border-gray-300">
                <th className="p-2 text-left font-black text-blue-900 tracking-tighter w-1/4">
                  VOCALES
                </th>
                <th className="p-2 text-center text-red-600 font-bold border-l border-gray-300">
                  #
                </th>
                <th className="p-2 text-left font-black tracking-tighter border-l border-gray-300">
                  NOMBRE
                </th>
              </tr>
            </thead>
            <tbody>
              {assignedVocalsSummary.map((v, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-0 border-gray-200"
                >
                  <td className="p-2 bg-blue-50/50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-800" />
                  </td>
                  <td className="p-2 text-center font-bold text-red-600 border-l border-gray-300">
                    {v.count}
                  </td>
                  <td className="p-2 font-black uppercase text-[10px] border-l border-gray-300 truncate">
                    {v.userName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 font-medium">
        Documento generado automáticamente por el sistema Vocalia -{" "}
        {new Date().toLocaleString("es-ES", { hour12: false })}
      </div>
    </div>
  );
};
