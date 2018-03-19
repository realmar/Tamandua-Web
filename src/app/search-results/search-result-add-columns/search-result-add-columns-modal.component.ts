import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatCheckboxChange, MatDialogRef } from '@angular/material';
import { SearchResultDetailsModalComponent } from '../search-result-details-modal/search-result-details-modal.component';
import { AddColumnsModalData } from './add-columns-modal-data';
import { SearchSettingsService } from '../../settings/search-settings-service/search-settings.service';

@Component({
  selector: 'app-search-add-columns',
  templateUrl: './search-result-add-columns-modal.component.html',
  styleUrls: [ './search-result-add-columns-modal.component.scss' ]
})
export class SearchResultAddColumnsModalComponent implements OnInit {

  private sortedColumns: Array<string>;

  public get columns (): Array<string> {
    return this.sortedColumns;
  }

  public get displayedColumns (): Array<string> {
    return this._columnData.displayedColumns;
  }

  constructor (private dialogRef: MatDialogRef<SearchResultDetailsModalComponent>,
               @Inject(MAT_DIALOG_DATA) private _columnData: AddColumnsModalData,
               private searchState: SearchSettingsService) {
    this.sortedColumns = this._columnData.allColumns.slice().sort();
  }

  ngOnInit () {
  }

  /**
   * Called when the user drops a dragged item
   * @param event
   */
  public onDropped (event: any): void {
    this.searchState.setVisibleColumns(this._columnData.displayedColumns);
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

    this.searchState.setVisibleColumns(this._columnData.displayedColumns);
  }
}
