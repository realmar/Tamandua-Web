import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Comparator, ComparatorType } from '../expression/comparator';
import { ApiService } from '../tamandua-service/api-service';
import { SearchFieldData } from './search-field-data';

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: [ './search-field.component.css' ]
})
export class SearchFieldComponent implements OnInit {
  private data: SearchFieldData;

  @Output() dataChange = new EventEmitter<SearchFieldData>();

  get field (): string {
    return this.data.field;
  }

  set field (value: string) {
    this.data.field = value;
    this.dataChange.emit(this.data);
  }

  get comparator (): Comparator {
    return this.data.comparator;
  }

  set comparator (value: Comparator) {
    this.data.comparator = value;
    this.dataChange.emit(this.data);
  }

  get value (): string {
    return this.data.value;
  }

  set value (v: string) {
    this.data.value = v;
    this.dataChange.emit(this.data);
  }

  get comparatorTypes (): Array<ComparatorType> {
    return Object.keys(ComparatorType).map(key => ComparatorType[ key ]);
  }

  get fields (): Array<string> {
    return this.apiService.getFields();
  }

  constructor (private apiService: ApiService) {
  }

  ngOnInit () {
    this.data = new SearchFieldData();
  }
}
