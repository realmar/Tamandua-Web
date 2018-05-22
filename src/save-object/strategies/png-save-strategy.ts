import { SaveStrategy } from './save-strategy';
import { DataObject } from '../save-object-data';
import * as html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

export class PngSaveStrategy implements SaveStrategy {
  public get name (): string {
    return 'PNG';
  }

  public save (filename: string, data: DataObject): void {
    html2canvas(document.getElementById('image-canvas')).then(canvas => {
      canvas.toBlob(blob => {
        const file = new File(
          [ blob ],
          filename + '.png',
          { type: 'image/png' });
        saveAs(file);
      });
    });
  }
}
