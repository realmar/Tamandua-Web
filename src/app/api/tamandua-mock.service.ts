import { Injectable } from '@angular/core';
import { ApiService } from './api-service';
import { IntermediateExpressionRequestBuilder } from './request/intermediate-expression-request-builder';
import { RequestBuilder } from './request/request-builder';
import { of } from 'rxjs/observable/of';
import { ApiRequest } from './request/request';
import { IntermediateExpressionRequest } from './request/intermediate-expression-request';
import { SearchResponse } from './response/search-reponse';
import { CountResponse } from './response/count-response';
import { AdvancedCountResponse } from './response/advanced-count-response';
import { ColumnsResponse } from './response/columns-response';
import { TagsResponse } from './response/tags-response';
import { FieldChoicesResponse } from './response/field-choices-response';
import { SearchEndpoint } from './request/endpoints/search-endpoint';
import { AdvancedCountEndpoint } from './request/endpoints/advanced-count-endpoint';
import { CountEndpoint } from './request/endpoints/count-endpoint';
import { Observable } from 'rxjs/Observable';
import { Endpoint } from './request/endpoints/endpoint';

@Injectable()
export class TamanduaMockService extends ApiService {
  public getColumns (): Observable<ColumnsResponse> {
    return of([
      'action',
      'connectclient',
      'connectip',
      'deliverymessage',
      'deliveryrelay',
      'deliverystatus',
      'holdreason',
      'lmtpmsg',
      'lmtpstatus',
      'loglines',
      'messageid',
      'orig_recipient',
      'phdimap_qid',
      'phdimap_time',
      'phdmailscan_qid',
      'phdmxin_qid',
      'phdmxin_time',
      'recipient',
      'rejectreason',
      'rejectstage',
      'saslmethod',
      'saslusername',
      'sender',
      'size',
      'spamdesc',
      'spamrequiredscore',
      'spamscantime',
      'spamscore',
      'statuscode',
      'tags',
      'uid',
      'username',
      'virusaction',
      'virusresult'
    ]);
  }

  public getTags (): Observable<TagsResponse> {
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
      'hold' ]);
  }

  public getFieldChoices (field: string, limit: number): Observable<FieldChoicesResponse> {
    return of([ 'a', 'b', 'c' ]);
  }

  public SubmitRequest (request: ApiRequest): void {
    request.accept(this);
  }

  public getRequestBuilder (): RequestBuilder {
    return new IntermediateExpressionRequestBuilder();
  }

  public visitIE (request: IntermediateExpressionRequest): void {
    if (request.endpoint instanceof SearchEndpoint) {
      this.search(request.data, request.endpoint).subscribe(request.callback);
    } else if (request.endpoint instanceof CountEndpoint) {
      this.count(request.data, request.endpoint).subscribe(request.callback);
    } else if (request.endpoint instanceof AdvancedCountEndpoint) {
      this.advancedCount(request.data, request.endpoint).subscribe(request.callback);
    }
  }

  public search (queryData: string, endpoint: Endpoint): Observable<SearchResponse> {
    /*return of({
      'total_rows': 0,
      'rows': [
        {
          'phdmxin_time': '2017/12/14 10:40:57',
          'sender': 'scott@example.com',
          'recipient': 'john@example.com',
        },
      ]
    });*/

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
        {
          'phdimap_time': '2017/12/14 10:40:57',
          'size': [
            2292,
            2784,
            2872
          ],
          'username': 'john',
          'spamrequiredscore': 5.0,
          'phdmxin_time': '2016/12/14 10:20:57',
          'deliverystatus': 'sent',
          'spamscore': -1,
          'spamscantime': 0.6,
          'sender': 'jennifer@example.com',
          'deliverymessage': 'delivered to command: /usr/bin/procmail -t',
          'virusaction': 'RelayedInternal',
          'deliveryrelay': 'local',
          'phdimap_qid': '3yy7px65DlzXKh',
          'tags': [
            'intern',
            'incoming',
            'hold'
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
          'recipient': 'tiffany@example.com',
          'loglines': [
            'line1',
            'line2',
          ]
        }
      ]
    });
  }

  public count (queryData: string, endpoint: Endpoint): Observable<CountResponse> {
    return of(2);
  }

  public advancedCount (queryData: string, endpoint: Endpoint): Observable<AdvancedCountResponse> {
    return of({
      'items': [
        {
          'key': 'example.com',
          'value': 2
        },
        {
          'key': 'another.example.com',
          'value': 4
        }
      ],
      'total': 6
    });
  }
}
