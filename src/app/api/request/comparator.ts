export enum ComparatorType {
  Regex = 're',
  RegexCaseInsensitive = 're_i',
  Equals = '=',
  NotEquals = '!=',
  Greater = '>',
  GreaterOrEqual = '>=',
  Less = '<',
  LessOrEqual = '<='
}

export class Comparator {
  private _type: ComparatorType;
  get type (): ComparatorType {
    return this._type;
  }

  constructor (type: ComparatorType) {
    this._type = type;
  }

  public toString (): string {
    return this._type.toString();
  }
}
