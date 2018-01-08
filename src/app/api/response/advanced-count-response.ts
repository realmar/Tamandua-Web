import { ApiResponse } from './api-response';

export interface AdvancedCountItem {
  key: string;
  value: number;
}

export interface AdvancedCountResponse extends ApiResponse {
  items: Array<AdvancedCountItem>;
  total: number;
}
