import { SearchRowValue } from '../api/response/search-reponse';
import { SaveStrategy } from './strategies/save-strategy';

export type DataObject = Map<string, SearchRowValue>;

export interface SaveObjectData {
  readonly filename: string;
  readonly data: DataObject;

  readonly strategies: Array<SaveStrategy>;
}
