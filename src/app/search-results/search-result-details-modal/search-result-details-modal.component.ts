import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SearchRow, SearchRowValue } from '../../api/response/search-reponse';
import { isNullOrUndefined } from 'util';
import { SaveObjectData } from '../../save-object/save-object-data';
import { JsonSaveStrategy } from '../../save-object/strategies/json-save-strategy';
import { PngSaveStrategy } from '../../save-object/strategies/png-save-strategy';
import { YamlSaveStrategy } from '../../save-object/strategies/yaml-save-strategy';
import { HighlightedWords } from './highlighted-words';

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
    return this._rows.find(row => row.key === 'loglines').value as string[];
  }

  public get hasLoglines (): boolean {
    for (const row of this._rows) {
      if (row.key === 'loglines') {
        return true;
      }
    }

    return false;
  }

  private _highlightedWords: HighlightedWords;
  public set highlightedWords (value: HighlightedWords) {
    if (isNullOrUndefined(value)) {
      return;
    }

    this._highlightedWords = value;
  }

  public get highlightedWords (): HighlightedWords {
    return this._highlightedWords;
  }

  private readonly _highlightedWordsChange: EventEmitter<HighlightedWords>;
  public get highlightedWordsChange (): EventEmitter<HighlightedWords> {
    return this._highlightedWordsChange;
  }

  constructor (private _dialogRef: MatDialogRef<SearchResultDetailsModalComponent>,
               @Inject(MAT_DIALOG_DATA) private _rowData: SearchRow) {
    this._highlightedWordsChange = new EventEmitter<HighlightedWords>();
    this._highlightedWords = new HighlightedWords();
    const keys = Object.keys(_rowData).sort();

    // move loglines to the end
    const loglinesIndex = keys.indexOf('loglines');
    if (loglinesIndex !== -1) {
      keys.splice(loglinesIndex, 1);
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

  private emitHighlightedWords (): void {
    this._highlightedWordsChange.emit(this._highlightedWords);
  }

  public isArray (obj: object): boolean {
    return obj instanceof Array;
  }

  public onValueClick (value: string): void {
    if (this._highlightedWords.hasValue(value)) {
      this._highlightedWords.removeValue(value);
    } else {
      this._highlightedWords.addValue(value);
    }

    // break reference so that the formatLogline pipe updates
    const h = this._highlightedWords;
    this._highlightedWords = new HighlightedWords();
    Object.assign(this._highlightedWords, h);

    this.emitHighlightedWords();
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

  public clearColors (): void {
    this._highlightedWords = new HighlightedWords();
    this.emitHighlightedWords();
  }
}
