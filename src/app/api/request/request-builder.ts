import { Comparator } from './comparator';
import { ApiRequest } from './request';
import { Endpoint } from './endpoints/endpoint';

export interface RequestBuilder {
  addField (name: string, value: string, comparator: Comparator): void;

  setStartDatetime (datetime: Date): void;

  setEndDatetime (datetime: Date): void;

  removeStartDatetime (): void;

  removeEndDatetime (): void;

  setEndpoint(endpoint: Endpoint): void;

  setCallback(callback: (object) => void): void;

  build(): ApiRequest;
}
