import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export const exportMatchPDF = async (matchId: number | string) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  let currentY = margin;

  // List of IDs to capture
  const sections = [
    "summary-header",
    "summary-info",
    "summary-financial",
    "summary-goals",
    "summary-sanctions",
    "summary-signatures",
    "summary-observations",
  ];

  for (const id of sections) {
    const element = document.getElementById(id);
    if (!element) continue;

    try {
      // Create image from DOM element
      const imgData = await toPng(element, { quality: 0.95, pixelRatio: 2 });
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

      // Check if we need a new page
      if (currentY + imgHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.addImage(imgData, "PNG", margin, currentY, contentWidth, imgHeight);
      currentY += imgHeight + 5; // Add some spacing between sections
    } catch (error) {
      console.error(`Error capturing section ${id}:`, error);
    }
  }

  pdf.save(`Acta_Partido_${matchId}.pdf`);
};
