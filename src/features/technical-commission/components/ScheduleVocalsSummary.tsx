interface Props {
  assignedVocals: {
    userId: number;
    count: number;
    userName: string;
  }[];
}

export const ScheduleVocalsSummary = ({ assignedVocals }: Props) => {
  return (
    <div className="bg-elevated/30 p-4 md:p-6 border-t border-border">
      <div className="w-full max-w-md sm:ml-auto center-on-mobile">
        <div className="overflow-hidden rounded-xl border border-border shadow-soft bg-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary/5">
                <th className="p-3 text-primary font-black uppercase text-[10px] tracking-widest text-left border-b border-border w-1/4">
                  VOCALES
                </th>
                <th className="p-3 text-danger font-bold text-center border-b border-border w-12">
                  #
                </th>
                <th className="p-3 text-text font-black uppercase text-[10px] tracking-widest text-left border-b border-border">
                  NOMBRE
                </th>
              </tr>
            </thead>
            <tbody>
              {assignedVocals.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-8 text-center text-text-muted italic text-sm"
                  >
                    No hay vocales asignados.
                  </td>
                </tr>
              ) : (
                assignedVocals.map((v, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border last:border-0 hover:bg-hover transition-colors"
                  >
                    <td className="p-3 bg-primary/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto" />
                    </td>
                    <td className="p-3 text-center font-bold text-danger">
                      {v.count}
                    </td>
                    <td className="p-3 font-bold text-text uppercase text-xs">
                      {v.userName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
