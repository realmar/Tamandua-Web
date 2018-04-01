import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SearchRow, SearchRowValue } from '../../api/response/search-reponse';
import { isNullOrUndefined } from 'util';
import * as chroma from 'chroma-js';
import { Color } from 'chroma-js';
import { SaveObjectData } from '../../save-object/save-object-data';
import { JsonSaveStrategy } from '../../save-object/strategies/json-save-strategy';
import { PngSaveStrategy } from '../../save-object/strategies/png-save-strategy';
import { YamlSaveStrategy } from '../../save-object/strategies/yaml-save-strategy';

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

  private readonly _rows: Array<Row>;
  public get rows (): Array<Row> {
    return this._rows;
  }

  public get loglines (): Array<string> {
    const lines = this._rows.find(row => row.key === 'loglines').value as string[];
    return lines.map<string>(this.formatLogline.bind(this));
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

  constructor (private _dialogRef: MatDialogRef<SearchResultDetailsModalComponent>,
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

  private formatLogline (line: string): string {
    let formatted = line
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const pieces = formatted.split(' ');
    const dateHostService = pieces.slice(0, 5).join(' ');
    const rest = pieces.slice(5, pieces.length).join(' ');

    formatted = `<span class="code-date-host-service">${dateHostService}</span> ${rest}`;
    this._highlightedWords.forEach((color, word) => {
      formatted = formatted.replace(
        new RegExp(word, 'g'),
        `<span style=\"background-color: ${color.hex()};\">${word}</span>`);
    });

    return formatted;
  }

  public getHighlightColor (key: string): string {
    // const color = this._highlightedWords.get(key);
    const color = this._highlightedWords.get(key);
    const val = isNullOrUndefined(color) ? '' : color.hex();

    return val;

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

  public generateSaveDataObject (): SaveObjectData {
    const data = new Map<string, SearchRowValue>();

    for (const row of this._rows) {
      data.set(row.key, row.value);
    }

    return {
      filename: 'object',
      data: data,
      strategies: [
        new JsonSaveStrategy(),
        new YamlSaveStrategy(),
        new PngSaveStrategy()
      ]
    };
  }
}
