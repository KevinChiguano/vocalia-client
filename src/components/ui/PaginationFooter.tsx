import { Pagination } from "./Pagination";

interface PaginationFooterProps {
  currentCount: number;
  totalCount: number;
  itemName: string;
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string; // Additional classes for the container
}

export const PaginationFooter = ({
  currentCount,
  totalCount,
  itemName,
  page,
  totalPages,
  onChange,
  className = "mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 pt-6",
}: PaginationFooterProps) => {
  return (
    <div className={className}>
      <p className="text-sm text-text-muted">
        Mostrando <span className="font-bold text-primary">{currentCount}</span>{" "}
        de
        <span className="font-bold ml-1">{totalCount}</span> {itemName}
      </p>
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={onChange} />
      )}
    </div>
  );
};
