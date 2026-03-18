import { toCanvas } from "html-to-image";
import jsPDF from "jspdf";

export const exportCarnetsToPDF = async ({
  players,
  teamName,
  categoryName,
}: {
  players: { dni: string }[];
  teamName: string;
  categoryName: string;
}) => {
  const pdf = new jsPDF("portrait", "mm", "a4");

  const CARD_W = 54;
  const CARD_H = 85.6;
  const GAP_X = 10;
  let MARGIN_TOP = 45; // Incremented from 25 to make room for the graphical header
  const SET_HEIGHT = CARD_H + 10;

  // Centrar horizontalmente un set de dos carnets (54*2 + gap) = 118mm
  // (210 - 118) / 2 = 46mm
  const startX = (210 - (CARD_W * 2 + GAP_X)) / 2;
  let y = MARGIN_TOP;
  let cardsOnPage = 0;

  // Render Graphical Header
  let headerImgBase64: string | null = null;
  let headerPdfHeight = 0;

  const headerNode = document.getElementById("carnet-export-header");
  if (headerNode) {
    try {
      const headerCanvas = await toCanvas(headerNode, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
        fontEmbedCSS: "",
      });
      headerImgBase64 = headerCanvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      headerPdfHeight = (headerCanvas.height * pdfWidth) / headerCanvas.width;
      MARGIN_TOP = headerPdfHeight + 10; // Dynamically set margin based on header size
      y = MARGIN_TOP;
    } catch (err) {
      console.warn("Failed to generate header image", err);
    }
  }

  const drawHeaderImage = () => {
    if (headerImgBase64) {
      pdf.addImage(
        headerImgBase64,
        "PNG",
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        headerPdfHeight,
        undefined,
        "FAST",
      );
    } else {
      // Fallback if header rendering failed
      pdf.setFontSize(14);
      pdf.text("Carnets de Jugadores", 105, 12, { align: "center" });
      pdf.setFontSize(10);
      pdf.text(`Equipo: ${teamName}`, 20, 18);
      pdf.text(`Categoría: ${categoryName}`, 140, 18);
    }
  };

  drawHeaderImage();

  for (let i = 0; i < players.length; i++) {
    const { dni } = players[i];

    const front = document.getElementById(`print-carnet-frente-${dni}`);
    const back = document.getElementById(`print-carnet-reverso-${dni}`);
    if (!front || !back) continue;

    try {
      const options = {
        pixelRatio: 3,
        cacheBust: true, // Prevents html-to-image from caching the wrong cross-origin images during bulk ops
        imagePlaceholder:
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        fontEmbedCSS: "",
      };

      const frontCanvas = await toCanvas(front, options);
      const backCanvas = await toCanvas(back, options);

      const frontImgBase64 = frontCanvas.toDataURL("image/png");
      const backImgBase64 = backCanvas.toDataURL("image/png");

      // Dibujar fila
      pdf.addImage(frontImgBase64, "PNG", startX, y, CARD_W, CARD_H);
      pdf.addImage(
        backImgBase64,
        "PNG",
        startX + CARD_W + GAP_X,
        y,
        CARD_W,
        CARD_H,
      );

      cardsOnPage++;
      y += SET_HEIGHT;

      // Salto de página dinámico basado en el espacio disponible en A4 (297mm alto)
      if (y + SET_HEIGHT + GAP_X > 297 && i < players.length - 1) {
        pdf.addPage();
        y = 15; // Set a much smaller margin for subsequent pages without a header
        // drawHeaderImage(); // Removed to ensure header only prints on the first page
      }
    } catch (error) {
      console.warn(`Error generating images for DNI: ${dni}`, error);
      continue;
    }
  }

  pdf.save(`carnets-${teamName.replace(/\s/g, "_")}-${categoryName}.pdf`);
};
