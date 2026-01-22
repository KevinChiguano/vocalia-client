import { Button } from "./Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onChange }: PaginationProps) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="secondary"
        size="sm"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-3"
      >
        Anterior
      </Button>

      <div className="px-4 py-1 bg-surface border border-border rounded-lg text-sm text-text-muted font-medium">
        Página <span className="text-text">{page}</span> de{" "}
        <span className="text-text">{totalPages}</span>
      </div>

      <Button
        variant="secondary"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3"
      >
        Siguiente
      </Button>
    </div>
  );
};
