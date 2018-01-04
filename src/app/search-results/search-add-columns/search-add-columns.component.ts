import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatCheckboxChange, MatDialogRef } from '@angular/material';
import { SearchResultDetailsModalComponent } from '../search-result-details-modal/search-result-details-modal.component';
import { AddColumnsModalData } from './add-columns-modal-data';

@Component({
  selector: 'app-search-add-columns',
  templateUrl: './search-add-columns.component.html',
  styleUrls: [ './search-add-columns.component.scss' ]
})
export class SearchAddColumnsComponent implements OnInit {

  private sortedColumns: Array<string>;

  public get columns (): Array<string> {
    return this.sortedColumns;
  }

  constructor (private dialogRef: MatDialogRef<SearchResultDetailsModalComponent>,
               @Inject(MAT_DIALOG_DATA) private _columnData: AddColumnsModalData) {
    this.sortedColumns = this._columnData.allColumns.sort();
  }

  ngOnInit () {
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
  }
}
