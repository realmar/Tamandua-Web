import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SettingValidationResult } from '../../../settings/setting-validation-result';
import { FormControl } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard-setting',
  templateUrl: './dashboard-setting.component.html',
  styleUrls: [ './dashboard-setting.component.scss' ]
})
export class DashboardSettingComponent implements OnInit {
  private _placeholder: string;
  private _type: string;
  private _lastEmittedData: string | number;
  private _data: string | number;
  private _dataFormControl: FormControl;

  public get placeholder (): string {
    return this._placeholder;
  }

  @Input()
  public set placeholder (value: string) {
    this._placeholder = value;
  }

  public get type (): string {
    return this._type;
  }

  @Input()
  public set type (value: string) {
    this._type = value;
  }

  public get data (): string | number {
    return this._data;
  }

  @Input()
  public set data (value: string | number) {
    this._data = value;
    this._dataFormControl.setValue(value);
  }

  public get dataFormControl (): FormControl {
    return this._dataFormControl;
  }

  private _dataChange: EventEmitter<string | number>;

  @Output()
  public get dataChange (): EventEmitter<string | number> {
    return this._dataChange;
  }

  private _validationResult: SettingValidationResult;

  @Input()
  public set validationResultObservable (value: Observable<SettingValidationResult>) {
    value.subscribe(result => {
      const isValid = isNullOrUndefined(this._validationResult) || result.isValid !== this._validationResult.isValid;
      if (isNullOrUndefined(result) && !isValid) {
        return;
      }

      this._validationResult = result;
      this._dataFormControl.updateValueAndValidity();
    });
  }

  public get dataValidationMessage (): string {
    if (isNullOrUndefined(this._validationResult)) {
      return '';
    } else {
      return this._validationResult.messages.join('\n');
    }
  }

  constructor () {
    this._dataChange = new EventEmitter<string | number>();
    this._dataFormControl = new FormControl('', this.validator.bind(this));

    this._dataFormControl.valueChanges.subscribe(value => {
      if (value !== this._lastEmittedData) {
        this._lastEmittedData = value;
        this._dataChange.emit(value);
      }
    });
  }

  ngOnInit () {
  }

  private validator (control: FormControl): { [ error: string ]: any } {
    if (!isNullOrUndefined(this._validationResult) && !this._validationResult.isValid) {
      return { custom: { value: false } };
    } else {
      return null;
    }
  }
}
