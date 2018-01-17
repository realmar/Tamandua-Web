import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SearchRow, SearchRowValue } from '../../api/response/search-reponse';

interface Row {
  key: string;
  value: SearchRowValue;
}

@Component({
  selector: 'app-search-result-details-modal',
  templateUrl: './search-result-details-modal.component.html',
  styleUrls: [ './search-result-details-modal.component.scss' ]
})
export class SearchResultDetailsModalComponent implements OnInit {

  private _rows: Array<Row>;
  public get rows (): Array<Row> {
    return this._rows;
  }

  constructor (private dialogRef: MatDialogRef<SearchResultDetailsModalComponent>,
               @Inject(MAT_DIALOG_DATA) private _rowData: SearchRow) {
    const keys = Object.keys(_rowData).sort();

    // move loglines to the end
    const logslinesIndex = keys.indexOf('loglines');
    if (logslinesIndex !== -1) {
      keys.splice(logslinesIndex, 1);
      keys.push('loglines');
    }

    this._rows = keys.map(key => {
      return {
        key: key,
        value: _rowData[ key ]
      };
    });
  }

  ngOnInit () {
  }

  public formatValue (row: Row): string {
    if (row.value instanceof Array) {
      let separator: string;
      if (row.key === 'loglines') {
        separator = '';
      } else {
        separator = ', ';
      }

      return row.value.join(separator);
    } else {
      return row.value.toString();
    }
  }
}
