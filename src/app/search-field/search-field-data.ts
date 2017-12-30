import { Comparator } from '../expression/comparator';

export class SearchFieldData {
  public field: string;
  public comparator: Comparator;
  public value: string;

  constructor () {
    this.value = '';
  }
}
