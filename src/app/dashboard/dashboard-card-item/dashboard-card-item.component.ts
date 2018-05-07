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
  @Input()
  public set data (value: DashboardCardItemData) {
    this._data = value;
  }

  private _indentLevel: number;
  public get indentLevel (): number {
    return this._indentLevel * 2;
  }

  @Input()
  public set indentLevel (value: number) {
    this._indentLevel = value;
  }

  private _clickable: boolean;
  @Input()
  public set clickable (value: boolean) {
    this._clickable = value;
  }

  public get clickable (): boolean {
    return this._clickable;
  }

  @Output() itemClick: EventEmitter<DashboardCardItemData>;

  public get label (): string {
    return this._data.key;
  }

  public get amount (): number {
    return this._data.amount;
  }

  public get totalAmount (): number {
    return this._data.totalAmount;
  }

  public get percentage (): number {
    return (this.amount / this.totalAmount) * 100;
  }

  private _colors: Array<string>;

  public get color (): string {
    return this._colors[ Math.floor(this.percentage) ];
  }

  public constructor () {
    this.itemClick = new EventEmitter<DashboardCardItemData>();
    this._colors = [];
    this._indentLevel = 0;
  }

  public ngOnInit () {
    const colorRange = this._data.colorRange.mode('lab').colors(100);
    for (const color of colorRange) {
      this._colors.push(chroma(color).luminance(0.4).hex());
    }
  }

  public onItemClick (): void {
    if (this._clickable) {
      this.itemClick.emit(this._data);
    }
  }
}
