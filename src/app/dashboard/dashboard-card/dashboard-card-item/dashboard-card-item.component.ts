import { Component, Input, OnInit } from '@angular/core';
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

  get label (): string {
    return this._data.label;
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
    this._colors = [];

    const colorRange = chroma.scale([ 'green', 'red' ]).mode('lab').colors(100);
    for (const color of colorRange) {
      this._colors.push(chroma(color).luminance(0.4).hex());
    }
  }

  ngOnInit () {
  }
}
