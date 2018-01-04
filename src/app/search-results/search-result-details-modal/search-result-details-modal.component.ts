import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SearchRow } from '../../api/response/search-reponse';

@Component({
  selector: 'app-search-result-details-modal',
  templateUrl: './search-result-details-modal.component.html',
  styleUrls: [ './search-result-details-modal.component.scss' ]
})
export class SearchResultDetailsModalComponent implements OnInit {

  public get rowData (): SearchRow {
    return this._rowData;
  }

  public get rowKeys (): Array<string> {
    return Object.keys(this._rowData);
  }

  constructor (private dialogRef: MatDialogRef<SearchResultDetailsModalComponent>,
               @Inject(MAT_DIALOG_DATA) private _rowData: SearchRow) {
  }

  ngOnInit () {
  }

}
