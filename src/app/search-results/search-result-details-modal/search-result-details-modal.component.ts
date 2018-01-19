import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SearchRow, SearchRowValue } from '../../api/response/search-reponse';
import { Color } from 'chroma-js';
import * as chroma from 'chroma-js';
import { isNullOrUndefined } from 'util';

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

  public get loglines (): string {
    return this.formatLoglines();
  }

  public get hasLoglines (): boolean {
    for (const row of this._rows) {
      if (row.key === 'loglines') {
        return true;
      }
    }

    return false;
  }

  private _highlightedWords: Map<string, Color>;
  private _currentHighlightedColor: number;

  constructor (private dialogRef: MatDialogRef<SearchResultDetailsModalComponent>,
               @Inject(MAT_DIALOG_DATA) private _rowData: SearchRow) {
    this._highlightedWords = new Map<string, Color>();
    this._currentHighlightedColor = 0;

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

  public getHighlightColor (key: string): string {
    const color = this._highlightedWords.get(key);
    const val = isNullOrUndefined(color) ? '' : color.hex();

    return val;

  }

  public formatLoglines (): string {
    if (!this.hasLoglines) {
      return '';
    }

    const logs = this._rows.find(row => row.key === 'loglines');
    if (!(logs.value instanceof Array)) {
      return '';
    }

    let loglines = '';

    for (const line of logs.value) {
      loglines += line.toString()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;') + '<br>';
    }

    this._highlightedWords.forEach((color, word) => {
      loglines = loglines.replace(
        new RegExp(word, 'g'),
        `<span style=\"background-color: ${color.hex()};\">${word}</span>`);
    });

    return loglines;
  }

  public isArray (obj: object): boolean {
    return obj instanceof Array;
  }

  public onValueClick (value: string): void {
    if (this._highlightedWords.has(value)) {
      this._highlightedWords.delete(value);
    } else {
      this._highlightedWords.set(value, chroma.lch(100, 100, this._currentHighlightedColor));

      this._currentHighlightedColor += 20;
      this._currentHighlightedColor %= 180;
    }
  }
}
