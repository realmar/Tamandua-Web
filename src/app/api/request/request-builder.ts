import { Comparator } from '../../expression/comparator';
import { Request } from './request';
import { Endpoint } from './endpoints/endpoint';

export interface RequestBuilder {
  addField (name: string, value: string, comparator: Comparator): void;

  setStartDatetime (datetime: Date): void;

  setEndDatetime (datetime: Date): void;

  removeStartDatetime (): void;

  removeEndDatetime (): void;

  setEndpoint(endpoint: Endpoint): void;

  build(): Request;
}
