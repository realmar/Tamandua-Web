import { Injectable } from '@angular/core';
import { ApiService } from './api-service';
import { IntermediateExpressionRequestBuilder } from './request/intermediate-expression-request-builder';
import { RequestBuilder } from './request/request-builder';
import { of } from 'rxjs/observable/of';
import { Request } from './request/request';
import { IntermediateExpressionRequest } from './request/intermediate-expression-request';
import { EndpointEnum } from './request/endpoints/endpoint.enum';
import { SearchResponse } from './response/search-reponse';
import { CountResponse } from './response/count-response';
import { AdvancedCountResponse } from './response/advanced-count-response';
import { ColumnsResponse } from './response/columns-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';
import { SearchEndpoint } from './request/endpoints/search-endpoint';
import { AdvancedCountEndpoint } from './request/endpoints/advanced-count-endpoint';
import { CountEndpoint } from './request/endpoints/count-endpoint';

@Injectable()
export class TamanduaMockService extends ApiService {
  private endpointMap: Map<EndpointEnum, any>;

  constructor () {
    super();

    this.endpointMap = new Map<EndpointEnum, any>();
    this.endpointMap[ EndpointEnum.Search ] = this.search;
    this.endpointMap[ EndpointEnum.Count ] = this.count;
    this.endpointMap[ EndpointEnum.AdvancedCount ] = this.advancedCount;
  }

  public getColumns (): Promise<ColumnsResponse> {
    return of([
      'sender',
      'recipient'
    ]).toPromise();
  }

  public getTags (): Promise<TagsResponse> {
    return of([
      'spam',
      'reject',
      'outgoing',
      'intern',
      'corrupt',
      'mailinglist',
      'incomplete',
      'relaying',
      'incoming',
      'hold' ]).toPromise();
  }

  public getFieldChoices (field: string, limit: number): Promise<FieldChoicesResponse> {
    return of([ 'a', 'b', 'c' ]).toPromise();
  }

  public SubmitRequest (request: Request): void {
    request.accept(this);
  }

  public getRequestBuilder (): RequestBuilder {
    return new IntermediateExpressionRequestBuilder();
  }

  public visitIE (request: IntermediateExpressionRequest): void {
    this.endpointMap[ request.endpoint.getEnum() ](request.data, request.endpoint).then(request.callback);
  }

  public search (queryData: string, endpoint: SearchEndpoint): Promise<SearchResponse> {
    return of({
      'total_rows': 0,
      'rows': [
        {
          'phdimap_time': '2017/12/14 10:40:57',
          'size': [
            2292,
            2784,
            2872
          ],
          'username': 'john',
          'spamrequiredscore': 5.0,
          'phdmxin_time': '2017/12/14 10:40:57',
          'deliverystatus': 'sent',
          'spamscore': -1,
          'spamscantime': 0.6,
          'sender': 'scott@example.com',
          'deliverymessage': 'delivered to command: /usr/bin/procmail -t',
          'virusaction': 'RelayedInternal',
          'deliveryrelay': 'local',
          'phdimap_qid': '3yy7px65DlzXKh',
          'tags': [
            'intern'
          ],
          'messageid': '42de1b6c5acd8eb35b0241c3fe1e098b@example.com',
          'connectip': [
            '192.168.0.2',
            '192.168.0.3'
          ],
          'spamdesc': 'ALL_TRUSTED,BAYES_00,T_RP_MATCHES_RCVD',
          'virusresult': 'Passed CLEAN',
          'phdmxin_qid': '3yy7px5By3zQ4f',
          'uid': 1893,
          'connectclient': [
            'imap.example.com',
            'mailscan.example.com'
          ],
          'recipient': 'john@example.com',
          'loglines': [
            'line1',
            'line2',
          ]
        },
      ]
    }).toPromise();
  }

  public count (queryData: string, endpoint: CountEndpoint): Promise<CountResponse> {
    return of(2).toPromise();
  }

  public advancedCount (queryData: string, endpoint: AdvancedCountEndpoint): Promise<AdvancedCountResponse> {
    return of({
      'items': [
        {
          'key': 'example.com',
          'value': 2
        }
      ],
      'total': 2
    }).toPromise();
  }
}
