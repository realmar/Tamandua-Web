import { Comparator } from './comparator';

export interface RequestBuilderField {
  readonly name: string;
  readonly value: string | number;
  readonly comparator: Comparator;
}
