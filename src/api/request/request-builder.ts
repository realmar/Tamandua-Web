import { Comparator } from './comparator';
import { ApiRequestData } from './request';
import { Endpoint } from './endpoints/endpoint';
import { RequestBuilderField } from './request-builder-field';

export interface RequestBuilderConstructor {
  new (): RequestBuilder;
}

export interface RequestBuilder {
  addField (name: string, value: string | number, comparator: Comparator): RequestBuilder;

  getFields (): Array<RequestBuilderField>;

  removeAllFields (): RequestBuilder;

  setStartDatetime (datetime: Date): RequestBuilder;

  getStartDatetime (): Date;

  setEndDatetime (datetime: Date): RequestBuilder;

  getEndDatetime (): Date;

  removeStartDatetime (): RequestBuilder;

  removeEndDatetime (): RequestBuilder;

  setEndpoint (endpoint: Endpoint): RequestBuilder;

  getEndpoint (): Endpoint;

  build (): ApiRequestData;
}
