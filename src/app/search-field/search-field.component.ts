import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Comparator, ComparatorType } from '../api/request/comparator';
import { ApiService } from '../api/api-service';
import { SearchFieldData } from './search-field-data';
import { isNullOrUndefined } from 'util';
import { FieldChoicesResponse } from '../api/response/field-choices-response';
import { ToastrService } from 'ngx-toastr';
import { ErrorConstants } from '../utils/error-constants';
import { ToastrUtils } from '../utils/toastr-utils';

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: [ './search-field.component.scss' ]
})
export class SearchFieldComponent implements OnInit {
  private readonly _maxFieldChoicesPerField: number;
  private _data: SearchFieldData;

  @Input() set data (value: SearchFieldData) {
    this._data = value;
    this.dataChange.emit(this._data);
  }

  @Output() dataChange = new EventEmitter<SearchFieldData>();

  get field (): string {
    return this._data.name;
  }

  set field (value: string) {
    this._data.name = value;
    this.dataChange.emit(this._data);
  }

  get comparator (): ComparatorType {
    return this._data.comparator.type;
  }

  set comparator (value: ComparatorType) {
    this._data.comparator = new Comparator(value);

    if (this._data.comparator.type !== ComparatorType.Regex && this._data.value === '^') {
      this._data.value = '';
    } else if (this._data.comparator.type === ComparatorType.Regex && this._data.value === '') {
      this._data.value = '^';
    }

    this.dataChange.emit(this._data);
  }

  get value (): string | number {
    return this._data.value;
  }

  set value (value: string | number) {
    this._data.value = value;
    this.dataChange.emit(this._data);
  }

  private _comparators: Array<ComparatorType>;
  get comparators (): Array<ComparatorType> {
    return this._comparators;
  }

  private _fields: Array<string>;
  get fields (): Array<string> {
    return this._fields;
  }

  private _fieldChoicesMap: Map<string, FieldChoicesResponse>;
  get fieldChoicesMap (): Map<string, FieldChoicesResponse> {
    return this._fieldChoicesMap;
  }

  get fieldHasChoices (): boolean {
    return !isNullOrUndefined(this._fieldChoicesMap.get(this.field));
  }

  constructor (private _apiService: ApiService,
               private _toastr: ToastrService) {
    this._maxFieldChoicesPerField = 10;
    this._fieldChoicesMap = new Map<string, FieldChoicesResponse>();
    this._fields = [ 'loading ...' ];
    this._comparators = Object.keys(ComparatorType).map(
      key => ComparatorType[ key ] as ComparatorType);
  }

  ngOnInit () {
    // assign default values if they are not set
    if (isNullOrUndefined(this._data.name)) {
      this._data.name = this.fields[ 0 ];
    } else {
      this._fields = [ this._data.name ];
    }

    if (isNullOrUndefined(this._data.comparator)) {
      this._data.comparator = new Comparator(this.comparators[ 0 ]);
    }

    this.dataChange.emit(this._data);

    this._apiService.getColumns().subscribe(data => {
      ToastrUtils.removeAllGenericServerErrors(this._toastr);

      const reassignName = this._fields[ 0 ].startsWith('loading');
      this._fields = data;
      if (reassignName) {
        this._data.name = this._fields[ 0 ];
      }

      this.getFieldChoices();
    }, () => ToastrUtils.showGenericServerError(this._toastr));
  }

  private getFieldChoices (): void {
    this._apiService.getSupportedFieldChoices().subscribe(response => {
      for (const column of this._fields.filter(x => response.indexOf(x) !== -1)) {
        this._apiService.getFieldChoices(column, this._maxFieldChoicesPerField)
          .subscribe(
            result => {
              ToastrUtils.removeAllGenericServerErrors(this._toastr);
              this.processFieldChoicesResponse(result, column);
            },
            () => ToastrUtils.showGenericServerError(this._toastr));
      }
    });
  }

  private processFieldChoicesResponse (result: FieldChoicesResponse, fieldName: string) {
    if (result.length <= this._maxFieldChoicesPerField) {
      this._fieldChoicesMap.set(fieldName, result);
    }
  }
}
