/**
 * Transforma una URL de Google Drive en un enlace directo de visualización de contenido.
 * Esto evita el bloqueo de OpaqueResponseBlocking y permite usar la URL en etiquetas <img>.
 * 
 * @param url URL original de Google Drive
 * @returns URL transformada a enlace directo o la URL original si no es de Drive
 */
export const getDirectImageUrl = (url: string | undefined): string => {
  if (!url) return "";

  // Formatos comunes de Google Drive:
  // - https://drive.google.com/file/d/[ID]/view?usp=sharing
  // - https://drive.google.com/open?id=[ID]
  // - https://docs.google.com/file/d/[ID]/edit
  // - https://drive.google.com/uc?id=[ID]
  
  // Expresión regular para extraer el ID del archivo (normalmente 25-33 caracteres alfanuméricos)
  const driveIdMatch = url.match(/\/(?:file\/d\/|open\?id=|uc\?id=|d\/)([a-zA-Z0-9_-]{25,})[\/]?(?:view|edit|download)?/);

  if (driveIdMatch && driveIdMatch[1]) {
    const fileId = driveIdMatch[1];
    /**
     * Usamos el endpoint de thumbnail de Google Drive.
     * A diferencia de /uc o lh3, este endpoint es mucho más permisivo con las políticas CORS 
     * y las protecciones de OpaqueResponseBlocking (ORB) de los navegadores modernos.
     */
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  return url;
};
