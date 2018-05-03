import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
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
import { CardRow } from '../card-row';
import { isNullOrUndefined } from 'util';
import { SearchFieldData } from '../../../search-mask/search-field/search-field-data';
import { SearchMaskButton } from '../../../search-mask/search-mask-button';
import * as clone from 'clone';

enum ViewState {
  Adding, Editing, Default
}

interface CardChild {
  title: string;
  field: string;
  domainOnly: boolean;
  searchMask: SearchMaskResult;
}

@Component({
  selector: 'app-dashboard-add-card-modal',
  templateUrl: './dashboard-add-card-modal.component.html',
  styleUrls: [ './dashboard-add-card-modal.component.scss' ]
})
export class DashboardAddCardModalComponent implements OnInit {
  @ViewChild(SearchMaskComponent) private _searchMask: SearchMaskComponent;

  private _applyButtonLabel: string;
  public get applyButtonLabel (): string {
    return this._applyButtonLabel;
  }

  @Input()
  public set applyButtonLabel (value: string) {
    this._applyButtonLabel = value;
  }

  private readonly _children: Array<CardChild>;
  public get children (): Array<CardChild> {
    return this._children;
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

  private _currentEditingChild: CardChild;
  private _viewState: ViewState;

  public get isInDefaultView (): boolean {
    return this._viewState === ViewState.Default;
  }

  public get additionalSearchMaskButtons (): Array<SearchMaskButton> {
    return [
      {
        label: 'Cancel',
        callback: result => this.cancelSearchMask()
      }
    ];
  }

  public constructor (private _dialogRef: MatDialogRef<DashboardAddCardModalComponent>,
                      @Inject(MAT_DIALOG_DATA) public _dialogData: CardRow,
                      private _apiService: ApiService,
                      private _dashboardSettingsService: DashboardSettingsService) {
    this._viewState = ViewState.Default;
    this._fields = [ 'loading ...' ];
    this._children = [];
    this._applyButtonLabel = 'Add';

    this._cardTitleForm = new FormControl();
    this._childTitleForm = new FormControl();

    if (!isNullOrUndefined(_dialogData)) {
      this._cardTitleForm.setValue(_dialogData.title);

      this._children = _dialogData.cardData.map(data => {
        const separator = data.requestBuilder.getEndpoint().metadata.separator;

        return {
          title: data.title,
          field: data.requestBuilder.getEndpoint().metadata.field,
          domainOnly: !isNullOrUndefined(separator),
          searchMask: {
            startDateTime: data.requestBuilder.getStartDatetime(),
            endDateTime: data.requestBuilder.getEndDatetime(),
            fields: data.requestBuilder
              .getFields()
              .map(field => new SearchFieldData(field.name, field.value, field.comparator))
          }
        };
      });
    }
  }

  public ngOnInit () {
    this._apiService
      .getColumns()
      .subscribe(result => {
        const fieldsWereNotInitialized = this._fields[ 0 ].startsWith('loading');
        const hasNameAlready = !String.isEmptyNullOrUndefined(this._childField);
        this._fields = result;

        if (fieldsWereNotInitialized && !hasNameAlready) {
          this.childField = this._fields[ 0 ];
        }
      });
  }

  public addChild (): void {
    this._searchMask.clearSearchMask();
    this._searchMask.searchButtonLabel = 'Add';

    this._childTitleForm.setValue('');
    this._childField = this._fields[ 0 ];
    this._childIsDomainOnly = false;

    this._viewState = ViewState.Adding;
  }

  public removeChild (child: CardChild): void {
    this._children.splice(this._children.indexOf(child), 1);
  }

  public editChild (child: CardChild): void {
    this._childTitleForm.setValue(child.title);
    this._childField = child.field;
    this._childIsDomainOnly = child.domainOnly;

    this._searchMask.setSearchMask(clone(child.searchMask));
    this._searchMask.searchButtonLabel = 'Edit';

    this._currentEditingChild = child;

    this._viewState = ViewState.Editing;
  }

  public applySearchMaskResult (result: SearchMaskResult): void {
    if (!this._childTitleForm.value) {
      return;
    }

    if (this._viewState === ViewState.Editing && !isNullOrUndefined(this._currentEditingChild)) {
      this._currentEditingChild.title = this._childTitleForm.value;
      this._currentEditingChild.field = this._childField;
      this._currentEditingChild.domainOnly = this._childIsDomainOnly;
      this._currentEditingChild.searchMask = result;
    } else {
      this._children.push({
        title: this._childTitleForm.value,
        field: this._childField,
        domainOnly: this._childIsDomainOnly,
        searchMask: result
      });
    }

    this._viewState = ViewState.Default;
  }

  public cancelSearchMask (): void {
    this._viewState = ViewState.Default;
  }

  public applyCard (): void {
    const cardBuilder = new CardRowBuilder();
    cardBuilder.setTitle(this._cardTitleForm.value);
    this._children.forEach(child => {
      const requestBuilder = this._apiService.getRequestBuilder();

      requestBuilder.setStartDatetime(pastDate(this._dashboardSettingsService.getPastHours()));
      requestBuilder.setEndpoint(
        createAdvancedEndpoint(
          child.field,
          this._dashboardSettingsService.getMaxItemCountPerCard(),
          child.domainOnly ? '@' : undefined)
      );
      child.searchMask.fields.forEach(field => requestBuilder.addField(field.name, field.value, field.comparator));

      let baseFields: RequestBuilderField;

      if (child.domainOnly) {
        baseFields = {
          name: child.field,
          value: '{value}$',
          comparator: new Comparator(ComparatorType.Regex)
        };
      } else {
        baseFields = {
          name: child.field,
          value: '{value}',
          comparator: new Comparator(ComparatorType.Equals)
        };
      }

      cardBuilder.addChild(child.title, [ baseFields ], requestBuilder);
    });

    this._dialogRef.close(cardBuilder.build());
  }
}
