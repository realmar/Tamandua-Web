import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { SearchFieldData } from './search-field/search-field-data';
import { Comparator, ComparatorType } from '../api/request/comparator';
import { isNullOrUndefined } from '../utils/misc';
import { CachedApiService } from '../api/cached-api-service';
import { SearchMaskResult } from './search-mask-result';
import { SearchMaskButton } from './search-mask-button';

@Component({
  selector: 'search-mask',
  templateUrl: './search-mask.component.html',
  styleUrls: [ './search-mask.component.scss' ]
})
export class SearchMaskComponent implements OnInit {
  private _additionalButtons: Array<SearchMaskButton>;
  public get additionalButtons (): Array<SearchMaskButton> {
    return this._additionalButtons;
  }

  @Input()
  public set additionalButtons (value: Array<SearchMaskButton>) {
    if (isNullOrUndefined(value)) {
      return;
    }

    this._additionalButtons = value;
  }

  private _startDateTime: Date;
  @Input()
  public set startDateTime (value: Date) {
    this._startDateTime = value;
  }

  public get startDateTime (): Date {
    return this._startDateTime;
  }

  private _endDateTime: Date;
  @Input()
  public set endDateTime (value: Date) {
    this._endDateTime = value;
  }

  public get endDateTime (): Date {
    return this._endDateTime;
  }

  private _fields: Array<SearchFieldData>;
  @Input()
  public set fields (value: Array<SearchFieldData>) {
    if (isNullOrUndefined(value)) {
      return;
    }

    this._fields = value;
  }

  public get fields (): Array<SearchFieldData> {
    return this._fields;
  }

  private _searchButtonLabel: string;
  public get searchButtonLabel (): string {
    return this._searchButtonLabel;
  }

  @Input()
  public set searchButtonLabel (value: string) {
    this._searchButtonLabel = value;
  }

  private _showLoadingSpinner: boolean;
  public get showLoadingSpinner (): boolean {
    return this._showLoadingSpinner;
  }

  private _showDateTime: boolean;
  public get showDateTime (): boolean {
    return this._showDateTime;
  }

  @Input()
  public set showDateTime (value: boolean) {
    this._showDateTime = value;
  }

  @Input()
  public set showLoadingSpinner (value: boolean) {
    this._showLoadingSpinner = value;
  }

  private readonly _onSearchClick: EventEmitter<SearchMaskResult>;
  @Output()
  public get onSearchClick (): EventEmitter<SearchMaskResult> {
    return this._onSearchClick;
  }

  public constructor (@Optional() private _cachedApiService: CachedApiService) {
    this._additionalButtons = [];
    this._searchButtonLabel = 'Search';
    this._onSearchClick = new EventEmitter<SearchMaskResult>();
    this._showDateTime = true;
    this.resetFields();
  }

  public ngOnInit () {
  }

  private resetFields (): void {
    this.fields = [ new SearchFieldData(undefined, undefined, new Comparator(ComparatorType.Regex)) ];
  }

  private assembleResult (): SearchMaskResult {
    return {
      startDateTime: this._startDateTime,
      endDateTime: this._endDateTime,
      fields: this._fields
    };
  }

  public setSearchMask (searchMask: SearchMaskResult) {
    this.clearSearchMask();

    this.startDateTime = searchMask.startDateTime;
    this.endDateTime = searchMask.endDateTime;
    this.fields = searchMask.fields;
  }

  public anyFieldsEmpty (): boolean {
    return this._fields.some(element =>
      typeof element.value === 'number' ? false : element.value.trim().length === 0 || element.value.trim() === '^');
  }

  public isOnlyField (): boolean {
    return this._fields.length < 2;
  }

  public addField (): void {
    if (this.anyFieldsEmpty()) {
      return;
    }

    this._fields.push(new SearchFieldData(undefined, undefined, new Comparator(ComparatorType.Regex)));
  }

  public removeField (field: SearchFieldData): void {
    if (this.isOnlyField()) {
      return;
    }

    const index = this._fields.indexOf(field);
    this._fields.splice(index, 1);
  }

  public clearSearchMask (): void {
    this.resetFields();
    this.startDateTime = undefined;
    this.endDateTime = undefined;
  }

  public refreshCache (): void {
    if (!isNullOrUndefined(this._cachedApiService)) {
      this._cachedApiService.invalidateAllCaches();
    }

    this._fields.forEach(field => field.emitOnRefreshFields());
  }

  public search (): void {
    this._onSearchClick.emit(this.assembleResult());
  }

  public invokeButtonCallback (button: SearchMaskButton): void {
    button.callback(this.assembleResult());
  }
}
