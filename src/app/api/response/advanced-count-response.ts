export interface AdvancedCountItem {
  key: string;
  value: number;
}

export interface AdvancedCountResponse {
  items: Array<AdvancedCountItem>;
  total: number;
}
