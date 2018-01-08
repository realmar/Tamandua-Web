import { Endpoint } from './endpoint';
import { EndpointMethod } from './endpoint-method.enum';

export class FieldchoicesEndpoint implements Endpoint {
  private _field: string;
  private _maxChoices: number;

  constructor (field: string, maxChoices: number) {
    this._field = field;
    this._maxChoices = maxChoices;
  }

  public get apiUrl (): string {
    return `api/fieldchoices/${this._field}/${this._maxChoices}`;
  }

  public get method (): EndpointMethod {
    return EndpointMethod.Get;
  }
}
