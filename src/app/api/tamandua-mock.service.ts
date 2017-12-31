import { Injectable } from '@angular/core';
import { ApiService } from './api-service';
import { IntermediateExpressionRequestBuilder } from './request/intermediate-expression-request-builder';
import { IntermediateExpressionRequest } from './request/intermediate-expression-request';
import { RequestBuilder } from './request/request-builder';
import { of } from 'rxjs/observable/of';

@Injectable()
export class TamanduaMockService extends ApiService {
  getColumns (): Promise<Array<string>> {
    return of([
      'sender',
      'recipient'
    ]).toPromise();
  }

  getTags (): Promise<Array<string>> {
    return null;
  }

  getFieldChoices (field: string, limit: number): Promise<Array<string>> {
    return null;
  }

  getRequestBuilder (): RequestBuilder {
    return new IntermediateExpressionRequestBuilder();
  }

  acceptIERequest (request: IntermediateExpressionRequest): void {

  }
}
