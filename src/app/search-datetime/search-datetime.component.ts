import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-search-datetime',
  templateUrl: './search-datetime.component.html',
  styleUrls: [ './search-datetime.component.scss' ]
})
export class SearchDatetimeComponent implements OnInit {

  @Input() label: string;

  private _date: Date;

  @Input() set datetime (value: Date) {
    if (!isNullOrUndefined(value)) {
      this._date = value;
    }
    this.datetimeChange.emit(this._date);
  }

  @Output() datetimeChange = new EventEmitter<Date>();

  get date (): Date {
    return this._date;
  }

  set date (value: Date) {
    this._date.setDate(value.getDate());
    this.datetimeChange.emit(this._date);
  }

  get hours (): number {
    return this._date.getHours();
  }

  set hours (value: number) {
    this._date.setHours(value);
    this.datetimeChange.emit(this._date);
  }

  get minutes (): number {
    return this._date.getMinutes();
  }

  set minutes (value: number) {
    this._date.setMinutes(value);
    this.datetimeChange.emit(this._date);
  }

  constructor () {
  }

  ngOnInit () {
    this._date = new Date();
    this._date.setSeconds(0);
  }
}
