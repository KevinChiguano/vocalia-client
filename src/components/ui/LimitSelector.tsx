interface Props {
  value: number;
  options?: number[];
  onChange: (value: number) => void;
}

export const LimitSelector = ({
  value,
  options = [5, 10, 15, 20],
  onChange,
}: Props) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-muted">Mostrar</span>

      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-border bg-surface px-2 py-1 text-sm text-text
                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      >
        {options.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <span className="text-sm text-text-muted">registros</span>
    </div>
  );
};
