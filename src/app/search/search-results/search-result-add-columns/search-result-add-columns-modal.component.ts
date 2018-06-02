import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatCheckboxChange, MatDialogRef } from '@angular/material';
import { SearchResultDetailsModalComponent } from '../search-result-details-modal/search-result-details-modal.component';
import { AddColumnsModalData } from './add-columns-modal-data';
import { SearchSettingsService } from '../../../settings/search-settings-service/search-settings.service';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';
import { unsubscribeIfDefined } from '../../../../utils/rxjs';
import { defaultDragulaOptions } from '../../../../utils/dragula';

@Component({
  selector: 'app-search-add-columns',
  templateUrl: './search-result-add-columns-modal.component.html',
  styleUrls: [ './search-result-add-columns-modal.component.scss' ]
})
export class SearchResultAddColumnsModalComponent implements OnInit, OnDestroy {
  private _onDropSubscription: Subscription;
  private _sortedColumns: Array<string>;

  public get bagName (): string {
    return 'search-table-settings-bag';
  }

  public get dragulaOptions (): any {
    return defaultDragulaOptions;
  }

  public get columns (): Array<string> {
    return this._sortedColumns;
  }

  public get displayedColumns (): Array<string> {
    return this._columnData.displayedColumns;
  }

  constructor (private _dialogRef: MatDialogRef<SearchResultDetailsModalComponent>,
               @Inject(MAT_DIALOG_DATA) private _columnData: AddColumnsModalData,
               private _searchSettingsService: SearchSettingsService,
               private _dragulaService: DragulaService) {
    this._sortedColumns = this._columnData.allColumns.slice().sort();
  }

  public ngOnInit (): void {
    this._onDropSubscription = this._dragulaService.drop.subscribe(() => this.onDropped());
  }

  public ngOnDestroy (): void {
    unsubscribeIfDefined(this._onDropSubscription);
  }

  public onDropped (): void {
    this._searchSettingsService.setVisibleColumns(this._columnData.displayedColumns);
  }

  public isDisplayed (column: string): boolean {
    return this._columnData.displayedColumns.indexOf(column) !== -1;
  }

  public changeDisplayState (event: MatCheckboxChange, column: string) {
    if (event.checked) {
      if (this._columnData.displayedColumns.indexOf(column) === -1) {
        this._columnData.displayedColumns.push(column);
      }
    } else {
      this._columnData.displayedColumns
        .splice(
          this._columnData.displayedColumns.indexOf(column),
          1);
    }

    this._searchSettingsService.setVisibleColumns(this._columnData.displayedColumns);
  }
}
