interface Props {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const FiltersBar = ({ left, right }: Props) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-wrap items-end gap-3">{left}</div>

      {right && <div className="flex items-center justify-end">{right}</div>}
    </div>
  );
};
