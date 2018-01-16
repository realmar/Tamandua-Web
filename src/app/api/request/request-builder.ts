import { Comparator } from './comparator';
import { ApiRequest } from './request';
import { Endpoint } from './endpoints/endpoint';
import { RequestBuilderField } from './request-builder-field';

export interface RequestBuilder {
  addField (name: string, value: string | number, comparator: Comparator): void;

  getFields(): Array<RequestBuilderField>;

  removeAllFields(): void;

  setStartDatetime (datetime: Date): void;

  getStartDatetime(): Date;

  setEndDatetime (datetime: Date): void;

  getEndDatetime(): Date;

  removeStartDatetime (): void;

  removeEndDatetime (): void;

  setEndpoint(endpoint: Endpoint): void;

  getEndpoint(): Endpoint;

  setCallback(callback: (object) => void): void;

  build(): ApiRequest;
}
