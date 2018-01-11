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
    if (isNullOrUndefined(this._data.name)) {
      this._data.name = this.fields[ 0 ];
    } else {
      this._fields = [ this._data.name ];
    }

    if (isNullOrUndefined(this._data.comparator)) {
      this._data.comparator = new Comparator(this.comparators[ 0 ]);
    }

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

  constructor (private apiService: ApiService) {
    this._fields = [ 'loading ...' ];
    this._comparators = Object.keys(ComparatorType).map(
      key => ComparatorType[ key ] as ComparatorType);
  }

  ngOnInit () {
    this.apiService.getColumns().subscribe(data => {
      const reassignName = this._fields[ 0 ].startsWith('loading');
      this._fields = data;
      if (reassignName) {
        this._data.name = this._fields[ 0 ];
      }
    });
  }
}
