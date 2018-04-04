import { ApiService } from './api-service';

export abstract class CachedApiService extends ApiService {
  abstract invalidateAllCaches (): void;
}
