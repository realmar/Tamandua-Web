import { ApiService } from '../api-service';
import { Endpoint } from './endpoints/endpoint';
import { Observable } from 'rxjs/Observable';
import { ApiResponse } from '../response/api-response';

export interface ApiRequestData {
  readonly endpoint: Endpoint;

  // visitor
  accept<T extends ApiResponse> (apiService: ApiService): Observable<T>;
}
