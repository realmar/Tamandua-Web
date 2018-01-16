import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DashboardCardItemData } from './dashboard-card-item-data';
import * as chroma from 'chroma-js';

@Component({
  selector: 'app-dashboard-card-item',
  templateUrl: './dashboard-card-item.component.html',
  styleUrls: [ './dashboard-card-item.component.scss' ]
})
export class DashboardCardItemComponent implements OnInit {

  private _data: DashboardCardItemData;
  @Input() set data (value: DashboardCardItemData) {
    this._data = value;
  }

  @Output() itemClick: EventEmitter<DashboardCardItemData>;

  get label (): string {
    return this._data.key;
  }

  get amount (): number {
    return this._data.amount;
  }

  get totalAmount (): number {
    return this._data.totalAmount;
  }

  get percentage (): number {
    return (this.amount / this.totalAmount) * 100;
  }

  private _colors: Array<string>;

  get color (): string {
    return this._colors[ Math.floor(this.percentage) ];
  }

  constructor () {
    this.itemClick = new EventEmitter<DashboardCardItemData>();
    this._colors = [];
  }

  ngOnInit () {
    const colorRange = this._data.colorRange.mode('lab').colors(100);
    for (const color of colorRange) {
      this._colors.push(chroma(color).luminance(0.4).hex());
    }
  }

  public onItemClick (): void {
    this.itemClick.emit(this._data);
  }
}
