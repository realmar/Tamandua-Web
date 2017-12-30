import { Component, OnInit } from '@angular/core';
import { SearchFieldData } from '../search-field/search-field-data';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: [ './search.component.scss' ]
})
export class SearchComponent implements OnInit {
  private _startDateTime: Date;
  set startDateTime (value: Date) {
    this._startDateTime = value;
  }

  private _endDateTime: Date;
  set endDateTime (value: Date) {
    this._endDateTime = value;
  }

  private _fields: Array<SearchFieldData>;
  get fields (): Array<SearchFieldData> {
    return this._fields;
  }

  constructor () {
  }

  ngOnInit () {
    this._fields = [];
    this._fields.push(new SearchFieldData());
  }

  private anyFieldsEmpty (): boolean {
    return this._fields.some(element => element.value.trim().length === 0);
  }

  public addField (): void {
    if (this.anyFieldsEmpty()) {
      return;
    }

    this._fields.push(new SearchFieldData());
  }

  public removeField (field: SearchFieldData): void {
    if (this._fields.length < 2) {
      return;
    }

    const index = this._fields.indexOf(field);
    this._fields.splice(index, 1);
  }
}
