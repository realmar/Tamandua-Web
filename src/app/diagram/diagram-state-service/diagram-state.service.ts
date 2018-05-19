import { Injectable } from '@angular/core';
import { RequestBuilder } from '../../../api/request/request-builder';
import * as clone from 'clone';

export interface DiagramInputData {
  title: string;
  requestBuilder: RequestBuilder;
}

@Injectable()
export class DiagramStateService {
  private _data: DiagramInputData;
  public get data (): DiagramInputData {
    return this._data;
  }

  public set data (value: DiagramInputData) {
    this._data = clone(value);
  }
}
