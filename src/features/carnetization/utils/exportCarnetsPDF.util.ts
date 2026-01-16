import { toPng } from "html-to-image";
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

  const CARD_W = 85.6;
  const CARD_H = 54;
  const GAP = 6;

  let x = 10;
  let y = 25;

  // 👉 TÍTULO SOLO EN PDF
  pdf.setFontSize(14);
  pdf.text("Carnets de Jugadores", 105, 12, { align: "center" });

  pdf.setFontSize(10);
  pdf.text(`Equipo: ${teamName}`, 10, 18);
  pdf.text(`Categoría: ${categoryName}`, 120, 18);

  for (let i = 0; i < players.length; i++) {
    const { dni } = players[i];

    const front = document.getElementById(`carnet-frente-${dni}`);
    const back = document.getElementById(`carnet-reverso-${dni}`);
    if (!front || !back) continue;

    const frontImg = await toPng(front, { pixelRatio: 3 });
    const backImg = await toPng(back, { pixelRatio: 3 });

    // Frente
    pdf.addImage(frontImg, "PNG", x, y, CARD_W, CARD_H);
    // Reverso
    pdf.addImage(backImg, "PNG", x + CARD_W + GAP, y, CARD_W, CARD_H);

    y += CARD_H + GAP;

    // Salto de página
    if (y + CARD_H > 290) {
      pdf.addPage();
      y = 20;
    }
  }

  pdf.save(`carnets-${teamName.replace(/\s/g, "_")}-${categoryName}.pdf`);
};
