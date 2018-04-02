import { Color } from 'chroma-js';

export class HighlightedWords {
  private readonly _words: Map<string, Color>;
  private _currentHue: number;

  public get words (): Map<string, chroma.Color> {
    return this._words;
  }

  public get currentHue (): number {
    return this._currentHue;
  }

  public set currentHue (value: number) {
    this._currentHue = value;
  }

  public constructor () {
    this._words = new Map<string, Color>();
    this._currentHue = 0;
  }
}
