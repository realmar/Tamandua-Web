import { Component, Input, OnInit } from '@angular/core';
import { SaveObjectData } from './save-object-data';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-save-object',
  templateUrl: './save-object.component.html',
  styleUrls: [ './save-object.component.scss' ]
})
export class SaveObjectComponent implements OnInit {

  private _model: SaveObjectData;

  public get strategyNames (): Array<string> {
    return this._model.strategies.map(x => x.name);
  }

  @Input() set data (value: SaveObjectData) {
    this._model = value;
  }

  private _disabled: boolean;
  @Input() set disabled (value: boolean) {
    this._disabled = value;
  }

  get disabled (): boolean {
    return this._disabled;
  }

  ngOnInit () {
  }

  public executeStrategyByName (name: string): void {
    const strategy = this._model.strategies.find(s => s.name === name);
    if (!isNullOrUndefined(strategy)) {
      strategy.save(this._model.filename, this._model.data);
    }
  }
}
