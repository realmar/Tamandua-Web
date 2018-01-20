import { SaveStrategy } from './save-strategy';
import { DataObject } from '../save-object-data';
import { saveAs } from 'file-saver';
import { dump } from 'js-yaml';

export class YamlSaveStrategy implements SaveStrategy {
  public get name (): string {
    return 'YAML';
  }

  public save (filename: string, data: DataObject): void {
    const file = new File(
      [ dump(data.toObject()) ],
      filename + '.yml',
      { type: 'text/plain;charset=utf-8' });

    saveAs(file);
  }
}
