import { Injectable } from '@angular/core';
import { RequestBuilderField } from '../../../api/request/request-builder-field';

@Injectable()
export class SearchStateService {
  private _doSearch: boolean;
  private _fields: Array<RequestBuilderField>;
  private _startDatetime: Date;
  private _endDatetime: Date;

  public get doSearch (): boolean {
    return this._doSearch;
  }

  public set doSearch (value: boolean) {
    this._doSearch = value;
  }

  public get fields (): Array<RequestBuilderField> {
    return this._fields;
  }

  public set fields (value: Array<RequestBuilderField>) {
    this._fields = value;
  }

  public get startDatetime (): Date {
    return this._startDatetime;
  }

  public set startDatetime (value: Date) {
    this._startDatetime = value;
  }

  public get endDatetime (): Date {
    return this._endDatetime;
  }

  public set endDatetime (value: Date) {
    this._endDatetime = value;
  }

  constructor () {
    this._doSearch = false;
  }
}
