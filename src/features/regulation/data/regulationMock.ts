export interface RegulationArticle {
  id: string;
  articleNumber: string;
  title: string;
  description: string;
  sanction: string;
  badgeVariant:
    | "primary"
    | "warning"
    | "danger"
    | "info"
    | "success"
    | "neutral"
    | "tournament"
    | "outline";
  category: string;
}

export const regulationCategories = [
  "Todos",
  "Inscripciones",
  "Tarjetas & Amonestaciones",
  "Multas Económicas",
  "Conducta Deportiva",
  "General",
];

export const regulationMockData: RegulationArticle[] = [
  {
    id: "1",
    articleNumber: "ARTÍCULO 14.2",
    title: "Conducta antideportiva hacia el árbitro",
    description:
      "Cualquier insulto, gesto despectivo o intento de agresión física o verbal hacia el cuerpo arbitral antes, durante o después del encuentro.",
    sanction: "3 a 5 Partidos + $150.00 MXN",
    badgeVariant: "primary",
    category: "Conducta Deportiva",
  },
  {
    id: "2",
    articleNumber: "ARTÍCULO 8.1",
    title: "Acumulación de Tarjetas Amarillas",
    description:
      "La acumulación de tres tarjetas amarillas en un mismo torneo regular resultará en la suspensión automática del siguiente encuentro.",
    sanction: "1 Partido de suspensión",
    badgeVariant: "warning",
    category: "Tarjetas & Amonestaciones",
  },
  {
    id: "3",
    articleNumber: "ARTÍCULO 21.5",
    title: "Incomparecencia (W.O.)",
    description:
      "No presentarse al terreno de juego con el mínimo de jugadores requeridos (7) pasados los 15 minutos de tolerancia del horario programado.",
    sanction: "Pérdida de puntos + $500.00 MXN",
    badgeVariant: "danger",
    category: "General",
  },
  {
    id: "4",
    articleNumber: "ARTÍCULO 5.3",
    title: "Alineación Indebida",
    description:
      "Participación de un jugador que no esté registrado formalmente en la cédula digital o que se encuentre cumpliendo una sanción vigente.",
    sanction: "Veto de jugador + Multa Equipo",
    badgeVariant: "primary",
    category: "Inscripciones",
  },
];
