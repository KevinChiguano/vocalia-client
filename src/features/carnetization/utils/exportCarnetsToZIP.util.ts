import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toBlob } from "html-to-image";

export const exportCarnetsToZIP = async ({
  players,
  zipName,
}: {
  players: { dni: string; name: string }[];
  zipName: string;
}) => {
  const zip = new JSZip();
  const folder = zip.folder("carnets");

  if (!folder) return;

  const options = {
    pixelRatio: 4,
    cacheBust: true,
    fontEmbedCSS: "",
    imagePlaceholder:
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  };

  for (const player of players) {
    const front = document.getElementById(`print-carnet-frente-${player.dni}`);
    const back = document.getElementById(`print-carnet-reverso-${player.dni}`);

    if (!front || !back) continue;

    const frontBlob = await toBlob(front, options);
    const backBlob = await toBlob(back, options);

    if (!frontBlob || !backBlob) continue;

    folder.file(`carnet-${player.dni}-${player.name}-frente.png`, frontBlob);
    folder.file(`carnet-${player.dni}-${player.name}-reverso.png`, backBlob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  saveAs(zipBlob, `${zipName}.zip`);
};
