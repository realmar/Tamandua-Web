import { ApiService } from '../api-service';
import { Endpoint } from './endpoints/endpoint';

export interface Request {
  readonly callback: (object) => void;
  readonly endpoint: Endpoint;

  // visitor
  accept(apiService: ApiService): void;
}
