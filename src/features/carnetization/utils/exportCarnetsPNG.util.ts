import { toBlob } from "html-to-image";

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const exportCarnetToPNG = async (
  playerDni: string,
  playerName: string
) => {
  const front = document.getElementById(`carnet-frente-${playerDni}`);
  const back = document.getElementById(`carnet-reverso-${playerDni}`);

  if (!front || !back) return false;

  const WIDTH = 450;
  const HEIGHT = 284;
  const PIXEL_RATIO = 4; // calidad impresión

  const options = {
    cacheBust: true,
    pixelRatio: PIXEL_RATIO,
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "transparent",
    style: {
      width: `${WIDTH}px`,
      height: `${HEIGHT}px`,
      transform: "scale(1)",
      margin: "0",
      padding: "0",
    },
  };

  try {
    const frontBlob = await toBlob(front, options);
    const backBlob = await toBlob(back, options);

    if (!frontBlob || !backBlob) {
      throw new Error("Failed to generate carnet images");
    }

    downloadBlob(frontBlob, `carnet-${playerDni}-${playerName}-frente.png`);

    await new Promise((r) => setTimeout(r, 600));

    downloadBlob(backBlob, `carnet-${playerDni}-${playerName}-reverso.png`);

    return true;
  } catch (err) {
    console.error("Carnet export error:", err);
    return false;
  }
};
