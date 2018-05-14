import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Composite, Item } from '../../composite';
import { SearchMaskButton } from '../../../../../search-mask/search-mask-button';
import { SearchMaskResult } from '../../../../../search-mask/search-mask-result';
import { ApiService } from '../../../../../api/api-service';
import { SearchFieldData } from '../../../../../search-mask/search-field/search-field-data';
import { createCountEndpoint } from '../../../../../api/request/endpoints/count-endpoint';
import { isNullOrUndefined } from '../../../../../utils/misc';

@Component({
  selector: 'app-dashboard-overview-edit-searchmask',
  templateUrl: './dashboard-overview-edit-searchmask.component.html',
  styleUrls: [ './dashboard-overview-edit-searchmask.component.scss' ]
})
export class DashboardOverviewEditSearchmaskComponent implements OnInit {
  private _name: string;
  public set name (value: string) {
    this._name = value;
  }

  public get name (): string {
    return this._name;
  }

  private get composites (): Array<Composite> {
    if (isNullOrUndefined(this._composite)) {
      return [];
    }

    return this._composite.composites;
  }

  private _searchMaskFields: Array<SearchFieldData>;
  public get searchMaskFields (): Array<SearchFieldData> {
    return this._searchMaskFields;
  }

  private _buttons: Array<SearchMaskButton> = [
    {
      callback: () => this._dialogRef.close(null),
      label: 'Cancel'
    }
  ];
  public get buttons (): Array<SearchMaskButton> {
    return this._buttons;
  }

  public constructor (private _dialogRef: MatDialogRef<DashboardOverviewEditSearchmaskComponent>,
                      @Inject(MAT_DIALOG_DATA) private _composite: Composite,
                      private _apiService: ApiService) {
    if (_composite != null) {
      this._searchMaskFields = _composite.item.builder
        .getFields()
        .map(field => new SearchFieldData(field.name, field.value, field.comparator));
      this._name = this._composite.item.name;
    }
  }

  public ngOnInit () {
  }

  public applySearchMask (result: SearchMaskResult): void {
    const builder = this._apiService.getRequestBuilder();
    result.fields.forEach(field => builder.addField(field.name, field.value, field.comparator));
    builder.setEndpoint(createCountEndpoint());

    const composite = new Composite(new Item(this.name, builder), this.composites);
    this._dialogRef.close(composite);
  }
}
