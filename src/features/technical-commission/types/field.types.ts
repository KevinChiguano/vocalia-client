export interface Field {
  field_id: number;
  name: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFieldDto {
  name: string;
  location?: string;
  isActive?: boolean;
}

export interface UpdateFieldDto extends Partial<CreateFieldDto> {}
