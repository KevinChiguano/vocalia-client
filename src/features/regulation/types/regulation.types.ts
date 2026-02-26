export interface RegulationArticle {
  article_id: number;
  article_num: string;
  title: string;
  description: string;
  sanction: string;
  badge_variant:
    | "primary"
    | "warning"
    | "danger"
    | "info"
    | "success"
    | "neutral"
    | "outline";
  category: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRegulationDTO {
  article_num: string;
  title: string;
  description: string;
  sanction: string;
  category: string;
  badge_variant?: string;
}

export interface UpdateRegulationDTO extends Partial<CreateRegulationDTO> {
  is_active?: boolean;
}
