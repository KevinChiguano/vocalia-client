interface Props {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const FiltersBar = ({ left, right }: Props) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between w-full">
      <div className="flex flex-wrap items-end gap-3 flex-1 w-full">{left}</div>

      {right && (
        <div className="flex items-center justify-end shrink-0">{right}</div>
      )}
    </div>
  );
};
