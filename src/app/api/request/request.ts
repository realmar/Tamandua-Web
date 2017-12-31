import { ApiService } from '../api-service';

export interface Request {
  // visitor
  accept(apiService: ApiService): void;
}
