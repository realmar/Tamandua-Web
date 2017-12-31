import { Comparator } from '../../expression/comparator';
import { Request } from './request';

export interface RequestBuilder {
  addField (name: string, value: string, comparator: Comparator): void;

  setStartDatetime (datetime: Date): void;

  setEndDatetime (datetime: Date): void;

  removeStartDatetime (): void;

  removeEndDatetime (): void;

  build(): Request;
}
