import { BaseTable } from "@/components/ui/Table";
import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { FinancialTransaction } from "../types/finance.types";

interface Props {
  transactions: FinancialTransaction[];
  formatMoney: (amount: number) => string;
  formatDate: (dateString?: string) => string;
}

export const FinanceTransactionsTable = ({
  transactions,
  formatMoney,
  formatDate,
}: Props) => {
  const columns = [
    { key: "matchId", label: "Partido ID", sortable: true },
    { key: "teams", label: "Equipos", sortable: false },
    { key: "category", label: "Categoría", sortable: true },
    { key: "date", label: "Fecha", sortable: true },
    { key: "paymentLocal", label: "Pago Local", sortable: true },
    { key: "paymentAway", label: "Pago Visita", sortable: true },
    { key: "total", label: "Total Partido", sortable: true },
    { key: "status", label: "Estado", sortable: true },
  ];

  return (
    <>
      <h3 className="font-bold text-lg text-text mb-4">
        Detalles de Transacciones por Partido
      </h3>

      <BaseTable
        columns={columns}
        data={transactions}
        renderRow={(tx: FinancialTransaction) => [
          <span className="font-bold text-primary">{tx.matchId}</span>,
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text">
              {tx.teams.local}
            </span>
            <span className="text-xs text-text-subtle font-bold">vs</span>
            <span className="text-sm font-bold text-text">{tx.teams.away}</span>
          </div>,
          <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-elevated text-text">
            {tx.category}
          </span>,
          <span className="text-sm text-text-muted font-medium">
            {formatDate(tx.date)}
          </span>,
          <span className="text-sm font-bold text-text">
            {formatMoney(tx.paymentTeamA)}
          </span>,
          <span className="text-sm font-bold text-text">
            {formatMoney(tx.paymentTeamB)}
          </span>,
          <span className="text-sm font-black text-text">
            {formatMoney(tx.totalMatchRevenue)}
          </span>,
          tx.status === "paid" ? (
            <div className="flex items-center gap-1.5 text-success">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Pagado</span>
            </div>
          ) : tx.status === "partial" ? (
            <div className="flex items-center gap-1.5 text-warning">
              <AlertCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Parcial</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-text-subtle">
              <HelpCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Pendiente</span>
            </div>
          ),
        ]}
        renderMobileRow={(tx: FinancialTransaction) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text">
                  {tx.teams.local}
                </span>
                <span className="text-xs text-text-subtle font-bold">vs</span>
                <span className="text-sm font-bold text-text">
                  {tx.teams.away}
                </span>
              </div>
              <span className="font-bold text-primary text-sm">
                #{tx.matchId}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-elevated text-text">
                {tx.category}
              </span>
              <span className="text-xs text-text-muted font-medium">
                {formatDate(tx.date)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
              <div>
                <p className="text-xs text-text-muted">Local</p>
                <p className="text-sm font-bold text-text">
                  {formatMoney(tx.paymentTeamA)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Visita</p>
                <p className="text-sm font-bold text-text">
                  {formatMoney(tx.paymentTeamB)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div>
                <p className="text-xs text-text-muted">Total</p>
                <p className="text-sm font-black text-text">
                  {formatMoney(tx.totalMatchRevenue)}
                </p>
              </div>
              <div>
                {tx.status === "paid" && (
                  <div className="flex items-center gap-1.5 text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Pagado</span>
                  </div>
                )}
                {tx.status === "partial" && (
                  <div className="flex items-center gap-1.5 text-warning">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Parcial</span>
                  </div>
                )}
                {tx.status === "pending" && (
                  <div className="flex items-center gap-1.5 text-text-subtle">
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">
                      Pendiente
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      />
    </>
  );
};
