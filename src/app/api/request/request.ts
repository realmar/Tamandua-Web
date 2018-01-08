import { ApiService } from '../api-service';
import { Endpoint } from './endpoints/endpoint';

export interface ApiRequest {
  readonly callback: (object) => void;
  readonly endpoint: Endpoint;

  // visitor
  accept(apiService: ApiService): void;
}
