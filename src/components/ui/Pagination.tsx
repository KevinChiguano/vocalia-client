interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onChange }: PaginationProps) => {
  // if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1 text-sm rounded-md border border-border
                   bg-surface text-text
                   hover:bg-elevated
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        Anterior
      </button>

      <span className="text-sm text-text-muted">
        Página {page} de {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1 text-sm rounded-md border border-border
                   bg-surface text-text
                   hover:bg-elevated
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        Siguiente
      </button>
    </div>
  );
};
