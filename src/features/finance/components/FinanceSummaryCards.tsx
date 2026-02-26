import { FinancialSummary } from "../types/finance.types";
import { Card } from "@/components/ui/Card";
import { TrendingUp, Clock, Banknote, BarChart4 } from "lucide-react";

interface Props {
  summary: FinancialSummary;
  totalTransactions: number;
  formatMoney: (amount: number) => string;
}

export const FinanceSummaryCards = ({
  summary,
  totalTransactions,
  formatMoney,
}: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-text-muted font-semibold text-sm">
            Ingresos Totales
          </span>
          <div className="bg-success-soft text-success p-2 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-black text-text">
          {formatMoney(summary.totalRevenue)}
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-text-muted font-semibold text-sm">
            Partidos Pendientes por cobrar
          </span>
          <div className="bg-warning-soft text-warning p-2 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-black text-text">
          {summary.pendingPayments} partidos
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-text-muted font-semibold text-sm">
            Recaudado Hoy
          </span>
          <div className="bg-primary-soft text-primary p-2 rounded-lg">
            <Banknote className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-black text-text">
          {formatMoney(summary.collectedToday)}
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-text-muted font-semibold text-sm">
            Estado General
          </span>
          <div className="bg-info-soft text-info p-2 rounded-lg">
            <BarChart4 className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-black text-text">{totalTransactions}</p>
        <p className="text-xs text-text-subtle font-bold mt-2">
          partidos auditados
        </p>
      </Card>
    </div>
  );
};
