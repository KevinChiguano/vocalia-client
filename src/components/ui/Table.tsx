import clsx from "clsx";
import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface Column<T = any> {
  key: string;
  label: string;
  width?: string;
  mobileLabel?: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | boolean | null;
}

interface BaseTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  renderRow: (item: T, index: number) => React.ReactNode[];
  renderMobileRow?: (item: T) => React.ReactNode;
}

export function BaseTable<T>({
  columns,
  data,
  loading,
  emptyText = "No existen registros",
  renderRow,
  renderMobileRow,
}: BaseTableProps<T>) {
  const [sort, setSort] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const sortedData = useMemo(() => {
    if (!sort) return data;

    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return data;

    return [...data].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);

      if (av == null) return 1;
      if (bv == null) return -1;

      if (av < bv) return sort.direction === "asc" ? -1 : 1;
      if (av > bv) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sort, columns]);

  if (loading) {
    return <div className="text-sm text-text-muted">Cargando...</div>;
  }

  return (
    <>
      {/* ===================== */}
      {/* MOBILE (cards)        */}
      {/* ===================== */}
      {renderMobileRow && (
        <div className="space-y-3 md:hidden">
          {sortedData.length === 0 && (
            <div className="text-center text-text-muted py-6">{emptyText}</div>
          )}

          {sortedData.map((item, index) => (
            <div
              key={index}
              className="
                rounded-xl border border-border bg-surface
                p-4 space-y-2
                hover:bg-elevated
                hover:-translate-y-1
                hover:border-primary/40 
              "
            >
              {renderMobileRow(item)}
            </div>
          ))}
        </div>
      )}

      {/* ===================== */}
      {/* TABLE (md+)           */}
      {/* ===================== */}
      <div className="hidden md:block">
        <div className="rounded-xl border border-border bg-surface overflow-x-auto">
          <table className="ui-table">
            <thead className="ui-table-head">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    aria-sort={
                      !col.sortable
                        ? undefined
                        : sort?.key !== col.key
                          ? "none"
                          : sort.direction === "asc"
                            ? "ascending"
                            : "descending"
                    }
                    onClick={() => {
                      if (!col.sortable) return;

                      setSort((prev) =>
                        prev?.key === col.key
                          ? {
                              key: col.key,
                              direction:
                                prev.direction === "asc" ? "desc" : "asc",
                            }
                          : { key: col.key, direction: "asc" },
                      );
                    }}
                    className={clsx(
                      "ui-table-head-cell",
                      col.sortable &&
                        "cursor-pointer select-none hover:text-white/80",
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>

                      {col.sortable && (
                        <>
                          {sort?.key !== col.key && (
                            <ChevronsUpDown className="w-4 h-4 text-white" />
                          )}

                          {sort?.key === col.key &&
                            sort.direction === "asc" && (
                              <ChevronUp className="w-4 h-4 text-white" />
                            )}

                          {sort?.key === col.key &&
                            sort.direction === "desc" && (
                              <ChevronDown className="w-4 h-4 text-white/70" />
                            )}
                        </>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sortedData.map((item, index) => (
                <tr
                  key={index}
                  className={clsx(
                    "ui-table-row",
                    index % 2 === 1 && "ui-table-row-alt",
                    "ui-table-row-hover",
                  )}
                >
                  {renderRow(item, index).map((cell, i) => (
                    <td
                      key={i}
                      style={{ width: columns[i]?.width }}
                      className="ui-table-cell"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}

              {sortedData.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="ui-table-empty">
                    {emptyText}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export const Table = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-auto">
    <table
      className={clsx("w-full caption-bottom text-sm", className)}
      {...props}
    >
      {children}
    </table>
  </div>
);
Table.displayName = "Table";

export const TableHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={clsx("[&_tr]:border-b", className)} {...props} />
);
TableHeader.displayName = "TableHeader";

export const TableBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={clsx("[&_tr:last-child]:border-0", className)} {...props} />
);
TableBody.displayName = "TableBody";

export const TableFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tfoot
    className={clsx(
      "bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
);
TableFooter.displayName = "TableFooter";

export const TableRow = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={clsx(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className,
    )}
    {...props}
  />
);
TableRow.displayName = "TableRow";

export const TableHead = ({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={clsx(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
);
TableHead.displayName = "TableHead";

export const TableCell = ({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={clsx(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
);
TableCell.displayName = "TableCell";

export const TableCaption = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) => (
  <caption
    className={clsx("mt-4 text-sm text-text-muted", className)}
    {...props}
  />
);
TableCaption.displayName = "TableCaption";
