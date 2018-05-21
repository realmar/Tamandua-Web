import { ApiService } from '../api-service';
import { Endpoint } from './endpoints/endpoint';
import { Observable } from 'rxjs';
import { ApiResponse } from '../response/api-response';

export interface ApiRequestData {
  readonly endpoint: Endpoint;
  readonly data: object;
}
