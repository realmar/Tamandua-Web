import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { SearchMaskResult } from '../../../search-mask/search-mask-result';
import { SearchMaskComponent } from '../../../search-mask/search-mask.component';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CardRowBuilder } from '../card-row-builder';
import { ApiService } from '../../../api/api-service';
import { DashboardSettingsService } from '../../settings/dashboard-settings-service/dashboard-settings.service';
import { pastDate } from '../default-cards/helpers';
import { ColumnsResponse } from '../../../api/response/columns-response';
import { createAdvancedEndpoint } from '../../../api/request/endpoints/advanced-count-endpoint';
import { Comparator, ComparatorType } from '../../../api/request/comparator';
import { RequestBuilderField } from '../../../api/request/request-builder-field';

interface CardChild {
  readonly title: string;
  readonly domainOnly: boolean;
  readonly searchMask: SearchMaskResult;
}

@Component({
  selector: 'app-dashboard-add-card-modal',
  templateUrl: './dashboard-add-card-modal.component.html',
  styleUrls: [ './dashboard-add-card-modal.component.scss' ]
})
export class DashboardAddCardModalComponent implements OnInit {
  @ViewChild(SearchMaskComponent) private _searchMask: SearchMaskComponent;

  private readonly _children: Array<CardChild>;
  public get children (): Array<CardChild> {
    return this._children;
  }

  private _isAddingChild: boolean;
  public get isAddingChild (): boolean {
    return this._isAddingChild;
  }

  private readonly _cardTitleForm: FormControl;
  public get cardTitleForm (): FormControl {
    return this._cardTitleForm;
  }

  private readonly _childTitleForm: FormControl;
  public get childTitleForm (): FormControl {
    return this._childTitleForm;
  }

  private _childField: string;
  public set childField (value: string) {
    this._childField = value;
  }

  public get childField (): string {
    return this._childField;
  }

  private _childIsDomainOnly: boolean;
  public get childIsDomainOnly (): boolean {
    return this._childIsDomainOnly;
  }

  public set childIsDomainOnly (value: boolean) {
    this._childIsDomainOnly = value;
  }

  private _fields: ColumnsResponse;
  public get fields (): ColumnsResponse {
    return this._fields;
  }

  public get canBeAdded (): boolean {
    const hasTitle = !String.isEmptyNullOrUndefined(this._cardTitleForm.value);
    const hasChildren = this._children.length > 0;

    return hasTitle && hasChildren;
  }

  public constructor (private _dialogRef: MatDialogRef<DashboardAddCardModalComponent>,
                      @Inject(MAT_DIALOG_DATA) public _dialogData: any,
                      private _apiService: ApiService,
                      private _dashboardSettingsService: DashboardSettingsService) {
    this._fields = [ 'loading ...' ];
    this._children = [];
    this._isAddingChild = false;

    this._cardTitleForm = new FormControl();
    this._childTitleForm = new FormControl();
  }

  public ngOnInit () {
    this._apiService
      .getColumns()
      .subscribe(result => {
        const reassignName = this._fields[ 0 ].startsWith('loading');
        this._fields = result;

        if (reassignName) {
          this.childField = this._fields[ 0 ];
        }
      });
  }

  public addChild (): void {
    this._searchMask.clearSearchMask();
    this._childTitleForm.setValue('');
    this._childField = this._fields[ 0 ];
    this._childIsDomainOnly = false;

    this._isAddingChild = true;
  }

  public removeChild (child: CardChild): void {
    this._children.splice(this._children.indexOf(child), 1);
  }

  public applySearchMaskResult (result: SearchMaskResult): void {
    if (!this._childTitleForm.value) {
      return;
    }

    this._children.push({
      title: this._childTitleForm.value,
      domainOnly: this._childIsDomainOnly,
      searchMask: result
    });

    this._isAddingChild = false;
  }

  public applyCard (): void {
    const cardBuilder = new CardRowBuilder();
    cardBuilder.setTitle(this._cardTitleForm.value);
    this._children.forEach(child => {
      const requestBuilder = this._apiService.getRequestBuilder();

      requestBuilder.setStartDatetime(pastDate(this._dashboardSettingsService.getPastHours()));
      requestBuilder.setEndpoint(
        createAdvancedEndpoint(
          this._childField,
          this._dashboardSettingsService.getMaxItemCountPerCard(),
          child.domainOnly ? '@' : undefined)
      );
      child.searchMask.fields.forEach(field => requestBuilder.addField(field.name, field.value, field.comparator));

      let baseFields: RequestBuilderField;

      if (child.domainOnly) {
        baseFields = {
          name: this.childField,
          value: '{value}$',
          comparator: new Comparator(ComparatorType.Regex)
        };
      } else {
        baseFields = {
          name: this.childField,
          value: '{value}',
          comparator: new Comparator(ComparatorType.Equals)
        };
      }

      cardBuilder.addChild(child.title, [ baseFields ], requestBuilder);
    });

    this._dialogRef.close(cardBuilder.build());
  }
}
