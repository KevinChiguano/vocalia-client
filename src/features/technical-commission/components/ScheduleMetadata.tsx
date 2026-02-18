import { Category } from "@/features/qualifications/types/category.types";

interface Props {
  categories: Category[];
  selectedCategoryIds: number[];
  onChangeCategories: (ids: number[]) => void;
  fecha: number;
  onChangeFecha: (val: number) => void;
  vuelta: number;
  onChangeVuelta: (val: number) => void;
}

export const ScheduleMetadata = ({
  categories,
  selectedCategoryIds,
  onChangeCategories,
  fecha,
  onChangeFecha,
  vuelta,
  onChangeVuelta,
}: Props) => {
  const toggleCategory = (id: number) => {
    const numericId = Number(id);
    if (selectedCategoryIds.includes(numericId)) {
      onChangeCategories(
        selectedCategoryIds.filter((cid) => cid !== numericId),
      );
    } else {
      onChangeCategories([...selectedCategoryIds, numericId]);
    }
  };

  return (
    <div className="bg-bg border-y border-border p-4">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Categories Selection - Hidden in PDF */}
        <div className="space-y-3 flex-1 w-full no-print">
          <label className="ui-label flex flex-wrap items-center gap-2 font-bold uppercase tracking-tight">
            Filtrar Categorías:
            <span className="text-[10px] lowercase font-normal text-text-subtle">
              (selecciona las que aparecerán en la hoja)
            </span>
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => onChangeCategories([])}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                selectedCategoryIds.length === 0
                  ? "bg-primary text-white border-primary shadow-soft scale-105"
                  : "bg-surface text-text-muted border-border hover:border-primary/50"
              }`}
            >
              Todos
            </button>
            <div className="w-px h-4 bg-border mx-1"></div>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(Number(cat.id))}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  selectedCategoryIds.includes(Number(cat.id))
                    ? "bg-tournament text-surface border-tournament shadow-soft scale-105"
                    : "bg-surface text-text-muted border-border hover:border-tournament/50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Global Metadata - Always visible in PDF */}
        <div className="flex gap-8 justify-center md:justify-end w-full md:w-auto ml-auto">
          <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border shadow-soft">
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                FECHA
              </span>
              <div className="relative group">
                <input
                  type="number"
                  className="w-12 text-center font-black text-xl md:text-2xl text-text bg-transparent border-none outline-none focus:ring-0 no-print"
                  value={fecha}
                  onChange={(e) => onChangeFecha(parseInt(e.target.value) || 0)}
                />
                <span className="hidden print-only absolute inset-0 text-center font-black text-xl md:text-2xl text-text bg-surface pointer-events-none items-center justify-center">
                  {fecha}
                </span>
              </div>
            </div>

            <div className="w-px h-8 bg-border"></div>

            <div className="flex flex-col gap-1 items-center">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                VUELTA
              </span>
              <div className="relative group">
                <input
                  type="number"
                  className="w-12 text-center font-black text-xl md:text-2xl text-text bg-transparent border-none outline-none focus:ring-0 no-print"
                  value={vuelta}
                  onChange={(e) =>
                    onChangeVuelta(parseInt(e.target.value) || 0)
                  }
                />
                <span className="hidden print-only absolute inset-0 text-center font-black text-xl md:text-2xl text-text bg-surface pointer-events-none items-center justify-center">
                  {vuelta}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
