import { Scale } from 'chroma-js';
import * as chroma from 'chroma-js';
import { isNullOrUndefined } from 'util';

export class DashboardCardItemData {
  private readonly _key;
  private readonly _amount;
  private readonly _totalAmount;
  private readonly _colorRange: Scale;

  public get key () {
    return this._key;
  }

  public get amount () {
    return this._amount;
  }

  public get totalAmount () {
    return this._totalAmount;
  }

  public get colorRange (): chroma.Scale {
    return this._colorRange;
  }

  constructor (key, amount, totalAmount, colorRange?: chroma.Scale) {
    this._key = key;
    this._amount = amount;
    this._totalAmount = totalAmount;
    this._colorRange = colorRange;

    if (isNullOrUndefined(this._colorRange)) {
      this._colorRange = chroma.scale([ 'green', 'red' ]);
    }
  }
}
