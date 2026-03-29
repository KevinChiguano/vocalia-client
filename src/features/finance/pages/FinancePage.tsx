import React, { useEffect, useState, useRef } from "react";
import { financeApi } from "../api/finance.api";
import {
  FinancialsResponse,
  FinancialTransaction,
} from "../types/finance.types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { RefreshCcw, FileSpreadsheet, FileText } from "lucide-react";
import { PaginationFooter } from "@/components/ui/PaginationFooter";
import { useUIStore } from "@/store/ui.store";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

import { FinanceSummaryCards } from "../components/FinanceSummaryCards";
import { FinanceFilters } from "../components/FinanceFilters";
import { FinanceTransactionsTable } from "../components/FinanceTransactionsTable";
import { FinancePrintTemplate } from "../components/FinancePrintTemplate";
import logoDefault from "@/assets/logo_san_fernando.png";
import { tournamentApi } from "@/features/administration/api/tournament.api";

const FinancePage: React.FC = () => {
  const { setNotification } = useUIStore();
  const [data, setData] = useState<FinancialsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [tournamentId, setTournamentId] = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | false>(
    false,
  );
  const [exportData, setExportData] = useState<FinancialsResponse | null>(null);
  const [exportTitle, setExportTitle] = useState("");
  const [exportLogoBase64, setExportLogoBase64] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await financeApi.getFinancials({
        page,
        limit,
        search,
        startDate,
        endDate,
        tournamentId,
        categoryId,
      });
      setData(result);
    } catch (err) {
      setError("Error cargando la información financiera.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search, startDate, endDate, tournamentId, categoryId]);

  const handleApplyFilters = (filters: {
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    setSearch(filters.search || "");
    setStartDate(filters.startDate);
    setEndDate(filters.endDate);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getReportTitle = async () => {
    let title = "REPORTE HISTÓRICO GLOBAL";
    if (tournamentId) {
      try {
        const t = await tournamentApi.getTournament(tournamentId);
        title = `REPORTE DE TORNEO: ${t.name.toUpperCase()}`;
      } catch (e) {
        title = "REPORTE DE TORNEO";
      }
    }
    return title;
  };

  const fetchExportData = async () => {
    try {
      const fullData = await financeApi.getFinancialsExport({
        tournamentId,
        categoryId,
        startDate,
        endDate,
        search,
      });
      return fullData;
    } catch (err) {
      console.error(err);
      setNotification(
        "Error",
        "No se pudo obtener la información para exportar.",
        "error",
      );
      return null;
    }
  };

  const handleExportExcel = async () => {
    setIsExporting("excel");
    const fullData = await fetchExportData();
    if (!fullData) {
      setIsExporting(false);
      return;
    }

    try {
      const title = await getReportTitle();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Finanzas", {
        views: [{ showGridLines: false }],
      });

      let logoBase64 = "";
      try {
        const response = await fetch(logoDefault);
        const blob = await response.blob();
        logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn("Could not load logo for Excel", err);
      }

      if (logoBase64) {
        const imageId = workbook.addImage({
          base64: logoBase64,
          extension: "png",
        });
        worksheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          ext: { width: 80, height: 80 },
        });
      }

      worksheet.mergeCells("B1:H1");
      const title1 = worksheet.getCell("B1");
      title1.value = "LIGA INDEPENDIENTE, SOCIAL Y CULTURAL";
      title1.font = { name: "Arial", bold: true, size: 16 };
      title1.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.mergeCells("B2:H2");
      const title2 = worksheet.getCell("B2");
      title2.value = '" SAN FERNANDO DE GUAMANI "';
      title2.font = {
        name: "Arial",
        italic: true,
        bold: true,
        size: 14,
        color: { argb: "FF333333" },
      };
      title2.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.mergeCells("B3:H3");
      const title3 = worksheet.getCell("B3");
      title3.value = title;
      title3.font = {
        name: "Arial",
        bold: true,
        size: 12,
        color: { argb: "FFCC0000" },
      };
      title3.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.getRow(1).height = 25;
      worksheet.getRow(2).height = 20;
      worksheet.getRow(3).height = 18;
      worksheet.getRow(4).height = 15;

      const summaryRowIndex = 5;
      worksheet.getRow(summaryRowIndex).values = [
        "Resumen:",
        `Ingresos: ${formatMoney(fullData.summary.totalRevenue)}`,
        // `Pendiente: ${formatMoney(fullData.summary.outstandingDebtsAmount)}`,
        `Transacciones: ${fullData.transactions.length}`,
        `Partidos Pendientes: ${fullData.summary.pendingPayments}`,
      ];
      worksheet.getRow(summaryRowIndex).font = { bold: true };
      worksheet.getRow(summaryRowIndex + 1).height = 15;

      const headerRowIndex = 7;
      worksheet.getRow(headerRowIndex).values = [
        "ID Partido",
        "Categoría",
        "Local",
        "Visita",
        "Fecha",
        "Pago L.",
        "Pago V.",
        "Total",
        "Estado",
      ];

      const headerRow = worksheet.getRow(headerRowIndex);
      headerRow.height = 20;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF003366" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      let currentRowIndex = 8;
      fullData.transactions.forEach((tx: FinancialTransaction) => {
        worksheet.getRow(currentRowIndex).values = [
          tx.matchId,
          tx.category,
          tx.teams.local,
          tx.teams.away,
          formatDate(tx.date),
          tx.paymentTeamA,
          tx.paymentTeamB,
          tx.totalMatchRevenue,
          tx.status === "paid"
            ? "Pagado"
            : tx.status === "partial"
              ? "Parcial"
              : "Pendiente",
        ];

        const row = worksheet.getRow(currentRowIndex);
        row.eachCell((cell, colNumber) => {
          cell.alignment = {
            horizontal: colNumber >= 6 && colNumber <= 8 ? "right" : "center",
            vertical: "middle",
            wrapText: true,
          };
          cell.border = {
            top: { style: "thin", color: { argb: "FFCCCCCC" } },
            left: { style: "thin", color: { argb: "FFCCCCCC" } },
            bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
            right: { style: "thin", color: { argb: "FFCCCCCC" } },
          };
          if (colNumber === 8)
            cell.font = { bold: true, color: { argb: "FF006600" } };
        });
        currentRowIndex++;
      });

      worksheet.columns = [
        { width: 12 },
        { width: 15 },
        { width: 25 },
        { width: 25 },
        { width: 15 },
        { width: 12 },
        { width: 12 },
        { width: 15 },
        { width: 12 },
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `finanzas_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (error) {
      console.error("Error exporting Excel", error);
      setNotification("Error", "Ocurrió un error al generar el Excel", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting("pdf");
    const fullData = await fetchExportData();
    if (!fullData) {
      setIsExporting(false);
      return;
    }

    try {
      const response = await fetch(logoDefault);
      const blob = await response.blob();
      const logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      setExportLogoBase64(logoBase64);
    } catch (err) {
      console.warn("Could not load logo for PDF", err);
    }

    const title = await getReportTitle();
    setExportTitle(title);
    setExportData(fullData);

    setTimeout(async () => {
      if (!printRef.current) {
        setIsExporting(false);
        return;
      }

      try {
        const imgData = await toPng(printRef.current, {
          cacheBust: true,
          quality: 1,
          backgroundColor: "#ffffff",
          pixelRatio: 2,
          fontEmbedCSS: "",
        });

        if (!imgData || imgData === "data:,") {
          throw new Error("Invalid image data returned from html-to-image");
        }

        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(
          imgData,
          "PNG",
          0,
          0,
          pdfWidth,
          pdfHeight,
          undefined,
          "FAST",
        );
        pdf.save(`finanzas_${new Date().toISOString().split("T")[0]}.pdf`);
      } catch (error) {
        console.error("Error exporting PDF:", error);
        setNotification("Error", "Error al exportar a PDF.", "error");
      } finally {
        setIsExporting(false);
        setExportData(null);
      }
    }, 800); // Increased wait time to ensure React renders the DOM and images
  };

  if (loading && !data)
    return (
      <div className="p-8">
        <p className="text-text-muted">Cargando...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-8">
        <p className="text-danger">{error}</p>
      </div>
    );

  const { summary, transactions, pagination } = data || {
    summary: {
      totalRevenue: 0,
      pendingPayments: 0,
      collectedToday: 0,
      outstandingDebtsAmount: 0,
    },
    transactions: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title={
          <>
            Resumen <span className="text-primary">Financiero</span>
          </>
        }
        description="Gestión de ingresos y cobro de vocalías."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={fetchData} className="gap-2">
              <RefreshCcw className="w-5 h-5" />
              Actualizar
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={handleExportExcel}
              disabled={isExporting !== false}
            >
              <FileSpreadsheet
                className={`w-5 h-5 ${isExporting === "excel" ? "animate-pulse" : "text-green-600"}`}
              />
              {isExporting === "excel" ? "Excel..." : "Excel"}
            </Button>
            <Button
              variant="primary"
              className="shadow-md gap-2"
              onClick={handleExportPDF}
              disabled={isExporting !== false}
            >
              <FileText
                className={`w-5 h-5 ${isExporting === "pdf" ? "animate-pulse" : ""}`}
              />
              {isExporting === "pdf" ? "PDF..." : "PDF"}
            </Button>
          </div>
        }
      />

      <FinanceFilters
        searchValue={search}
        startDateValue={startDate}
        endDateValue={endDate}
        onApplyFilters={handleApplyFilters}
        tournamentId={tournamentId}
        onTournamentChange={(val) => {
          setTournamentId(val);
          setPage(1);
        }}
        categoryId={categoryId}
        onCategoryChange={(val) => {
          setCategoryId(val);
          setPage(1);
        }}
      />

      {/* Summary Cards */}
      <FinanceSummaryCards
        summary={summary}
        totalTransactions={pagination?.total || 0}
        formatMoney={formatMoney}
      />

      {/* Financial Table Container */}
      <FinanceTransactionsTable
        transactions={transactions}
        formatMoney={formatMoney}
        formatDate={formatDate}
      />

      {pagination && pagination.total > 0 && (
        <PaginationFooter
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={handlePageChange}
          totalCount={pagination.total}
          currentCount={transactions.length}
          itemName="transacciones financieras"
        />
      )}

      {/* Hidden Print Template */}
      <FinancePrintTemplate
        ref={printRef}
        data={exportData}
        reportTitle={exportTitle}
        reportDateRange={categoryId ? `Categoría: ${categoryId}` : ""}
        logoBase64={exportLogoBase64}
        formatMoney={formatMoney}
        formatDate={formatDate}
      />

      {/* Export Loading Overlay */}
      {isExporting !== false && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-overlay/60 backdrop-blur-sm">
          <div className="bg-surface p-8 rounded-2xl shadow-2xl border border-border flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-lg">
              {isExporting === "excel"
                ? "Generando Excel..."
                : "Generando PDF..."}
            </p>
            <p className="text-sm text-text-muted">
              Por favor espera un momento
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
