import { ApiService } from '../api-service';
import { Endpoint } from './endpoints/endpoint';
import { HttpErrorResponse } from '@angular/common/http';

export interface ApiRequest {
  readonly callback: (object) => void;
  readonly errorCallback: (HttpErrorResponse) => void;

  readonly endpoint: Endpoint;

  // visitor
  accept(apiService: ApiService): void;
}
