import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrUtils } from '../../utils/toastr-utils';
import { FieldChoicesResponse } from '../../api/response/field-choices-response';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../api/api-service';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'search-mask-field-autcomplete',
  templateUrl: './search-field-autocomplete.component.html',
  styleUrls: [ './search-field-autocomplete.component.scss' ]
})
export class SearchFieldAutocompleteComponent implements OnInit {
  private readonly _maxFieldChoicesPerField: number;

  private _fields: Array<string>;
  get fields (): Array<string> {
    return this._fields;
  }

  private _field: string;
  public get field (): string {
    return this._field;
  }

  @Input()
  public set field (value: string) {
    if (!isNullOrUndefined(value)) {
      this._field = value;
    }

    this._fieldChange.emit(this._field);
    this._fieldChoicesChange.emit(this._fieldChoicesMap.get(value));
  }

  private readonly _fieldChange: EventEmitter<string>;
  @Output()
  public get fieldChange (): EventEmitter<string> {
    return this._fieldChange;
  }

  private readonly _fieldChoicesChange: EventEmitter<FieldChoicesResponse>;
  @Output()
  public get fieldChoicesChange (): EventEmitter<FieldChoicesResponse> {
    return this._fieldChoicesChange;
  }

  private readonly _fieldChoicesMap: Map<string, FieldChoicesResponse>;

  constructor (private _apiService: ApiService,
               private _toastr: ToastrService) {
    this._fields = [ 'loading ...' ];
    this._fieldChoicesMap = new Map<string, FieldChoicesResponse>();
    this._fieldChange = new EventEmitter<string>();
    this._fieldChoicesChange = new EventEmitter<FieldChoicesResponse>();

    this.getColumns();
  }

  public ngOnInit () {
  }

  public getColumns (): void {
    this._apiService.getColumns().subscribe(data => {
      ToastrUtils.removeAllGenericServerErrors(this._toastr);

      const reassignName = this._fields[ 0 ].startsWith('loading');
      this._fields = data;
      if (reassignName) {
        this.field = this._fields[ 0 ];
      }

      this.getFieldChoices();
    }, () => ToastrUtils.showGenericServerError(this._toastr));
  }

  private getFieldChoices (): void {
    this._apiService.getSupportedFieldChoices().subscribe(response => {
      for (const column of this._fields.filter(x => response.indexOf(x) !== -1)) {
        this._apiService
          .getFieldChoices(column)
          .subscribe(
            result => {
              ToastrUtils.removeAllGenericServerErrors(this._toastr);
              this.processFieldChoicesResponse(result, column);
            },
            () => ToastrUtils.showGenericServerError(this._toastr));
      }
    });
  }

  private processFieldChoicesResponse (result: FieldChoicesResponse, fieldName: string) {
    if (result.length <= ApiService.defaultFieldChoicesLimit) {
      this._fieldChoicesMap.set(fieldName, result);

      if (this.field === fieldName) {
        this._fieldChoicesChange.emit(result);
      }
    }
  }
}
