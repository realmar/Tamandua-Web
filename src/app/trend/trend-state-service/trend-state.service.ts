import { Injectable } from '@angular/core';
import { RequestBuilder } from '../../../api/request/request-builder';
import * as clone from 'clone';

export interface TrendInputData {
  title: string;
  requestBuilder: RequestBuilder;
}

@Injectable()
export class TrendStateService {
  private _data: TrendInputData;
  public get data (): TrendInputData {
    return this._data;
  }

  public set data (value: TrendInputData) {
    this._data = clone(value);
  }
}
