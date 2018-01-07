import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-search-datetime',
  templateUrl: './search-datetime.component.html',
  styleUrls: [ './search-datetime.component.scss' ]
})
export class SearchDatetimeComponent implements OnInit {

  @Input() label: string;
  @Input() initalHasDateTime: boolean;

  private _date: Date;

  @Input() set datetime (value: Date) {
    if (!isNullOrUndefined(value)) {
      this._date = value;
    }
    this.emitDatetimeChange();
  }

  @Output() datetimeChange = new EventEmitter<Date>();

  private _hasDateTime: boolean;
  get hasDateTime (): boolean {
    return this._hasDateTime;
  }

  get date (): Date {
    return this._date;
  }

  set date (value: Date) {
    this._date.setDate(value.getDate());
    this.emitDatetimeChange();
  }

  get hours (): number {
    return this._date.getHours();
  }

  set hours (value: number) {
    this._date.setHours(value);
    this.emitDatetimeChange();
  }

  get minutes (): number {
    return this._date.getMinutes();
  }

  set minutes (value: number) {
    this._date.setMinutes(value);
    this.emitDatetimeChange();
  }

  constructor () {
  }

  ngOnInit () {
    if (this.initalHasDateTime) {
      this._hasDateTime = true;
    }

    if (isNullOrUndefined(this._date)) {
      this._date = new Date();
    }
    this._date.setSeconds(0);
    this.emitDatetimeChange();
  }

  private emitDatetimeChange (): void {
    this.datetimeChange.emit(this.hasDateTime ? this._date : undefined);
  }

  public toggleHasDatetime (): void {
    this._hasDateTime = !this._hasDateTime;
    this.emitDatetimeChange();
  }
}
