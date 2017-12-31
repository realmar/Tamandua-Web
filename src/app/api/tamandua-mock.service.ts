import { Injectable } from '@angular/core';
import { ApiService } from './api-service';
import { IntermediateExpressionRequestBuilder } from './request/intermediate-expression-request-builder';
import { IntermediateExpressionRequest } from './request/intermediate-expression-request';
import { RequestBuilder } from './request/request-builder';

@Injectable()
export class TamanduaMockService extends ApiService {
  getFields (): Array<string> {
    return [
      'sender',
      'recipient'
    ];
  }

  getRequestBuilder (): RequestBuilder {
    return new IntermediateExpressionRequestBuilder();
  }

  acceptIERequest (request: IntermediateExpressionRequest): void {

  }
}
