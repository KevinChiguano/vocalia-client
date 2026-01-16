/**
 * Formatea una fecha para mostrarla en la UI
 * Convierte una fecha ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ) a formato local
 * sin problemas de timezone
 *
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD o con timestamp)
 * @param locale - Locale para el formato (default: 'es-ES')
 * @param options - Opciones de formato de Intl.DateTimeFormat
 * @returns Fecha formateada como string
 */
export const formatDateForDisplay = (
  dateString: string | null | undefined,
  locale: string = "es-ES",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string => {
  if (!dateString) return "???";

  // Extraer solo la parte de la fecha (YYYY-MM-DD) sin el timestamp
  const dateOnly = dateString.split("T")[0];

  // Crear fecha usando los componentes individuales para evitar problemas de timezone
  const [year, month, day] = dateOnly.split("-").map(Number);

  // Los meses en JavaScript son 0-indexed, por eso restamos 1
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(locale, options);
};

/**
 * Formatea un timestamp (con hora) para mostrarla en la UI
 * Maneja tanto formato ISO como el formato personalizado del backend (d/m/yyyy, hh:mm:ss)
 *
 * @param timestamp - Timestamp en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ) o formato "d/m/yyyy, hh:mm:ss"
 * @param locale - Locale para el formato (default: 'es-ES')
 * @param options - Opciones de formato de Intl.DateTimeFormat
 * @returns Fecha formateada como string
 */
export const formatTimestampForDisplay = (
  timestamp: string | null | undefined,
  locale: string = "es-ES",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string => {
  if (!timestamp) return "???";

  let date: Date;

  // Detectar si es el formato personalizado del backend: "d/m/yyyy, hh:mm:ss"
  if (timestamp.includes("/") && timestamp.includes(",")) {
    // Formato: "9/1/2026, 21:58:43"
    const [datePart, timePart] = timestamp.split(", ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    // Crear fecha usando los componentes (mes es 0-indexed)
    date = new Date(year, month - 1, day, hours, minutes, seconds);
  } else {
    // Formato ISO estándar
    date = new Date(timestamp);
  }

  return date.toLocaleDateString(locale, options);
};

/**
 * Convierte una fecha ISO (YYYY-MM-DD o con timestamp) al formato YYYY-MM-DD
 * para usar en inputs de tipo date
 *
 * @param dateString - Fecha en formato ISO
 * @returns Fecha en formato YYYY-MM-DD o string vacío si no hay fecha
 */
export const formatDateForInput = (
  dateString: string | null | undefined
): string => {
  if (!dateString) return "";

  // Extraer solo la parte de la fecha (YYYY-MM-DD)
  return dateString.split("T")[0];
};

/**
 * Valida que una fecha de fin sea posterior o igual a una fecha de inicio
 *
 * @param startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param endDate - Fecha de fin en formato YYYY-MM-DD
 * @returns true si endDate >= startDate, false en caso contrario
 */
export const isEndDateValid = (
  startDate: string | null | undefined,
  endDate: string | null | undefined
): boolean => {
  if (!startDate || !endDate) return true;

  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);

  return end >= start;
};
