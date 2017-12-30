import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Comparator, ComparatorType } from '../expression/comparator';
import { ApiService } from '../tamandua-service/api-service';
import { SearchFieldData } from './search-field-data';

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: [ './search-field.component.scss' ]
})
export class SearchFieldComponent implements OnInit {
  private _data: SearchFieldData;

  @Output() data = new EventEmitter<SearchFieldData>();

  get field (): string {
    return this._data.field;
  }

  set field (value: string) {
    this._data.field = value;
    this.data.emit(this._data);
  }

  get comparator (): Comparator {
    return this._data.comparator;
  }

  set comparator (value: Comparator) {
    this._data.comparator = value;
    this.data.emit(this._data);
  }

  get value (): string {
    return this._data.value;
  }

  set value (v: string) {
    this._data.value = v;
    this.data.emit(this._data);
  }

  get comparatorTypes (): Array<Comparator> {
    return Object.keys(ComparatorType).map(key => ComparatorType[ key ]);
  }

  get fields (): Array<string> {
    return this.apiService.getFields();
  }

  constructor (private apiService: ApiService) {
  }

  ngOnInit () {
    this._data = new SearchFieldData();
    this._data.comparator = this.comparatorTypes[ 0 ];
    this._data.field = this.fields[ 0 ];
  }
}
