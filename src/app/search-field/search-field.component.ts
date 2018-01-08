import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Comparator, ComparatorType } from '../api/request/comparator';
import { ApiService } from '../api/api-service';
import { SearchFieldData } from './search-field-data';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: [ './search-field.component.scss' ]
})
export class SearchFieldComponent implements OnInit {
  private _data: SearchFieldData;

  @Input() set data (value: SearchFieldData) {
    this._data = value;

    // assign default values if they are not set
    if (isNullOrUndefined(this._data.field)) {
      this._data.field = this.fields[ 0 ];
    }

    if (isNullOrUndefined(this._data.comparator)) {
      this._data.comparator = this.comparators[ 0 ];
    }

    this.dataChange.emit(this._data);
  }

  @Output() dataChange = new EventEmitter<SearchFieldData>();

  get field (): string {
    return this._data.field;
  }

  set field (value: string) {
    this._data.field = value;
    this.dataChange.emit(this._data);
  }

  get comparator (): Comparator {
    return this._data.comparator;
  }

  set comparator (value: Comparator) {
    this._data.comparator = value;
    this.dataChange.emit(this._data);
  }

  get value (): string {
    return this._data.value;
  }

  set value (value: string) {
    this._data.value = value;
    this.dataChange.emit(this._data);
  }

  private _comparators: Array<Comparator>;
  get comparators (): Array<Comparator> {
    return this._comparators;
  }

  private _fields: Array<string>;
  get fields (): Array<string> {
    return this._fields;
  }

  constructor (private apiService: ApiService) {
    this._fields = [ 'loading ...' ];
    this._comparators = Object.keys(ComparatorType).map(
      key => new Comparator(ComparatorType[ key ] as ComparatorType));
  }

  ngOnInit () {
    this.comparator = this.comparators[ 0 ];
    let c = this.apiService.getColumns();
    c.subscribe(data => {
      this._fields = data;
      this._data.field = this._fields[ 0 ];
    });
  }
}
