import { DataObject } from '../save-object-data';

export interface SaveStrategy {
  readonly name: string;

  save(filename: string, data: DataObject): void;
}
