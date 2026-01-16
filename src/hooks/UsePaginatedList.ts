import { useEffect, useState } from "react";

interface Params<TFilters> {
  fetcher: (params: any) => Promise<{
    items: any[];
    pagination: {
      page: number;
      totalPages: number;
      total: number;
      limit: number;
    };
  }>;
  initialLimit?: number;
  initialFilters?: TFilters;
}

export function usePaginatedList<T, TFilters = {}>({
  fetcher,
  initialLimit = 10,
  initialFilters = {} as TFilters,
}: Params<TFilters>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  // 🟡 filtros aplicados
  const [filters, setFilters] = useState<TFilters>(initialFilters);

  // 🟢 filtros del formulario
  const [draftFilters, setDraftFilters] = useState<TFilters>(initialFilters);

  const [pagination, setPagination] = useState<any>(null);

  const load = async () => {
    setLoading(true);

    const res = await fetcher({
      page,
      limit,
      ...filters,
    });

    setData(res.items);
    setPagination(res.pagination);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [page, limit, filters]);

  useEffect(() => {
    setPage(1);
  }, [limit, filters]);

  // 🔍 aplicar búsqueda manual
  const applyFilters = () => {
    setPage(1);
    setFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
    setPage(1);
  };

  return {
    data,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    filters,
    draftFilters,
    setDraftFilters,
    applyFilters,
    resetFilters,
    pagination,
    reload: load,
  };
}
