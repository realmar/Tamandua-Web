import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SearchFieldData } from './search-field-data';
import { isNullOrUndefined } from '../../utils/misc';
import { Subscription } from 'rxjs';
import { Comparator, ComparatorType } from '../../api/request/comparator';
import { FieldChoicesResponse } from '../../api/response/field-choices-response';
import { ApiService } from '../../api/api-service';
import { ColumnsResponse } from '../../api/response/columns-response';

@Component({
  selector: 'search-mask-field',
  templateUrl: './search-field.component.html',
  styleUrls: [ './search-field.component.scss' ]
})
export class SearchFieldComponent implements OnInit, OnDestroy {
  private _onFieldsRefreshSubscription: Subscription;
  private _data: SearchFieldData;

  @Input()
  public set data (value: SearchFieldData) {
    if (!isNullOrUndefined(this._onFieldsRefreshSubscription)) {
      this._onFieldsRefreshSubscription.unsubscribe();
    }

    this._onFieldsRefreshSubscription =
      value
        .onRefreshFields
        .subscribe(() => {
          this.getAllSupportedFieldChoices();
          this.getColumns();
        });

    this._data = value;
    this.dataChange.emit(this._data);
  }

  @Output() public dataChange = new EventEmitter<SearchFieldData>();

  private _fields: ColumnsResponse = [ 'loading ...' ];
  public get fields (): ColumnsResponse {
    return this._fields;
  }

  public get field (): string {
    return this._data.name;
  }

  public set field (value: string) {
    this._data.name = value;
    this.dataChange.emit(this._data);
  }

  public get comparator (): ComparatorType {
    return this._data.comparator.type;
  }

  public set comparator (value: ComparatorType) {
    this._data.comparator = new Comparator(value);

    if (this._data.comparator.type !== ComparatorType.Regex && this._data.value === '^') {
      this._data.value = '';
    } else if (this._data.comparator.type === ComparatorType.Regex && this._data.value === '') {
      this._data.value = '^';
    }

    this.dataChange.emit(this._data);
  }

  public get value (): string | number {
    return this._data.value;
  }

  public set value (value: string | number) {
    this._data.value = value;
    this.dataChange.emit(this._data);
  }

  private readonly _comparators: Array<ComparatorType>;
  public get comparators (): Array<ComparatorType> {
    return this._comparators;
  }

  private _fieldChoicesMap: Map<string, FieldChoicesResponse>;

  public get fieldChoices (): FieldChoicesResponse {
    const choices = this._fieldChoicesMap.get(this.field);
    if (isNullOrUndefined(choices)) {
      return [];
    } else {
      return choices;
    }
  }

  public get fieldHasChoices (): boolean {
    return this.fieldChoices.length > 0;
  }

  public constructor (private _apiService: ApiService) {
    this._fieldChoicesMap = new Map<string, FieldChoicesResponse>();

    this._comparators = Object.keys(ComparatorType).map(
      key => ComparatorType[ key ] as ComparatorType);
  }

  private getAllSupportedFieldChoices (): void {
    this._apiService
      .getAllSupportedFieldChoices()
      .subscribe(result => this._fieldChoicesMap = result, error => console.error(error));
  }

  private getColumns (): void {
    this._apiService
      .getColumns()
      .subscribe(result => {
        const hasField = !isNullOrUndefined(this.field);
        const isLoading = this._fields[ 0 ].startsWith('loading');

        this._fields = result;

        const fieldIsValid = this._fields.some(x => x === this.field);

        if ((!fieldIsValid || !hasField) && isLoading) {
          this.field = this._fields[ 0 ];
        }
      });
  }

  public ngOnInit () {
    if (isNullOrUndefined(this._data.comparator)) {
      this._data.comparator = new Comparator(this.comparators[ 0 ]);
    }

    this.dataChange.emit(this._data);

    this.getAllSupportedFieldChoices();
    this.getColumns();
  }

  public ngOnDestroy (): void {
    if (!isNullOrUndefined(this._onFieldsRefreshSubscription)) {
      this._onFieldsRefreshSubscription.unsubscribe();
    }
  }
}
