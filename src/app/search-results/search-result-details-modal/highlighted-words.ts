import * as chroma from 'chroma-js';
import { Color } from 'chroma-js';
import { isNullOrUndefined } from '../../../utils/misc';

export class HighlightedWords {
  private readonly _words: Map<string, Color>;
  private _currentHue: number;

  public get words (): Map<string, Color> {
    return this._words;
  }

  public constructor () {
    this._words = new Map<string, Color>();
    this._currentHue = 0;
  }

  public addValue (value: string): void {
    if (this.hasValue(value)) {
      return;
    }

    this._words.set(value, chroma.lch(100, 100, this._currentHue));

    this._currentHue += 20;
    this._currentHue %= 180;
  }

  public removeValue (value: string): void {
    this._words.delete(value);
  }

  public getColor (value: string): string {
    const color = this._words.get(value);
    return isNullOrUndefined(color) ? '' : color.hex();
  }

  public hasValue (value: string): boolean {
    return this._words.has(value);
  }
}
