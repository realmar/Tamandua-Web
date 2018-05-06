import { Scale } from 'chroma-js';
import * as chroma from 'chroma-js';
import { isNullOrUndefined } from '../../../utils/misc';
import { Transform } from 'class-transformer';

function colorScaleToClass (value: Array<string>): Scale {
  return chroma.scale(value);
}

function colorScaleToPlain (value: Scale): Array<string> {
  return value.colors(undefined, undefined).map(color => color.hex());
}

export class DashboardCardItemData {
  private readonly _key: string;
  private readonly _amount: number;
  private readonly _totalAmount: number;

  @Transform(colorScaleToClass, { toClassOnly: true })
  @Transform(colorScaleToPlain, { toPlainOnly: true })
  private readonly _colorRange: Scale;

  public get key (): string {
    return this._key;
  }

  public get amount (): number {
    return this._amount;
  }

  public get totalAmount (): number {
    return this._totalAmount;
  }

  public get colorRange (): chroma.Scale {
    return this._colorRange;
  }

  constructor (key: string, amount: number, totalAmount: number, colorRange?: chroma.Scale) {
    this._key = key;
    this._amount = amount;
    this._totalAmount = totalAmount;
    this._colorRange = colorRange;

    if (isNullOrUndefined(this._colorRange)) {
      this._colorRange = chroma.scale([ 'green', 'red' ]);
    }
  }
}
