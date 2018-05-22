import { SaveStrategy } from './save-strategy';
import { DataObject } from '../save-object-data';
import { saveAs } from 'file-saver';

export class JsonSaveStrategy implements SaveStrategy {
  public get name (): string {
    return 'JSON';
  }

  public save (filename: string, data: DataObject): void {
    const file = new File(
      [ JSON.stringify(data.toObject(), null, 2) ],
      filename + '.json',
      { type: 'text/plain;charset=utf-8' });

    saveAs(file);
  }
}
