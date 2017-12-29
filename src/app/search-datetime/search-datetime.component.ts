import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-search-datetime',
  templateUrl: './search-datetime.component.html',
  styleUrls: [ './search-datetime.component.scss' ]
})
export class SearchDatetimeComponent implements OnInit {

  @Input() label: string;
  @Output() datetime = new EventEmitter<Date>();

  private _date = new Date();

  get date (): Date {
    return this._date;
  }

  set date (value: Date) {
    this._date.setDate(value.getDate());
    this.datetime.emit(this._date);
  }

  get hours (): number {
    return this._date.getHours();
  }

  set hours (value: number) {
    this._date.setHours(value);
    this.datetime.emit(this._date);
  }

  get minutes (): number {
    return this._date.getMinutes();
  }

  set minutes (value: number) {
    this._date.setMinutes(value);
    this.datetime.emit(this._date);
  }

  constructor () {
  }

  ngOnInit () {
  }

}
