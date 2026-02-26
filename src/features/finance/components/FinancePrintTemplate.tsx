import { forwardRef } from "react";
import { FinancialsResponse } from "../types/finance.types";
import logoDefault from "@/assets/logo_san_fernando.png";

interface FinancePrintTemplateProps {
  data: FinancialsResponse | null;
  reportTitle: string;
  reportDateRange: string;
  logoBase64?: string;
  formatMoney: (amount: number) => string;
  formatDate: (dateString?: string) => string;
}

export const FinancePrintTemplate = forwardRef<
  HTMLDivElement,
  FinancePrintTemplateProps
>(
  (
    { data, reportTitle, reportDateRange, logoBase64, formatMoney, formatDate },
    ref,
  ) => {
    if (!data) return null;

    const { transactions, summary } = data;

    return (
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div
          ref={ref}
          className="w-[1240px] bg-white text-black p-12 font-sans overflow-visible"
          style={{ minHeight: "1754px" }} // Approx A4 height at 150ppi
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b-4 border-primary pb-6">
            <div className="flex items-center gap-6">
              <img
                src={logoBase64 || logoDefault}
                alt="Liga San Fernando Logo"
                className="w-24 h-24 object-contain"
              />
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                  LIGA INDEPENDIENTE, SOCIAL Y CULTURAL
                </h1>
                <h2 className="text-xl font-bold text-gray-600 mt-1 italic">
                  " SAN FERNANDO DE GUAMANI "
                </h2>
                <div className="mt-4 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                    {reportTitle}
                  </span>
                  {reportDateRange && (
                    <span className="text-gray-500 text-sm font-medium">
                      {reportDateRange}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">
                Fecha de Emisión
              </p>
              <p className="text-lg font-bold text-gray-900">
                {new Date().toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Global Summary */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">
                Ingresos Totales (Cobrado)
              </p>
              <p className="text-xl font-bold text-green-600">
                {formatMoney(summary.totalRevenue)}
              </p>
            </div>
            {/* <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Pendiente de Cobro</p>
              <p className="text-xl font-bold text-amber-600">
                {formatMoney(summary.outstandingDebtsAmount)}
              </p>
            </div> */}
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Total Movimientos</p>
              <p className="text-xl font-bold text-gray-900">
                {transactions.length}
              </p>
            </div>
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Partidos Pendientes</p>
              <p className="text-xl font-bold text-gray-900">
                {summary.pendingPayments}
              </p>
            </div>
          </div>

          {/* Financial Table */}
          <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase mt-12 pb-2 border-b-2 border-gray-200">
            Detalle de Transacciones
          </h3>

          <table className="w-full text-left border-collapse border border-gray-200">
            <thead>
              <tr className="bg-[#003366] text-white">
                <th className="py-2 px-3 border border-gray-200 text-sm font-bold text-center">
                  ID P.
                </th>
                <th className="py-2 px-3 border border-gray-200 text-sm font-bold">
                  Categoría
                </th>
                <th className="py-2 px-3 border border-gray-200 text-sm font-bold w-1/4">
                  Local
                </th>
                <th className="py-2 px-3 border border-gray-200 text-sm font-bold w-1/4">
                  Visita
                </th>
                <th className="py-2 px-3 border border-gray-200 text-sm font-bold text-center">
                  Fecha
                </th>
                <th className="py-2 px-3 border border-gray-200 text-sm font-bold text-right">
                  Pago L.
                </th>
                <th className="py-2 px-3 border border-gray-200 text-sm font-bold text-right">
                  Pago V.
                </th>
                <th className="py-2 px-3 border border-gray-200 text-sm font-bold text-right text-[#FFCC00]">
                  Total Cobrado
                </th>
                <th className="py-2 px-3 border border-gray-200 text-sm font-bold text-center">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr
                  key={tx.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-2 px-3 border border-gray-200 text-sm text-center">
                    {tx.matchId}
                  </td>
                  <td className="py-2 px-3 border border-gray-200 text-sm">
                    {tx.category}
                  </td>
                  <td className="py-2 px-3 border border-gray-200 text-sm">
                    {tx.teams.local}
                  </td>
                  <td className="py-2 px-3 border border-gray-200 text-sm">
                    {tx.teams.away}
                  </td>
                  <td className="py-2 px-3 border border-gray-200 text-sm text-center">
                    {formatDate(tx.date)}
                  </td>
                  <td className="py-2 px-3 border border-gray-200 text-sm text-right">
                    {formatMoney(tx.paymentTeamA)}
                  </td>
                  <td className="py-2 px-3 border border-gray-200 text-sm text-right">
                    {formatMoney(tx.paymentTeamB)}
                  </td>
                  <td className="py-2 px-3 border border-gray-200 text-sm text-right font-bold text-green-700">
                    {formatMoney(tx.totalMatchRevenue)}
                  </td>
                  <td className="py-2 px-3 border border-gray-200 text-center">
                    {tx.status === "paid" ? (
                      <span className="text-xs font-bold text-green-700 border border-green-200 bg-green-50 px-2 py-1 rounded">
                        Pagado
                      </span>
                    ) : tx.status === "partial" ? (
                      <span className="text-xs font-bold text-amber-700 border border-amber-200 bg-amber-50 px-2 py-1 rounded">
                        Parcial
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-700 border border-red-200 bg-red-50 px-2 py-1 rounded">
                        Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-gray-500 font-medium"
                  >
                    No se encontraron transacciones en este reporte.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between text-sm text-gray-500">
            <span>Emitido por: Sistema de Administración vocalia</span>
            <span>Página 1</span>
          </div>
        </div>
      </div>
    );
  },
);

FinancePrintTemplate.displayName = "FinancePrintTemplate";
