import { ApiResponse } from './api-response';

export interface AdvancedCountItem {
  readonly key: string;
  readonly value: number;
}

export interface AdvancedCountResponse extends ApiResponse {
  readonly items: Array<AdvancedCountItem>;
  readonly total: number;
}
