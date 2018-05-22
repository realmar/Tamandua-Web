import { SaveStrategy } from './strategies/save-strategy';

export type DataObject = Map<string, any>;

export interface SaveObjectData {
  readonly filename: string;
  readonly data: DataObject;

  readonly strategies: Array<SaveStrategy>;
}
